
window.addEventListener('SYS004003_M01', () => {
	SYS004003_M01.init();
	CMMN.include("SYS004003_P01"); // 팝업
})

const SYS004003_M01 = {
	targetElId: 'SYS004003_M01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();
		// grid 초기화
		this.gridInit();

		this.pageTo(1);

	},
	data: {
		selectCond: 'errLogHist_01',
		// 페이징처리 설정
		pageConfig: {
			page: 1,
			orders: [ { target: 'crtDtm', isAsc: false } ],
			limit:50,
		},
		// 페이징처리후 페이징정보
		paginator: {},
		// grid 설정 옵션
		gridOptions: {
			columnDefs: [  // grid 컬럼 정의
				{
					headerName: '요청ID',
					field: 'errLogid',
				},
				{
					headerName: '발생일자',
					field: 'occurDtm',
					valueGetter: 'data.occurDtm ? moment(data.occurDtm, "YYYYMMDD").format("YYYY.MM.DD") : ""',
				},
				{
					headerName: '메소드명',
					field: 'methNm',
				},
				{
					headerName: '처리구분',
					field: 'sysDlngCfcd',
				},
				{
					headerName: '처리시간',
					field: 'dlngTime',
				},
				{
					headerName: '요청자',
					field: 'reqr',
				},
			],
			defaultColDef: {  // 기본 컬럼정의
				flex: 1,  // 컬럼이동이 가능하게 한다.
				minWidth: 100,  // 각 컬럼당 최소넓이
				resizable: true,  // 컬럼사이즈 조정가능 여부
				sortable: true,  // 정렬가능 여부
			},
		},
		// grid 에서 선택된 데이터목록
		gridSelectedDataList: [],
		// grid 에서 클릭한 row의 데이터
		gridClickedData: {},
	},

	// 화면 UI 설정
	configUI: function() {

		//데이터피커사용
		$(`#${this.targetElId} [data-field='startDate']`).datepicker({
		    format: 'yyyy.mm.dd',
		    autoclose: true,
		    todayHighlight: true,
		    language: 'ko',
			startDate: new Date("1000-01-01"),
			endDate: new Date("9999-12-31"),
		}).on('changeDate', (e) => {
		    const selectedDate = e.date;
		    $(`#${this.targetElId} [data-field='endDate']`).datepicker('setStartDate', selectedDate);
		});

		$(`#${this.targetElId} [data-field='endDate']`).datepicker({
		    format: 'yyyy.mm.dd',
		    autoclose: true,
		    todayHighlight: true,
		    language: 'ko',
			startDate: new Date("1000-01-01"),
			endDate: new Date("9999-12-31"),
		}).on('changeDate', (e) => {
		    const selectedDate = e.date;
		    $(`#${this.targetElId} [data-field='startDate']`).datepicker('setEndDate', selectedDate);
		});

		const today = new Date();
		const startDate = new Date(today);
		startDate.setDate(startDate.getDate() - 7);

		$(`#${this.targetElId} [data-field='startDate']`).datepicker('setDate', startDate)
		$(`#${this.targetElId} [data-field='endDate']`).datepicker('setDate', new Date())
		$(`#${this.targetElId} [data-field='endDate']`).datepicker('setEndDate', new Date())

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
		//상세팝업을 연다 TODO
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

		const target = sortedColumns.length > 0 ? sortedColumns[0].field : 'mdfDtm';  // 정렬대상 셋팅
		const isAsc = sortedColumns.length > 0 ? sortedColumns[0].direction === "asc" : false;  // 오름차순여부 셋팅

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

		const startDate = document.querySelector(`#${this.targetElId} [name='startDate']`).value.replaceAll(".","");
		const endDate = document.querySelector(`#${this.targetElId} [name='endDate']`).value.replaceAll(".","");
		const searchClcd = document.querySelector(`#${this.targetElId} [name='searchClcd']`).value;

		const params = {
			startDate : startDate,
			endDate : endDate,
			sysDlngCfcd : searchClcd,
			pageConfig: this.data.pageConfig,
		}

		if(startDate == "" ||endDate == "" ){
			await CMMN.alert("날짜를 확인해주세요");
			return;
		}


		const response = await CMMN.api.post('/api/sys/ErrLogHistMng/getListPage', { params });

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

		document.querySelector(`#${this.targetElId} [name='SYS004003_M01_totalCount']`).innerText = '총 건수 : ' + CMMN.priceToString(this.data.paginator.totalCount);
	},

	// 팝업열기
	P01_open: function() {
		SYS004003_P01.open(
			this.data.gridClickedData,
			''
		);
	},

};