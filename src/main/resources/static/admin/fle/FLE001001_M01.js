window.addEventListener('FLE001001_M01', () => {
	FLE001001_M01.init();
	// 팝업페이지 추가
	CMMN.include("FLE001001_P01");
	CMMN.include("FLE001001_P04");
})

const FLE001001_M01 = {
	targetElId: 'FLE001001_M01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);
		// 화면 UI 설정
		this.configUI();
		// grid 초기화
		this.gridInit();

		this.pageTo(1);
	},
	data: {
		// 페이징처리 설정
		pageConfig: {
			page: 1,
			orders: [ { target: 'mdfDtm', isAsc: false } ],
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
					headerName: '파일명',
					field: 'fileNm',
				},
				{
					headerName: '생성일시',
					field: 'crtDtmChar',
					maxWidth: 210,
				},
				{
					headerName: '생성자',
					field: 'crtr',
					maxWidth: 130,
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
		CMMN.setAuthBtn(this.targetElId)
	},
	// grid 초기화
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
		this.CMMN_P03_open();

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
		this.pateToFirst();
	},
	pateToFirst: function() {
		this.pageTo(1);
	},
	// 팝업01열기
	P01_open: function() {
		FLE001001_P01.open(
			{isClick : "Y"},
			[this.pateToFirst.bind(this)]
		);
	},
	// 상품상세보기 공통팝업 열기
	CMMN_P03_open: function() {
		CMN000000_P03.open(
			this.data.gridClickedData,
			[]
		);
	},
	// 팝업04열기
	P04_open: function() {
		FLE001001_P04.open(
			{},
			[this.pateToFirst.bind(this)]
		);
	},
	// 페이지 이동
	pageTo: function(page) {
		this.data.pageConfig.page = page;
		this.search();
	},
	search: async function() {

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

		const fileNm = document.querySelector(`#${this.targetElId} [name='fileNm']`).value;
		const params = {
			fileNm,
			pageConfig: this.data.pageConfig,
		}
		const response = await CMMN.api.post('/api/cnt/prdtClusPdfMng/getListPage', { params });

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

		document.querySelector("#FLE001001_M01_totalCount").innerText = '총 건수 : ' + CMMN.priceToString(this.data.paginator.totalCount, ',');
	},
	delete: async function() {

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "D")) return;

		if(this.data.gridSelectedDataList.length === 0) {
			await CMMN.alert('삭제할 대상을 선택하세요.');
			return;
		}
		if(!await CMMN.confirm('선택한 합본을 삭제하시겠습니까?')) {
			return;
		}
		const params = this.data.gridSelectedDataList;

		const { data: rsltList } = await CMMN.api.post('/api/cnt/prdtClusPdfMng/deleteListPrevChk', { params });
		let chkList = '';
		rsltList.forEach(d => {
			if(d.count > 0) {
				chkList += `${d.fileNm}<br/>(생성일시: ${d.crtDtmChar})<br/><br/>`;
			}
		});
		if(chkList.length > 0) {
			await CMMN.alert(`아래파일은 상품에 매핑되어있어서 삭제가 불가합니다.<br/><br/>${chkList}`);
			return;
		}

		await CMMN.api.post('/api/cnt/prdtClusPdfMng/deleteList', { params });

		this.pateToFirst();
	},
	pdfUp: async function() {

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "U")) return;

		const el_pdfUp = document.querySelector(`#${this.targetElId} [name='pdf-up']`);
		const pdfUpFiles = el_pdfUp.files;
		if (pdfUpFiles.length == 0) return;

		const inputPdf = pdfUpFiles[0];
		const fileNm = inputPdf.name;
		if(fileNm.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣ]/g, '').length > 66) {
			await CMMN.alert('PDF 파일명을 한글 66자 이하로 입력해주세요.');
			return;
		}

		const ext = fileNm.toLowerCase().substring(fileNm.lastIndexOf('.') + 1, fileNm.length)
		if(ext !== 'pdf') {
			await CMMN.alert('PDF파일만 업로드 가능합니다.');
			return;
		}

		if(!await CMMN.confirm('파일을 업로드 하시겠습니까?')) {
			el_pdfUp.value = '';  // pdf파일 첨부input 을 초기화 한다.
			return;
		}

		const params = { pdfUpFiles };
		await CMMN.api.post('/api/cnt/prdtClusPdfMng/upPdf', { params });
		el_pdfUp.value = '';  // pdf파일 첨부input 을 초기화 한다.

		this.pateToFirst();
	},
	splitZipDn: async function() {

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

		const el_pdfSplitZipDn = document.querySelector(`#${this.targetElId} [name='pdf-splitzipdn']`);
		const pdfSplitZipDnFile = el_pdfSplitZipDn.files[0];
		if (!pdfSplitZipDnFile) return;

		if(!await CMMN.confirm('파일을 분리/다운로드 하시겠습니까?')) {
			el_pdfSplitZipDn.value = '';  // pdf파일 첨부input 을 초기화 한다.
			return;
		}

		const params = { pdfSplitZipDnFile };

		const options = { params, responseType: 'blob' }

		const response = await CMMN.api.post(`/api/cnt/prdtClusPdfMng/splitZipDn`, options);
		CMMN.downloadFileProc(response);
	},
}