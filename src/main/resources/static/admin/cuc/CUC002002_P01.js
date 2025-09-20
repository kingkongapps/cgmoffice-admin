window.addEventListener('CUC002002_P01', () => {
	CUC002002_P01.init();
})

const CUC002002_P01 = {
	targetElId: 'CUC002002_P01',
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
		isNew: false,
		old_prdtChgYmd: null,

		// grid 설정 옵션
		gridOptions: {
			columnDefs: [  // grid 컬럼 정의
				/*{
					headerName: '보종코드',
					field: 'inskndCd',
					maxWidth: 120,
				},
				{
					headerName: '주계약/특약명',
					field: 'mncntrctSpccNm',
					maxWidth: 120,
				},
				{
					headerName: '순번',
					field: 'sn'
				},
				{
					headerName: '선택',
					field: 'selectYn',
					maxWidth: 120,
				},
				{
					headerName: '조합코드',
					field: 'sigumaCd',
					maxWidth: 110,
				},
				{
					headerName: '진수',
					field: 'mxtrClusCdBinToNum',
					maxWidth: 110,
				},*/
			],
			defaultColDef: {  // 기본 컬럼정의
				flex: 1,  // 컬럼이동이 가능하게 한다.
				minWidth: 100,  // 각 컬럼당 최소넓이
				resizable: true,  // 컬럼사이즈 조정가능 여부
			},
		},
		// grid 에서 클릭한 row의 데이터
		gridClickedData: {},  // grid 에서 클릭한 row의 데이터
	},
	// 화면 UI 설정
	configUI: function() {
	},
	// grid 초기화
	gridInit: function() {
		// row 클릭이벤트 발생시 리스너함수를 적용.
		// this.data.gridOptions.onCellClicked = this.gridOnCellClicked.bind(this);
		// grid 초기화
		/*new agGrid.Grid(
			document.querySelector(`#${this.targetElId} [data-field='indvClusCrtMppgLst']`),
			this.data.gridOptions
		);*/
		// this.data.gridOptions.api.setRowData([]);
	},
	// grid 셀 클릭 이벤트 발생
	gridOnCellClicked: function(event) {
		// 객체를 깊은복사를 진행한다.
		this.data.gridClickedData = JSON.parse(JSON.stringify(event.data));
		this.data.gridClickedData.rowIndex = event.rowIndex;

		// console.log('>>> selectedData: ', this.data.selectedData);
		this.setPopUiData(this.data.gridClickedData);
	},
	// 팝업을 연다.
	open: function(params, callbacks) {
		this.data.params = params;
		this.data.callbacks = callbacks || [];

		// 팝업의 내용을 셋팅한다.
		this.setPopUiData(this.data.params);

		// 팝업을 보여준다.
		CMMN.showModal(this.data.modal);

		//약관텍스트정보내역 상세 조회 (미리보기 CLOB 필드만)
		this.selectClusMergeTxt(this.data.params);
	},
	// 팝업의 내용을 셋팅한다.
	setPopUiData: function(data) {
		document.querySelector(`#${this.targetElId} [name='indvClusMergeaddId']`).value = data.indvClusMergeaddId;
		document.querySelector(`#${this.targetElId} [name='rcmYmd']`).value = data.rcmYmd;
		document.querySelector(`#${this.targetElId} [name='nprdtNm']`).value = data.nprdtNm;
		document.querySelector(`#${this.targetElId} [name='indvClusMxtrId']`).value = data.indvClusMxtrId;
		document.querySelector(`#${this.targetElId} [name='txtText']`).value = data.txtText;
	},
	// 약관텍스트정보내역 상세 조회 (미리보기 CLOB 필드만)
	selectClusMergeTxt: async function(data) {
		const params = {
			indvClusMergeaddId: data.indvClusMergeaddId,
			indvClusMxtrId: data.indvClusMxtrId,
		}

		const response = await CMMN.api.post('/api/cuc/clusCd/selectClusMergeTxt', { params });

		document.querySelector(`#${this.targetElId} [name='txtText']`).value = response.data;
	},
	close: function() {
		CMMN.hideModal(this.data.modal);
	},
	CUC002002_P01_callback: function(params) {
		// console.log('>>> CUC002002_P01_callback params: ', params);
	},
}