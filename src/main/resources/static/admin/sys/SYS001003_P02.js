
window.addEventListener('SYS001003_P02', () => {
	SYS001003_P02.init();
})

const SYS001003_P02 = {
	targetElId: 'SYS001003_P02',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();
		// grid 초기화
		this.gridInit();

		this.search();


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

		selectCond: 'grpCd_01',
		// grid 설정 옵션
		gridOptions: {
			columnDefs: [  // grid 컬럼 정의
				{
					headerName: '그룹코드',
					field: 'grpCd',
				},
				{
					headerName: '그룹명',
					field: 'grpCdNm',
				},
				{
					headerName: '그룹상세',
					field: 'grpDesc',
				},
				{
					headerName: '사용여부',
					valueGetter: 'data.useYn == "Y" ? "사용" : "미사용"',
					field: 'useYn',
				},
			],
			defaultColDef: {  // 기본 컬럼정의
				flex: 1,  // 컬럼이동이 가능하게 한다.
				minWidth: 100,  // 각 컬럼당 최소넓이
				resizable: true,  // 컬럼사이즈 조정가능 여부
				sortable: true,  // 정렬가능 여부
				rowSelection: 'single'
			},
		},
		// grid 에서 선택된 데이터목록
		gridSelectedDataList: [],
		// grid 에서 클릭한 row의 데이터
		gridClickedData: {},
	},
	// 화면 UI 설정
	configUI: function() {

	},

	// grid01 초기화
	gridInit: function() {
		// 선택된 row들의 변경 이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions.onSelectionChanged = this.gridOnSelectionChanged.bind(this);
		// row 클릭이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions.onCellClicked = this.gridOnCellClicked.bind(this);
		// sorting 이벤트발생시 직접 제어할 함수 등록
		this.data.gridOptions.onSortChanged = this.gridOnSortChanged.bind(this);

		//더블클릭 이벤트 TODO
		this.data.gridOptions.onCellDoubleClicked = this.onCellDoubleClicked.bind(this)


		// grid 초기화
		new agGrid.Grid(
			document.querySelector(`#${this.targetElId} [name='table-content']`),
			this.data.gridOptions
		);
		this.data.gridOptions.api.setRowData([]);
	},
	// grid 선택이벤트 발생
	gridOnSelectionChanged: function(event) {
		this.data.gridSelectedDataList = [];
		event.api.getSelectedNodes().forEach(item => this.data.gridSelectedDataList.push(item.data));
	},
	// grid 셀 클릭 이벤트 발생
	gridOnCellClicked: function(event) {
		// 클릭된 타겟 cell 의 field값을 추출( 체크박스클릭의 경우는 적용을 제외하기 위해 )
		if(!event.colDef.field)  return;

		// 객체를 깊은복사를 진행한다.
		this.data.gridClickedData = JSON.parse(JSON.stringify(event.data));

	},
	// grid 정렬이벤트 발생
	gridOnSortChanged: function(params) {
		// 정렬대상 컬럼 추출
		const sortedColumns = params.columnApi.getAllColumns()
			.filter(col => col.getSort())
			.map(col => ({
				field: col.getColDef().field,
				direction: col.getSort()
			}));
		//console.log("정렬 정보:", sortedColumns);

		const target = sortedColumns.length > 0 ? sortedColumns[0].field : 'mdfDtm';  // 정렬대상 셋팅
		const isAsc = sortedColumns.length > 0 ? sortedColumns[0].direction === "asc" : false;  // 오름차순여부 셋팅

		this.data.pageConfig.orders[0] = { target, isAsc };
		this.pageToFirst();
	},

	//더블클릭이벤트
	onCellDoubleClicked: function(event) {

		//닫고 팝업에 해당 값을 셋팅 하기
		this.check();

	},

	// 팝업을 연다.
	open: function(params, callbacks) {
		this.data.params = params;
		this.data.callbacks = callbacks || [];

		console.log(params);

		// 팝업을 보여준다.
		CMMN.showModal(this.data.modal);
	},

	//닫기, 취소버튼
	close: function() {
		CMMN.hideModal(this.data.modal);
	},

	//조회
	search: async function() {

		const searchClcd = document.querySelector(`#${this.targetElId} [name='searchClcd']`).value;
		const searchData = document.querySelector(`#${this.targetElId} [name='searchData']`).value;

		const params = {
			grpCd : searchClcd == '1' ? searchData : "",
			grpCdNm : searchClcd == '2' ? searchData : "",
		}


		const response = await CMMN.api.post('/api/sys/GrpCdMng/getList', { params });

		// grid 에 데이터를 표시한다.
		this.data.gridSelectedDataList = [];
		this.data.gridOptions.api.setRowData(response.data);

		document.querySelector(`#${this.targetElId} [name='SYS001003_P02_totalCount']`).innerText = '총 건수 : ' + response.data.length;

	},

	//확인
	check : async function(){

		if(this.data.gridClickedData.grpCd == 'CMPNY_CODE'){
			await CMMN.alert('회사코드는 회사관리에서 등록, 수정해주세요');
			return;
		}

		this.close();  // 팝업을 닫는다.

		//콜백
		if(this.data.callbacks[0]) {
			this.data.callbacks[0](this.data.gridClickedData);
		}
	},

};














