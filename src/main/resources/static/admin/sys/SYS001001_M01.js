
window.addEventListener('SYS001001_M01', () => {
	SYS001001_M01.init();
	// 팝업페이지 추가
	CMMN.include("SYS001001_P01");
})

const SYS001001_M01 = {
	targetElId: 'SYS001001_M01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();
		// grid 초기화
		this.gridInit();
		// 초기검색 실행
		this.search();
	},
	data: {
		grpCd: 'CMPNY_CODE',
		gridOptions: {  // grid 설정 옵션
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
				{ headerName: '회사코드', field: 'cd',},
				{ headerName: '회사명', field: 'cdNm', },
				{ headerName: '정렬순서', field: 'sortNo', },
				{ headerName: '사용여부', field: 'useYn', valueGetter: 'data.useYn == "Y" ? "사용" : "미사용"', },
				{ headerName: '사업자번호', field: 'cdVal1', },
				{ headerName: '담당자', field: 'cdVal3', },
				{ headerName: '전화번호', field: 'cdVal2', },
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
		gridSelectedDataList: [],  // grid 에서 선택된 데이터목록
		gridClickedData: {},  // grid 에서 클릭한 row의 데이터
	},
	// 화면 UI 설정
	configUI: function() {
		// tag UI 별 권한제어  (I:insert, S:select, U:update, D:delete, E:excel)
		CMMN.setAuthBtn(this.targetElId)
	},
	// grid 초기화
	gridInit: function() {
		// 선택된 row들의 변경 이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions.onSelectionChanged = this.gridOnSelectionChanged.bind(this);
		// row 클릭이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions.onCellClicked = this.gridOnCellClicked.bind(this);
		// grid 초기화
		new agGrid.Grid(
			document.querySelector(`#${this.targetElId} [name='table-content']`),
			this.data.gridOptions
		);
		this.data.gridOptions.api.setRowData([]);
	},
	gridOnSelectionChanged: function(event) {
		this.data.gridSelectedDataList = [];
		event.api.getSelectedNodes().forEach(item => this.data.gridSelectedDataList.push(item.data));
		// console.log('>>> gridSelectedDataList: ', this.data.gridSelectedDataList);
	},
	gridOnCellClicked: function(event) {
		// 클릭된 타겟 cell 의 field값을 추출( 체크박스클릭의 경우는 적용을 제외하기 위해 )
		if(!event.colDef.field)  return;

		// 객체를 깊은복사를 진행한다.
		this.data.gridClickedData = JSON.parse(JSON.stringify(event.data));
		// console.log('>>> selectedData: ', this.data.selectedData);
		this.P01_open();
	},
	P01_open: function() {
		SYS001001_P01.open(
			this.data.gridClickedData,
			[ this.search.bind(this) ]
		);
	},
	search: async function() {

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

		const response = await CMMN.api.get(`/api/common/code/cmmnCdAll?grpCd=${this.data.grpCd}`);
		// console.log(">>> response.data: ", response.data);

		// grid 에 데이터를 표시한다.
		this.data.gridOptions.api.setRowData(response.data);

		// 전역 메모리에 저장된 CMMN.CMMN_CD 의 grpCd 해당하는 내용을 재셋팅한다.
		CMMN.resetCmmnCd(this.data.grpCd, response.data);

		document.querySelector(`#${this.targetElId} [name='SYS001001_M01_totalCount']`).innerText = '총 건수 : ' + CMMN.priceToString(response.data.length);
	},
	add: function() {

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "I")) return;

		this.data.gridClickedData = {};
		this.data.gridClickedData.grpCd = this.data.grpCd;
		this.P01_open();
	},
	delete: async function() {

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "D")) return;

		if(this.data.gridSelectedDataList.length === 0) {
			await CMMN.alert('삭제할 대상을 선택하세요.');
			return;
		}
		if(!await CMMN.confirm('선택한 회사코드를 삭제하시겠습니까?')) {
			return;
		}
		const params = this.data.gridSelectedDataList;
		await CMMN.api.post('/api/common/code/deleteCmmnCdList', { params });

		this.search(); // 검색을 실행한다.
	},
};