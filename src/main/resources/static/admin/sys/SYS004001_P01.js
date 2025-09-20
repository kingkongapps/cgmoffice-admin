
window.addEventListener('SYS004001_P01', () => {
	SYS004001_P01.init();
})

const SYS004001_P01 = {
	targetElId: 'SYS004001_P01',
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

		// grid 설정 옵션
		gridOptions: {
			columnDefs: [  // grid 컬럼 정의
				{
					headerName: '메뉴코드',
					field: 'menuCd',
				},
				{
					headerName: '메뉴명',
					field: 'menuNm',
				},
				{
					headerName: '상위메뉴코드',
					field: 'upprMenuCd',
				},
				{
					headerName: '메뉴유형',
					field: 'menuTypCdNm',
				},
				{
					headerName: '메뉴레벨',
					field: 'menuLev',
				},
				{
					headerName: '표시여부',
					valueGetter: 'data.menuDispYn == "Y" ? "사용" : "미사용"',
					field: 'menuDispYn',
				},
				{
					headerName: '정렬순서',
					field: 'sortNo',
				},
				{
					headerName: '프로그램ID',
					field: 'pgid',
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

		//더블클릭 이벤트
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

		if(this.data.params.upprMenuCdData != ''){
			document.querySelector(`#${this.targetElId} [name='searchClcd']`).value = '3';
			document.querySelector(`#${this.targetElId} [name='searchData']`).value = this.data.params.upprMenuCdData;
		}else{
			document.querySelector(`#${this.targetElId} [name='searchClcd']`).value = '2';
			document.querySelector(`#${this.targetElId} [name='searchData']`).value = this.data.params.upprMenuNmData;
		}


		this.search();

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
		const searchData = document.querySelector(`#${this.targetElId} [name='searchData']`).value.toUpperCase();

		const params = {
			menuLev : searchClcd == '1' ? searchData : "",
			menuNm : searchClcd == '2' ? searchData : "",
			menuCd : searchClcd == '3' ? searchData : ""
		}


		const response = await CMMN.api.post('/api/sys/MenuMng/getListPage', { params });

		// grid 에 데이터를 표시한다.
		this.data.gridSelectedDataList = [];
		this.data.gridOptions.api.setRowData(response.data);

		document.querySelector(`#${this.targetElId} [name='SYS004001_P01_totalCount']`).innerText = '총 건수 : ' + CMMN.priceToString(response.data.length);

	},

	//확인
	check : async function(){

		//그리드 선택없이 확인버튼을 누른 경우
		if(this.data.gridClickedData.menuCd == undefined || this.data.gridClickedData.menuCd == ""){
			await CMMN.alert("선택된 값이 없습니다.");
			return;

		}

		//레벨3은 선택불가
		if(this.data.gridClickedData.menuLev == '3'){
			await CMMN.alert("3레벨은 상위메뉴로 선택할수 없습니다.");
			return;
		}

		this.close();  // 팝업을 닫는다.

		//콜백
		if(this.data.callbacks[0]) {
			this.data.callbacks[0](this.data.gridClickedData);
		}

		//콜백 후 선택값 초기화
		this.data.gridClickedData.menuCd = "";
		this.data.gridClickedData.menuNm = "";
		this.data.gridClickedData.menuLev = "";
	},

};














