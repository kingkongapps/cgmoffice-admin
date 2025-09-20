
window.addEventListener('FLE001001_P04', () => {
	FLE001001_P04.init();
})

const FLE001001_P04 = {
	targetElId: 'FLE001001_P04',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();

		// 팝업 인스턴스를 생성한다.
		this.data.modal = CMMN.genModal(
			document.getElementById(this.targetElId)
		);
		// 팝업을 마우스드래그로 이동이 가능하게 한다.
		CMMN.setModalDraggable(this.data.modal);
	},
	data: {
		modal: null,
		params: {},
		callbacks: [],
		// Quill에디터 인스턴스
		quill: null,
		// Quill에디터 설정옵션
		quill_editor_modules: {
			toolbar: [
				["bold", "italic", "underline", "strike"], // <strong>, <em>, <u>, <s>
				["blockquote", "code-block"], // <blockquote>, <pre class="ql-syntax" spellcheck="false">
				[{ header: 1 }, { header: 2 }], // <h1>, <h2>
				[{ list: "ordered" }, { list: "bullet" }],
				[{ script: "sub" }, { script: "super" }], // <sub>, <sup>
				[{ indent: "-1" }, { indent: "+1" }], // class제어
				[{ direction: "rtl" }], //class 제어
				[{ size: ["small", false, "large", "huge"] }], //class 제어 - html로 되도록 확인
				[{ header: [1, 2, 3, 4, 5, 6, false] }], // <h1>, <h2>, <h3>, <h4>, <h5>, <h6>, normal
				[{ font: [] }], // 글꼴 class로 제어
				[{ color: [] }, { background: [] }], //style="color: rgb(230, 0, 0);", style="background-color: rgb(230, 0, 0);"
				[{ align: [] }], // class
				// ["clean"],
				// ["link", "image", "video"],
			],
		},
		// html2pdf 설정옵션
		html2pdf_option: {
			margin: 0, // 다운로드된 pdf 파일의 마진 여백
			filename: null,
			// pdf 들어갈 영역을 사진을 찍어 변환 하는 이미지 퀄리티
			image: {
				type: 'jpeg',
				quality: 0.7
			},
			html2canvas: {
				//width: 793.7, // a4 width
				//height: 1122.5, // a4 height
				useCORS: true, // 영역 안에 로컬 이미지를 삽입 할 때 옵션 필요
				scrollY: 0, // 스크롤 이슈️
				scale: 1, // browsers device pixel ratio
				dpi: 100,
				letterRendering: false,
				allowTaint: false, // useCORS를 true로 설정시 반드시 allowTaint를 false 해주어야함
			},
			jsPDF: {
				unit: 'mm',
				format: 'a4',
				orientation: 'portrait'
			},
		},
	},
	// 화면 UI 설정
	configUI: function() {
		const selector_query = `#${this.targetElId} [name='editor']`;
		const el_editor = document.querySelector(selector_query);
		el_editor.style.overflowY = 'auto';
		el_editor.style.overflowX = 'auto';

		// Quill 에디터 초기화
		this.data.quill = new Quill(
			selector_query,
			{
				theme: 'snow',
				modules: this.data.quill_editor_modules,
			}
		);

		//텍스트 붙여 놓기 이벤트 추가
		document.querySelector('.ql-editor').removeEventListener('paste', (e) => {});
		document.querySelector('.ql-editor').addEventListener('paste', (e) => {
			e.preventDefault();
			const text = e.clipboardData.getData('text/plain');
			const quill = FLE001001_P04.data.quill;
			const range = quill.getSelection();
			if (range) {
				quill.insertText(range.index, text);
			}
		});
	},
	// 팝업을 연다.
	open: function(params, callbacks) {
		this.data.params = params;
		this.data.callbacks = callbacks || [];

		document.querySelector(`#${this.targetElId} [name='saveFileNm']`).value = '';
		const el_qlEditor = document.querySelector(`#${this.targetElId} .ql-editor`);
		el_qlEditor.style.backgroundSize = 'contain';
		el_qlEditor.style.height = '1122px';
		el_qlEditor.style.width = '793px';
		el_qlEditor.style.backgroundImage = ``;
		el_qlEditor.innerHTML = '';

		CMMN.showModal(this.data.modal);
	},
	close: function() {
		CMMN.hideModal(this.data.modal);
	},
	save: async function() {
		const el_saveFileNm = document.querySelector(`#${this.targetElId} [name='saveFileNm']`);
		const saveFileNm = el_saveFileNm.value;
		if (!saveFileNm) {
		    await CMMN.alert('다운로드할 파일명을 입력해 주세요.');
		    el_saveFileNm.focus();
		    return;
		}
		/*
		const { data: count } = await CMMN.api.get(`/api/cnt/prdtClusPdfMng/chkFileNmExist?fileNm=${saveFileNm}`);
		if(count >= 1) {
			if(!await CMMN.confirm(`입력하신 파일명은 존재합니다.<br/>덮어쓰기를 진행하시겠습니까?`)) {
				return;
			}
		}
		*/

		if(!await CMMN.confirm('저장하시겠습니까?')) return;

		this.data.html2pdf_option.filename = saveFileNm;

		const editorContent = document.querySelector(`#${this.targetElId} [name='editor'] .ql-editor`);

		// PDF를 Blob으로 생성
		const pdfBlob = await html2pdf()
		    .set(this.data.html2pdf_option)
		    .from(editorContent)
		    .outputPdf('blob');  // blob으로 출력

		const params = { pdfBlob, saveFileNm };
		await CMMN.api.post('/api/cnt/prdtClusPdfMng/addNew', { params });

		if(this.data.callbacks[0]) {
			this.data.callbacks[0]();
		}
		this.close();
	},
	download: async function() {
		const el_saveFileNm = document.querySelector(`#${this.targetElId} [name='saveFileNm']`);
		const saveFileNm = el_saveFileNm.value;
		if(!saveFileNm) {
			await CMMN.alert('다운로드할 파일명을 입력해 주세요.');
			el_saveFileNm.focus();
			return;
		}

		if(saveFileNm.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣ]/g, '').length > 66) {
			await CMMN.alert('다운로드할 파일명을 한글 66자 이하로 입력해주세요.');
			return;
		}

		this.data.html2pdf_option.filename = saveFileNm;

		const editorContent = document.querySelector(`#${this.targetElId} [name='editor'] .ql-editor`);

		// html2pdf 로 PDF 생성 및 다운로드
		html2pdf()
			.set(this.data.html2pdf_option)
			.from(editorContent)
			.save();
	},
	selectImage: function() {
		const el_bakimg = document.querySelector(`#${this.targetElId} [name='bakimg']`);
		const bakimg = el_bakimg.files[0];
		if (!bakimg) return;

		el_bakimg.value = '';  // 첨부input 을 초기화 한다.

		/*
		console.log('파일 이름:', bakimg.name);  // 예: myphoto.png
		console.log('파일 타입:', bakimg.type);  // 예: image/png, image/jpeg
		console.log('파일 크기:', bakimg.size);  // 바이트 단위
		*/

		// 선택된 이미지파일에서 base64 값을 추출한다.
		const reader = new FileReader();
		reader.onload = (e) => {
			const base64String = e.target.result;
			// console.log('Base64:', base64String);

			const el_qlEditor = document.querySelector(`#${this.targetElId} .ql-editor`);
			el_qlEditor.style.backgroundImage = `url('${base64String}')`;

		};

		reader.readAsDataURL(bakimg); // 이 부분이 base64 변환 포인트!
	},
}