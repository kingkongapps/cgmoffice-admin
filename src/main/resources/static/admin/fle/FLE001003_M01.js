window.addEventListener('FLE001003_M01', () => {
	FLE001003_M01.init();
})

const FLE001003_M01 = {
	targetElId: 'FLE001003_M01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 목차 선택팝업
		CMMN.include("FLE001003_P01");

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
		taskDir: '-',
		inputPdf: '',
		resList: [],
		pageList: [],
	},
	// 화면 UI 설정
	configUI: function() {

	},
	// 체크 박스를 shift 키로 체크한다.
	shiftCheck: function() {
		const checkboxes = document.querySelectorAll(`#${this.targetElId} [name='split_pdf']`);
		let lastChecked = null;

		checkboxes.forEach((checkbox) => {
			checkbox.addEventListener('click', (e) => {
				let inBetween = false;

				if (e.shiftKey && lastChecked) {
						checkboxes.forEach((cb) => {
						if (cb === checkbox || cb === lastChecked) {
							inBetween = !inBetween;
						}

						if (inBetween) {
							cb.checked = lastChecked.checked; // 상태를 기준으로 맞춰줌
						}
					});
				}

				lastChecked = checkbox;
			});
		});
	},
	// 팝업을 연다.
	open: function(params, callbacks) {
		this.data.params = params;
		this.data.callbacks = callbacks || [];

		document.querySelector(`#${this.targetElId} [name='pdf-preview']`).innerHTML = '';
		document.querySelector(`#${this.targetElId} [name='pdfFile-name']`).value = '';
		document.querySelector(`#${this.targetElId} [name='tool-bar']`).style.display = 'none';

		// 팝업을 보여준다.
		CMMN.showModal(this.data.modal);
	},
	close: async function() {
		CMMN.hideModal(this.data.modal);
	},
	pdfFileSplit: async function() {
		// 미리보기 초기화
		document.querySelector(`#${this.targetElId} [name='pdf-preview']`).innerHTML = '';

		const el_pdfFile = document.querySelector(`#${this.targetElId} [name='pdf-file']`);
		const inputPdf = el_pdfFile.files[0];
		if (!inputPdf) return;

		this.data.inputPdf = inputPdf;

		const fileNm = inputPdf.name;
		const ext = fileNm.toLowerCase().substring(fileNm.lastIndexOf('.') + 1, fileNm.length)
		if(ext !== 'pdf') {
			await CMMN.alert('PDF파일만 선택이 가능합니다.');
			return;
		}

		document.querySelector(`#${this.targetElId} [name='pdfFile-name']`).value = fileNm;

		const params = { inputPdf };
		const response = await CMMN.api.post('/api/cnt/prdtClusPdfMng/split', { params });
		el_pdfFile.value = '';  // pdf파일 첨부input 을 초기화 한다.
		console.log('>>> response: ', response);

		const previewListSize = response.data.previewList.length;
		this.data.taskDir = response.data.taskDir;
		document.querySelector(`#${this.targetElId} [name='pdf-preview']`).innerHTML
			= response.data.previewList.reduce((prev, curr) => {

				const sort = curr.sort;
				if(sort % 6 == 0) {
					prev += `
						<div class="row">
					`;
				}
				prev += `
							<div class="col-md-2 mb-3">
								<div class="card">
									<div
										class="card-body p-1"
										style="cursor: pointer;"
										onclick="${this.targetElId}.viewPreviewPdf('${curr.tmpFileNm}', ${curr.sort + 1})"
									>
										<img src="data:image/png;base64,${curr.previewBase64}" style="width: 100%;"/>
									</div>
									<div
										class="card-footer"
										style="text-align:center; cursor: pointer;"
										onclick="document.querySelector('#p_${curr.sort + 1}').click()"
									>
										<label `
										if(curr.isMainPage == "Y"){
											prev += `style="font-size: 13px; cursor: pointer; font-weight: bold;"`;
										} else {
											prev += `style="font-size: 13px; cursor: pointer;"`;
										}
									prev +=	`>Page ${curr.sort + 1}</label>
										<input
											class="form-check-input ms-1"
											id="p_${curr.sort + 1}"
											type="checkbox"
											data-filenm="${curr.tmpFileNm}"
											onclick="event.stopPropagation()"
											name="split_pdf"
									`;
									if(curr.isMainPage == "N"){
										prev += `style="display: none;"`;
									}
				prev +=
							`
								/>
							</div>
						</div>
					</div>
				`;
				// 6번째 요소이거나, 마지막 요소일 경우
				if( (sort % 6 == 5) || (previewListSize == (sort + 1)) ){
					prev += `
						</div>
						`;
				}
				return prev;
			}, '');

		document.querySelector(`#${this.targetElId} [name='tool-bar']`).style.display = '';

		// 체크 박스를 shift 키로 체크한다.
		this.shiftCheck();
	},
	// 특정 PDF의 미리보기
	viewPreviewPdf: async function(tmpFileNm, page) {
		const response = await CMMN.api.get(`/api/cnt/prdtClusPdfMng/previewTmp?taskDir=${this.data.taskDir}&tmpFileNm=${tmpFileNm}`);
		console.log('>>> response: ', response);

		const base64 = response.data;

		// 미리보기 공통팝업을 이용해서 오픈
		CMN000000_P01.open(
			{ base64, page },
			[]
		)
	},
	// 목차 리스트를 추출한다.
	getTocList: async function() {
		const fileNmList = [], pageList = [];
		document.querySelectorAll(`#${this.targetElId} [name='split_pdf']`).forEach((el, idx) => {
			if(el.checked) {
				const filenm = el.getAttribute('data-filenm');
				fileNmList.push(filenm);
				pageList.push(idx + 1);
			}
		});

		if(fileNmList.length == 0) {
			await CMMN.alert('목차 리스트를 추출 할 페이지를 선택하세요.');
			return;
		}

		this.data.pageList = pageList;

		const inputPdf = this.data.inputPdf;
		const saveFileNm = "temp";

		const params = {
			taskDir: this.data.taskDir, // 분할된 pdf가 존재하는 서버측 임시작업폴더
			fileNmList,  // 합본할 PDF 목록
			saveFileNm, // 저장할 파일명
			pageList,
			inputPdf,
		}

		const options = { params }

		const response = await CMMN.api.post(`/api/cnt/prdtClusPdfMng/getTocList`, options);

		let tocList = response.data;

		if(tocList.length == 0){
			await CMMN.alert('목차가 존재하지 않는 페이지 입니다.');
			return;
		}

		let pTocList = [];

		for(let i = 0; i < tocList.length; i++){
			let title = tocList[i].title;
			let startPage = Number(tocList[i].number);
			let endPage = (i < tocList.length - 1) ? (Number(tocList[i].number) < Number(tocList[i + 1].number) ? Number(tocList[i + 1].number) - 1 : Number(tocList[i + 1].number)) : tocList[i].totalPages;
			let firstPage = tocList[i].firstPage + 1;
			let idx = tocList[i].idx;
			let number = tocList[i].number;
			let totalPages = tocList[i].totalPages;

			pTocList.push({totalPages : totalPages, number : number, title : title, startPage : startPage, endPage : endPage, firstPage : firstPage, idx : idx});
		}

		this.data.pTocList = pTocList;

		// 모든 pdf 미리보기 선택을 해제
		document.querySelectorAll(`#${this.targetElId} [name='split_pdf']`).forEach(el => el.checked = false);

		this.FLE001003_P01_open();
	},
	// 팝업열기
	FLE001003_P01_open: async function() {
		FLE001003_P01.open(
			{pTocList : this.data.pTocList, pageList : this.data.pageList, inputPdf : this.data.inputPdf},
			[]
		);
	},
}