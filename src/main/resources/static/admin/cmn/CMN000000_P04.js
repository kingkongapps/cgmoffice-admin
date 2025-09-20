
window.addEventListener('CMN000000_P04', () => {
	CMN000000_P04.init();
})

const CMN000000_P04 = {
	targetElId: 'CMN000000_P04',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();
		// grid 초기화
		this.gridInit();
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

		// grid 설정 옵션
		gridOptions: {
			columnDefs: [  // grid 컬럼 정의
				{
					headerName: '보험사(회사코드)',
					valueGetter: 'data.cmpnyNm + "(" + data.cmpnyCode + ")"',
					field: 'cmpnyCode',
					maxWidth: 160,
				},
				{
					headerName: '주계약상품명',
					field: 'nprdtNm',
				},
			],
			defaultColDef: {  // 기본 컬럼정의
				resizable: true,  // 컬럼사이즈 조정가능 여부
				minWidth: 100,  // 각 컬럼당 최소넓이
				flex: 1,  // 컬럼이동이 가능하게 한다.
				sortable: true,  // 정렬가능 여부
			},
			rowSelection: 'single',
		},
		// grid 에서 클릭한 row의 데이터
		gridClickedData: {},
	},
	// 화면 UI 설정
	configUI: function() {
		// 보험사 공통코드를 추출한다.
		const cmpnyCode = CMMN.getCmmnCd('CMPNY_CODE');
		// 검색란의 보험사 공통코드 dropdown 을 셋팅한다.
		document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`).innerHTML
			= cmpnyCode
				.sort((a, b) => a.cdNm.localeCompare(b.cdNm))
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.cd}">${curr.cdNm}</option>` );
				}, '<option value="">= 보험사 전체 =</option>');
		$(`#${this.targetElId} [name='searchCmpnyCode']`).select2( {
			theme: "bootstrap-5",
			width: $( this ).data( 'width' ) ? $( this ).data( 'width' ) : $( this ).hasClass( 'w-100' ) ? '100%' : 'style',
			placeholder: $( this ).data( 'placeholder' ),
			dropdownParent: $(`#${this.targetElId}`),
		} );

		// 상품구분 공통코드를 추출한다.
		const prdtCfcd = CMMN.getCmmnCd('PRDT_CFCD');
		// 검색란의 상품구분 공통코드 dropdown 을 셋팅한다.
		document.querySelector(`#${this.targetElId} [name='searchPrdtCfcd']`).innerHTML
			= prdtCfcd
				.sort((a, b) => a.cdNm.localeCompare(b.cdNm))
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.cd}">${curr.cdNm}</option>` );
				}, '<option value="">= 상품구분 선택 =</option>');
	},
	// grid 초기화
	gridInit: function() {
		// row 클릭이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions.onCellClicked = this.gridOnCellClicked.bind(this);
		// row 더블클릭이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions.onRowDoubleClicked = this.gridOnRowDoubleClicked.bind(this);
		// grid 초기화
		new agGrid.Grid(
			document.querySelector(`#${this.targetElId} [name='table-content']`),
			this.data.gridOptions
		);
		this.data.gridOptions.api.setRowData([]);
	},
	// grid 셀 클릭 이벤트 발생
	gridOnCellClicked: function(event) {
		//console.log('클릭한 행:', event.data);
		// 객체를 깊은복사를 진행한다.
		this.data.gridClickedData = JSON.parse(JSON.stringify(event.data));
	},
	gridOnRowDoubleClicked: function(event) {
		// console.log('더블클릭한 행:', event.data);
		// 객체를 깊은복사를 진행한다.
		this.data.gridClickedData = JSON.parse(JSON.stringify(event.data));
		this.save();
	},
	// 팝업을 연다.
	open: function(params, callbacks) {
		this.data.params = params;
		this.data.callbacks = callbacks || [];

		// 팝업의 내용을 셋팅한다.
		this.setPopUiData();

		CMMN.showModal(this.data.modal);
	},
	setPopUiData: function() {
		// 상품구분란 초기화
		document.querySelector(`#${this.targetElId} [name='searchPrdtCfcd']`).value='';

		// 보험사란 초기화 및 변경 trigger
		$(document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`))
			.val('')
			.trigger('change');
		// 그리드데이터를 초기화한다.
		this.data.gridOptions.api.setRowData([]);

		if(!CMMN.isEmpty(this.data.params) && !CMMN.isEmpty(this.data.params.menuCd)){
			const menuCd = this.data.params.menuCd;
			if(menuCd == "CNT002002_M01"){
				// 팝업에서 물고온 파라미터를 세팅한다.
				const cmpnyCode = !CMMN.isEmpty(this.data.params) && !CMMN.isEmpty(this.data.params.cmpnyCode) ? this.data.params.cmpnyCode : "";
				const cmpnyNm = !CMMN.isEmpty(this.data.params) && !CMMN.isEmpty(this.data.params.cmpnyNm) ? this.data.params.cmpnyNm : "";

				document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`).value = cmpnyCode;

				if(!CMMN.isEmpty(cmpnyNm)){
					document.querySelector(`#${this.targetElId} [id^='select2-searchCmpnyCode']`).title = cmpnyNm;
					document.querySelector(`#${this.targetElId} [id^='select2-searchCmpnyCode']`).innerText = cmpnyNm;
				}

				const prdtCfcd =  !CMMN.isEmpty(this.data.params) && !CMMN.isEmpty(this.data.params.prdtCfcd) ? this.data.params.prdtCfcd : "";

				document.querySelector(`#${this.targetElId} [name='searchPrdtCfcd']`).value = prdtCfcd;
			}
		}

		// 슈퍼관리자그룹이 아닐경우...
		if(CMMN.user.authGrpCd !== '100') {
			const comCode = CMMN.user.comCode;
			const comName = CMMN.user.comName;
			$(`#${this.targetElId} [name='searchCmpnyCode']`).val(comCode).trigger('change');
			document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`).disabled = true;
		}
	},
	// 팝업을 닫는다.
	close: function() {
		CMMN.hideModal(this.data.modal);
	},
	// 저장
	save: async function() {
		if(CMMN.isEmpty(this.data.gridClickedData)) {
			CMMN.alert('주계약을 선택해주세요.')
			return;
		}

		if(this.data.params.prdtCd_old
			&& !await CMMN.confirm('기존의 상품약관 작업내용을 초기화 하시겠습니까?')) {
			return;
		}

		if(this.data.callbacks[0]) {
			this.data.callbacks[0](this.data.gridClickedData);
		}

		//클릭 데이터 초기화
		this.data.gridClickedData = {};

		this.close();
	},
	// 검색
	search: async function() {
		let cmpnyCode = "";
		let prdtCfcd = "";

		if(!CMMN.isEmpty(this.data.params) && !CMMN.isEmpty(this.data.params.menuCd)){
			const menuCd = this.data.params.menuCd;
			if(menuCd == "CNT002002_M01" && (!CMMN.isEmpty(this.data.params.cmpnyCode) || !CMMN.isEmpty(this.data.params.prdtCfcd))){
				cmpnyCode = this.data.params.cmpnyCode;
				prdtCfcd = this.data.params.prdtCfcd;
			} else {
				cmpnyCode = document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`).value;
				prdtCfcd = document.querySelector(`#${this.targetElId} [name='searchPrdtCfcd']`).value;
			}
		} else {
			cmpnyCode = document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`).value;
			prdtCfcd = document.querySelector(`#${this.targetElId} [name='searchPrdtCfcd']`).value;
		}

		const mnspccCfcd = "1"; // 주계약
		const params = { cmpnyCode, prdtCfcd, mnspccCfcd };

		const response = await CMMN.api.post('/api/cnt/prdtMng/getList', { params });
		console.log('>>> response:', response);
		console.log('>>> CMMN.user:', CMMN.user);

		if('CMMN' != CMMN.user.comCode){
			response.data = response.data.filter(d => d.cmpnyCode == CMMN.user.comCode);
		}

		response.data
			.sort((a, b) => a.cmpnyNm.localeCompare(b.cmpnyNm))
			.sort((a, b) => a.nprdtNm.localeCompare(b.nprdtNm))

		this.data.gridOptions.api.setRowData(response.data);

		if(!CMMN.isEmpty(this.data.params)){
			//파라미터로 물고온 값 삭제 [초기화를 해주지 않으면 파라미터로 물고온 값으로 계속 조회한다.]
			delete this.data.params.cmpnyCode;
			delete this.data.params.prdtCfcd;
		}
	},
}