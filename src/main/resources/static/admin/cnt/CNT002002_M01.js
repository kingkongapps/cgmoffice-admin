
window.addEventListener('CNT002002_M01', () => {
	CNT002002_M01.init();
})

const CNT002002_M01 = {
	targetElId: 'CNT002002_M01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();

		// grid01 초기화
		this.gridInit_01();

		this.pageToFirst_01()
	},
	data: {
		selectCond: '',
		// 페이징처리 설정
		pageConfig_01: {
			page: 1,
			orders: [ { target: 'screnDispOrd', isAsc: true } ],
		},
		// 페이징처리후 페이징정보
		paginator_01: {},
		// grid 설정 옵션
		gridOptions_01: {
			columnDefs: [  // grid 컬럼 정의
				/*{
					headerCheckboxSelection: true,
					headerCheckboxSelectionFilteredOnly: true,
					checkboxSelection: true,
					maxWidth: 50,
					minWidth: 50,
					lockPosition: 'left', // 위치를 왼쪽으로 고정
					suppressMovable: true,  // 이동이 불가능하도록 설정
				},*/
				{
					headerName: '항목',
					field: 'clusItmClcd',
					minWidth: 100
				},
				{
					headerName: '약관항목명',
					field: 'clusItmNm',
					minWidth: 500,
				},
				{
					headerName: '보종코드',
					field: 'inskndCd',
					minWidth: 150,
				},
				{
					headerName: '약관번호순',
					field: 'sn',
					minWidth: 120,
				},
				{
					headerName: '항목순',
					field: 'screnDispOrd',
					minWidth: 100,
				},
				{
					headerName: '첨부',
					field: 'fileNo',
					minWidth: 100,
					cellRenderer: function(params) {
						if(!CMMN.isEmpty(params.data.fileNo) && params.data.fileNo.endsWith(".pdf")){
							return `
								<button
									class="btn btn-sm btn-secondary"
									style="margin-bottom: 2px;"
								>
									다운로드
								</button>
							`;
						} else {
							return ``;
						}
					},
				},
			],
			defaultColDef: {  // 기본 컬럼정의
				flex: 1,  // 컬럼이동이 가능하게 한다.
				//minWidth: 100,  // 각 컬럼당 최소넓이
				resizable: true,  // 컬럼사이즈 조정가능 여부
				sortable: true,  // 정렬가능 여부
				suppressMovable: true, // 컬럼 이동 불가 설정
			},
			suppressRowClickSelection: true,  // row 클릭으로 row가 선택처리되는 것을 막는다. 체크박스를 통해서만 선택이 가능해야 되기 때문...
		},
		// grid 에서 선택된 데이터목록
		gridSelectedDataList_01: [],
		// grid 에서 클릭한 row의 데이터
		gridClickedData_01: {},
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
/*		const prdtCfcd = CMMN.getCmmnCd('PRDT_CFCD');
		// 검색란의 상품구분 공통코드 dropdown 을 셋팅한다.
		document.querySelector(`#${this.targetElId} [name='searchPrdtCfcd']`).innerHTML
			= prdtCfcd
				.sort((a, b) => a.cdNm.localeCompare(b.cdNm))
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.cd}">${curr.cdNm}</option>` );
				}, '<option value="">= 상품구분 선택 =</option>');*/

		//파라미터 값 초기화
		this.param = {};

		// tag UI 별 권한제어  (I:insert, S:select, U:update, D:delete, E:excel)
		CMMN.setAuthBtn(this.targetElId)

		// 슈퍼관리자그룹이 아닐경우...
		if(CMMN.user.authGrpCd !== '100') {
			const comCode = CMMN.user.comCode;
			const comName = CMMN.user.comName;
			$(`#${this.targetElId} [name='searchCmpnyCode']`).val(comCode).trigger('change');
			document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`).disabled = true;
		}
	},
	// 검색란에서 보험사 선택변경시
	onChangeCmpnyCode: function() {
		this.search_01();
	},
	// grid01 초기화
	gridInit_01: function() {
		// 선택된 row들의 변경 이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions_01.onSelectionChanged = this.gridOnSelectionChanged_01.bind(this);
		// row 클릭이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions_01.onCellClicked = this.gridOnCellClicked_01.bind(this);
		// sorting 이벤트발생시 직접 제어할 함수 등록
		this.data.gridOptions_01.onSortChanged = this.gridOnSortChanged_01.bind(this);
		// grid 초기화
		new agGrid.Grid(
			document.querySelector(`#${this.targetElId} [name='table-content-01']`),
			this.data.gridOptions_01
		);
		this.data.gridOptions_01.api.setRowData([]);
	},
	// grid 선택이벤트 발생
	gridOnSelectionChanged_01: function(event) {
		this.data.gridSelectedDataList_01 = [];
		event.api.getSelectedNodes().forEach(item => this.data.gridSelectedDataList_01.push(item.data));
		// console.log('>>> gridSelectedDataList_01: ', this.data.gridSelectedDataList_01);
	},
	// grid 셀 클릭 이벤트 발생
	gridOnCellClicked_01: async function(event) {
		// 클릭된 타겟 cell 의 field값을 추출( 체크박스클릭의 경우는 적용을 제외하기 위해 )
		if(!event.colDef.field)  return;

		// 객체를 깊은복사를 진행한다.
		this.data.gridClickedData_01 = JSON.parse(JSON.stringify(event.data));

		// 파일 다운로드
		if(!CMMN.isEmpty(event.data)){
			if(event.colDef.field == 'fileNo' && !CMMN.isEmpty(event.data.fileNo) && event.data.fileNo.endsWith('.pdf')){
				await CMMN.downloadfilePost(event.data.fileNo);
				return;
			} else if(event.colDef.field == 'fileNo' && CMMN.isEmpty(event.data.fileNo)){
				await CMMN.alert('업로드한 파일이 없습니다.');
				return;
			} else if(event.colDef.field == 'fileNo' && !CMMN.isEmpty(event.data.fileNo) && !event.data.fileNo.endsWith(".pdf")){
				await CMMN.alert('업로드한 파일이 없습니다.');
				return;
			}
		} else {
			await CMMN.alert('업로드한 파일이 없습니다.');
			return;
		}
	},
	// grid 정렬이벤트 발생
	gridOnSortChanged_01: function(params) {
		// 정렬대상 컬럼 추출
		const sortedColumns = params.columnApi.getAllColumns()
			.filter(col => col.getSort())
			.map(col => ({
				field: col.getColDef().field,
				direction: col.getSort()
			}));
		//console.log("정렬 정보:", sortedColumns);

		const target = sortedColumns.length > 0 ? sortedColumns[0].field : 'screnDispOrd';  // 정렬대상 셋팅
		const isAsc = sortedColumns.length > 0 ? sortedColumns[0].direction === "asc" : false;  // 오름차순여부 셋팅

		this.data.pageConfig_01.orders[0] = { target, isAsc };
		this.pageToFirst_01();
	},
	pageToFirst_01: function() {
		this.pageTo_01(1);
	},
	// 주계약 검색 팝업열기
	CMN_P04_open: function() {
		const cmpnyNmText = document.querySelector(`#${this.targetElId} [id^='select2-searchCmpnyCode']`).innerText;
		const cmpnyNm = !CMMN.isEmpty(cmpnyNmText) && cmpnyNmText != "= 보험사 전체 =" ? cmpnyNmText : "";
		//const prdtCfNmText = document.querySelector(`#${this.targetElId} [name='searchPrdtCfcd']`).selectedOptions[0].innerText;
		const prdtCfNm = "";
		const prdtCd_old = document.querySelector(`#${this.targetElId} [name='searchPrdtNm']`).value;
		const menuCd = this.targetElId;

		const params = {
			menuCd: menuCd,
			prdtCd_old: prdtCd_old,
			cmpnyCode: document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`).value,
			cmpnyNm: !CMMN.isEmpty(this.param) ? this.param.cmpnyNm : cmpnyNm,
			//prdtCfcd: document.querySelector(`#${this.targetElId} [name='searchPrdtCfcd']`).value,
			prdtCfNm: prdtCfNm,
			prdtCd: !CMMN.isEmpty(this.param) ? this.param.prdtCd : "",
		}

		CMN000000_P04.open(
			params,
			[this.search_01.bind(this)]
		);
	},
	// 검색
	search_01: async function(param) {

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

		if(!CMMN.isEmpty(param)){
			this.param = param;
			document.querySelector(`#${this.targetElId} [name='searchPrdtNm']`).value = param.nprdtNm;
			document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`).value = param.cmpnyCode;
			document.querySelector(`#${this.targetElId} [id^='select2-searchCmpnyCode']`).title = param.cmpnyNm;
			document.querySelector(`#${this.targetElId} [id^='select2-searchCmpnyCode']`).innerText = param.cmpnyNm;
			//document.querySelector(`#${this.targetElId} [name='searchPrdtCfcd']`).value = param.prdtCfcd;
		}

		const params = {
			cmpnyCode: document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`).value,
			//prdtCfcd: document.querySelector(`#${this.targetElId} [name='searchPrdtCfcd']`).value,
			prdtCd: !CMMN.isEmpty(this.param) ? this.param.prdtCd : "",

			pageConfig: this.data.pageConfig_01,
		}

		const response = await CMMN.api.post('/api/cnt/pdfMng/mnClusMppgList', { params });

		// console.log(">>> response: ", response);

		// grid 에 데이터를 표시한다.
		this.data.gridSelectedDataList_01 = [];
		this.data.gridOptions_01.api.setRowData(response.data.list);

		// 페이징정보 추출
		this.data.paginator_01 = response.data.paginator;

		// grid 하단의 페이징 표시처리
		CMMN.setPagination(
			`#${this.targetElId} [name='paginator_01']`,  // 페이징표시를 셋팅할 타겟
			this.data.paginator_01,  // 페이징정보
			this.pageTo_01.bind(this),  // 패이지이동시 실행할 함수
		)
		document.querySelector("#CNT002002_M01_totalCount").innerText = '총 건수 : ' + CMMN.priceToString(this.data.paginator_01.totalCount);
	},
	// 페이지 이동
	pageTo_01: function(page) {
		this.data.pageConfig_01.page = page;
		this.search_01();
	},
};