
window.addEventListener('SYS001003_M01', () => {
	SYS001003_M01.init();
	CMMN.include("SYS001003_P01"); // 팝업
})

const SYS001003_M01 = {
	targetElId: 'SYS001003_M01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();
		// grid 초기화
		this.gridInit();

		this.pageTo(1);
	},
	data: {
		selectCond: 'DtlCd_01',
		// 페이징처리 설정
		pageConfig: {
			page: 1,
			orders: [ { target: 'grpCd', isAsc: true },{ target: 'sortNo', isAsc: true } ],
			limit:50,
		},
		// 페이징처리후 페이징정보
		paginator: {},
		// grid 설정 옵션
		gridOptions: {
			columnDefs: [  // grid 컬럼 정의
				{
					headerCheckboxSelection: true,
					headerCheckboxSelectionFilteredOnly: true,
					checkboxSelection: true,
					maxWidth: 50,
					minWidth: 50,
					lockPosition: 'left', // 위치를 왼쪽으로 고정
					suppressMovable: true,  // 이동이 불가능하도록 설정
				},
				{
					headerName: '그룹코드',
					field: 'grpCd',
				},
				{
					headerName: '그룹코드명',
					field: 'grpCdNm',
				},
				{
					headerName: '코드',
					field: 'cd',
				},
				{
					headerName: '코드명',
					field: 'cdNm',
				},
				{
					headerName: '코드상세',
					field: 'cdDesc',
				},
				{
					headerName: '사용여부',
					valueGetter: 'data.useYn == "Y" ? "사용" : "미사용"',
					field: 'useYn',
				},
				{
					headerName: '순서',
					field: 'sortNo',
				},
			],
			defaultColDef: {  // 기본 컬럼정의
				flex: 1,  // 컬럼이동이 가능하게 한다.
				minWidth: 100,  // 각 컬럼당 최소넓이
				resizable: true,  // 컬럼사이즈 조정가능 여부
				sortable: true,  // 정렬가능 여부
			},
			suppressRowClickSelection: true,  // row 클릭으로 row가 선택처리되는 것을 막는다. 체크박스를 통해서만 선택이 가능해야 되기 때문...
			rowSelection: 'multiple', // 다중선택이 가능하게 한다.
		},
		// grid 에서 선택된 데이터목록
		gridSelectedDataList: [],
		// grid 에서 클릭한 row의 데이터
		gridClickedData: {},
	},

	// 화면 UI 설정
	configUI: function() {

		// tag UI 별 권한제어  (I:insert, S:select, U:update, D:delete, E:excel)
		CMMN.setAuthBtn(this.targetElId);

	},

	// grid01 초기화
	gridInit: function() {
		// 선택된 row들의 변경 이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions.onSelectionChanged = this.gridOnSelectionChanged.bind(this);
		// row 클릭이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions.onCellClicked = this.gridOnCellClicked.bind(this);
		// sorting 이벤트발생시 직접 제어할 함수 등록
		this.data.gridOptions.onSortChanged = this.gridOnSortChanged.bind(this);
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
		//상세팝업을 연다
		this.P01_open();

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

		const target = sortedColumns.length > 0 ? sortedColumns[0].field : 'grpCd';  // 정렬대상 셋팅
		const isAsc = sortedColumns.length > 0 ? sortedColumns[0].direction === "asc" : true;  // 오름차순여부 셋팅

		this.data.pageConfig.orders[0] = { target, isAsc };

		this.pageToFirst();
	},

	pageToFirst: function() {
		this.pageTo(1);
	},

	// 페이지 이동
	pageTo: function(page) {
		this.data.pageConfig.page = page;
		this.search();
	},
	//조회
	search: async function() {

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

		const searchClcd = document.querySelector(`#${this.targetElId} [name='searchClcd']`).value;
		const searchData = document.querySelector(`#${this.targetElId} [name='searchData']`).value;

		const params = {
			grpCdNm : searchClcd == '1' ? searchData : "",
			cd : searchClcd == '2' ? searchData : "",

			pageConfig: this.data.pageConfig,
		}

		const response = await CMMN.api.post('/api/sys/DtlCdMng/getListPage', { params });

		// grid 에 데이터를 표시한다.
		this.data.gridSelectedDataList = [];
		this.data.gridOptions.api.setRowData(response.data.list);

		// 페이징정보 추출
		this.data.paginator = response.data.paginator;

		// grid 하단의 페이징 표시처리
		CMMN.setPagination(
			`#${this.targetElId} [name='paginator']`,  // 페이징표시를 셋팅할 타겟
			this.data.paginator,  // 페이징정보
			this.pageTo.bind(this),  // 패이지이동시 실행할 함수
		)

		document.querySelector(`#${this.targetElId} [name='SYS001003_M01_totalCount']`).innerText = '총 건수 : ' + CMMN.priceToString(this.data.paginator.totalCount);
	},

	//삭제
	delete: async function() {

		if(this.data.gridSelectedDataList.length === 0) {
			await CMMN.alert('삭제할 대상을 선택하세요.');
			return;
		}
		if(!await CMMN.confirm('선택한 코드를 삭제하시겠습니까?')) {
			return;
		}

		const params = this.data.gridSelectedDataList;

		//신규등록 완료 후 주석제거 TODO
		await CMMN.api.post('/api/sys/DtlCdMng/deleteList', { params });

		this.pageToFirst();
	},

	//초기화버튼
	reset : async function(){

		document.querySelector(`#${this.targetElId} [name='searchClcd']`).value = '1'; //디폴트값으로 변경
		document.querySelector(`#${this.targetElId} [name='searchData']`).value = ''; //빈값으로 변경

		this.pageToFirst();

	},

	// 팝업 열기 TODO
	add: function() {
		this.data.gridClickedData = {};
		this.P01_open();
	},

	// 팝업열기
	P01_open: function() {
		SYS001003_P01.open(
			this.data.gridClickedData,
			[this.pageToFirst.bind(this)]
		);
	},

};














