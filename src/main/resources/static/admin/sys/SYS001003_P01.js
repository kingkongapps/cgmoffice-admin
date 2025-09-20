
window.addEventListener('SYS001003_P01', () => {
	SYS001003_P01.init();
	CMMN.include("SYS001003_P02"); // 팝업
})

const SYS001003_P01 = {
	targetElId: 'SYS001003_P01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();

		// 팝업 인스턴스를 생성한다.
		this.data.modal = CMMN.genModal(
			document.getElementById(this.targetElId)
		);

	},
	data: {
		modal: null,
		params: {},
		callbacks: [],
		isNew: false,
		old_prdtChgYmd: null,

	},
	// 화면 UI 설정
	configUI: function() {

		//순서에 이벤트(숫자 이외는 제거)
		document.querySelector(`#${this.targetElId} [name='sortNo']`).addEventListener("input", function () {
		    this.value = this.value.replace(/[^0-9]/g, ''); // 숫자 이외 제거
		});

		// 각 입력단의 값이 변경될때마다 data.params 의 해당 데이터를 실시간 변경하도록 설정
		document.querySelectorAll(`#${this.targetElId} [data-field]`).forEach(el => {
			el.addEventListener('change', (event) => {
				const target = event.target
				const dataField = target.getAttribute('data-field');
				const dataType = target.getAttribute('data-type');
				if(dataType !== 'date') {
					this.data.params[dataField] = target.value;
				}
			})
		});

		// tag UI 별 권한제어  (I:insert, S:select, U:update, D:delete, E:excel)
		CMMN.setAuthBtn('SYS001003_M01');

	},

	// 팝업을 연다.
	open: function(params, callbacks) {
		this.data.params = params;
		this.data.callbacks = callbacks || [];

		console.log(params);

		//신규등록여부 셋팅
		this.data.isNew = params.cd ? false : true;

		document.querySelector(`#${this.targetElId} [name='title']`)
			.innerText = this.data.isNew ? '상세코드등록' : '상세코드수정/상세';

		if(this.data.isNew){
			document.querySelector(`#${this.targetElId} [name='save']`).setAttribute('data-auth', 'I');
		}else{
			document.querySelector(`#${this.targetElId} [name='save']`).setAttribute('data-auth', 'U');
		}

		document.querySelector(`#${this.targetElId} [name='cd']`).disabled = this.data.isNew ? false : true;

		// tag UI 별 권한제어  (I:insert, S:select, U:update, D:delete, E:excel)
		CMMN.setAuthBtn('SYS001003_M01');

		//팝업내용 셋팅
		this.setPopUiData(this.data.params);

		// 팝업을 보여준다.
		CMMN.showModal(this.data.modal);
	},
	// 팝업 내용 셋팅
	setPopUiData: function(data) {

		//데이터 셋팅
		document.querySelectorAll(`#${this.targetElId} [data-field]`).forEach(el => {
			const dataField = el.getAttribute('data-field');

			if(this.data.isNew) {
				el.value = '';
			} else {
				el.value = data[dataField] || '';
			}

		});


		if(data.useYn == '' || data.useYn == null){
			document.querySelector(`#${this.targetElId} [name='useYn']`).value = 'N';
			this.data.params.useYn = 'N';
		}

	},

	//닫기, 취소버튼
	close: function() {
		CMMN.hideModal(this.data.modal);
	},

	//코드 변경시
	change : async function(){

		//히든값이랑 같은지 비교
		const cdData = document.querySelector(`#${this.targetElId} [name='cd']`).value;
		const cdHidden = document.querySelector(`#${this.targetElId} [name='cdHidden']`).value;
		const levSeq = document.querySelector(`#${this.targetElId} [name='levSeq']`).value;
		const useYn = document.querySelector(`#${this.targetElId} [name='useYn']`).value;

		this.data.params.levSeq = levSeq;
		this.data.params.useYn = useYn;


		if(cdData != cdHidden){
			//등록과 동일하게 초기화
			document.querySelector(`#${this.targetElId} [name='title']`).innerText = '코드 등록'; //타이틀 변경

			this.data.isNew = true; //신규등록으로 수정

		}else{
			document.querySelector(`#${this.targetElId} [name='title']`).innerText = '코드 상세'; //타이틀 변경

			this.data.isNew = false; //신규등록으로 수정
		}

		if(this.data.isNew){
			document.querySelector(`#${this.targetElId} [name='save']`).setAttribute('data-auth', 'I');
		}else{
			document.querySelector(`#${this.targetElId} [name='save']`).setAttribute('data-auth', 'U');
		}

		// tag UI 별 권한제어  (I:insert, S:select, U:update, D:delete, E:excel)
		CMMN.setAuthBtn(this.targetElId);


	},

	//저장
	save : async function(){

		//밸리데이션 체크
		if(!this.data.params.cd){
			await CMMN.alert("코드를 확인 해주세요.");
			return
		}

		if(!this.data.params.grpCd){
			await CMMN.alert("그룹코드를 확인 해주세요.");
			return
		}
		if(!this.data.params.cdNm){
			await CMMN.alert("코드상세명을 확인 해주세요.");
			return
		}
		if(!this.data.params.useYn){
			await CMMN.alert("사용여부를 확인 해주세요.");
			return
		}
		if(!this.data.params.sortNo){
			await CMMN.alert("순서를 확인 해주세요.");
			return
		}
		if(!this.data.params.levSeq){
			await CMMN.alert("코드레벨을 확인 해주세요.");
			return
		}

		const params = this.data.params;
		console.log(params);
		console.log(this.data.isNew);



		//신규일때(저장 전 아이디체크 다시 하기)
		if(this.data.isNew){
			//중복확인하기
			const response = await CMMN.api.post('/api/sys/DtlCdMng/selectCdYn', { params });
			if(response.data) {
				await CMMN.alert("중복된 상세코드 입니다.");
				return;
			}

			console.log(response);
		}


		//등록할건지 확인창
		const confirmMsg =  `입력한 내용을 ${this.data.isNew ? '등록' : '수정'} 하시겠습니까?`;
		if(!await CMMN.confirm(confirmMsg)) {
			return;
		}

		//저장하기
		if(this.data.isNew){
			//신규등록
			await CMMN.api.post('/api/sys/DtlCdMng/insertList', { params });
		}else{
			//수정등록
			await CMMN.api.post('/api/sys/DtlCdMng/updateList', { params });

		}

		await CMMN.alert("저장이 완료되었습니다.");

		//등록완료 후 팝업닫기
		this.close();  // 팝업을 닫는다.

		//콜백
		if(this.data.callbacks[0]) {
			this.data.callbacks[0]();
		}
	},


	// 팝업열기
	P02_open: function() {
		SYS001003_P02.open(
			'',
			[this.setData.bind(this)]
		);
	},

	//그룹코드 셋팅
	setData : function(data){

		//그룸코드, 그룹명 param값에도 셋팅
		document.querySelector(`#${this.targetElId} [name='grpCd']`).value = data.grpCd;
		document.querySelector(`#${this.targetElId} [name='grpCdNm']`).value = data.grpCdNm;
		this.data.params.grpCd = data.grpCd;
		this.data.params.grpCdNm = data.grpCdNm;

	},

};














