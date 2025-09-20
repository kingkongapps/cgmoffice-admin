
window.addEventListener('CNT001001_M01', () => {
	CNT001001_M01.init();
})

const CNT001001_M01 = {
	targetElId: 'CNT001001_M01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();

		// grid01 초기화
		this.gridInit_01();

		// grid02 초기화
		this.gridInit_02();

		// 검색실행
		this.condChange();
	},
	data: {
		selectCond: 'cond_01',
		// 페이징처리 설정
		pageConfig_01: {
			page: 1,
			orders: [ { target: 'crtDtm', isAsc: false } ],
		},
		// 페이징처리후 페이징정보
		paginator_01: {},
		// grid 설정 옵션
		gridOptions_01: {
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
					headerName: '보험사(회사코드)',
					valueGetter: 'data.cmpnyNm + "(" + data.cmpnyCode + ")"',
					field: 'cmpnyNm',
					minWidth: 150,
				},
				{
					headerName: '항목',
					minWidth: 100,
					valueGetter: 'CMMN.getCmmnCdNm("CLUS_ITM_CLCD", data.clusItmClcd)',
					field: 'clusItmClcd',
				},
				{
					headerName: '약관항목명',
					field: 'nprdtNm',
					minWidth: 450,
				},
				{
					headerName: '약관항목코드',
					field: 'prdtCd',
					minWidth: 120,
				},
				{
					headerName: '약관항목파일명',
					field: 'fileNm',
					minWidth: 450,
				},
				{
					headerName: '보종코드',
					field: 'inskndCd',
					minWidth: 150,
				},
				{
					headerName: '상품시작일',
					valueGetter: 'data.pmBeginYmd ? moment(data.pmBeginYmd, "YYYYMMDD").format("YYYY.MM.DD") : ""',
					field: 'pmBeginYmd',
					minWidth: 120,
				},
				{
					headerName: '상품변경일',
					valueGetter: 'data.prdtChgYmd ? moment(data.prdtChgYmd, "YYYYMMDD").format("YYYY.MM.DD") : ""',
					field: 'prdtChgYmd',
					minWidth: 120,
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
		gridSelectedDataList_01: [],
		// grid 에서 클릭한 row의 데이터
		gridClickedData_01: {},
		// grid02 설정 옵션
		gridOptions_02: {
			columnDefs: [  // grid 컬럼 정의
				{
					headerName: '목차순서',
					field: 'screnDispOrd',
					minWidth: 100,
					maxWidth: 100,
				},
				{
					headerName: '항목',
					minWidth: 100,
					maxWidth: 100,
					valueGetter: 'CMMN.getCmmnCdNm("CLUS_ITM_CLCD", data.clusItmClcd)',
					field: 'clusItmClcd',
				},
				{
					headerName: '약관항목코드',
					field: 'clusItmCd',
					minWidth: 150,
					maxWidth: 150,
				},
				{
					headerName: '약관파일명',
					field: 'fileNm',
					minWidth: 550,
					maxWidth: 550,
				},
				{
					headerName: '약관항목명',
					field: 'clusItmNm',
					minWidth: 550,
				},
			],
			defaultColDef: {  // 기본 컬럼정의
				resizable: true,  // 컬럼사이즈 조정가능 여부
			},
		},
	},
	// 화면 UI 설정
	configUI: function() {

		// 항목분류 공통코드를 추출 및 dropdown 적용.
		const clusItmClcd = CMMN.getCmmnCd('CLUS_ITM_CLCD');
		document.querySelector(`#${this.targetElId} [name='searchClusItmClcd']`).innerHTML
			= clusItmClcd
				.sort((a, b) => a.sortNo - b.sortNo)
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.cd}">${curr.cdNm}</option>` );
				}, '<option value="">= 항목 전체 =</option>');


		// 보험사 공통코드를 추출한다.
		const cmpnyCode = CMMN.getCmmnCd('CMPNY_CODE');
		// 검색란의 보험사 공통코드 dropdown 을 셋팅한다.
		document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`).innerHTML
			= cmpnyCode
				.sort((a, b) => a.cdNm.localeCompare(b.cdNm))
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.cd}">${curr.cdNm}</option>` );
				}, '<option value="">= 보험사 선택 =</option>');
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
	// 상품등록조회/상품약관구성조회 조건변경시...
	condChange: function() {
		const el_selectedCond = document.querySelector(`#${this.targetElId} input[name="selectCond"]:checked`);
		if(el_selectedCond) {
			this.data.selectCond = el_selectedCond.value;
			console.log('>>> selectedCond: ', this.data.selectCond);
			document.querySelectorAll(`#${this.targetElId} [name='cond_01']`).forEach(el => el.style.display = 'none');
			document.querySelectorAll(`#${this.targetElId} [name='cond_02']`).forEach(el => el.style.display = 'none');

			// 보험사선택 초기화
			// $(document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`))
			// 	.val('')
			// 	.trigger('change');

			// 항목분류선택 초기화
			// document.querySelector(`#${this.targetElId} [name='searchClusItmClcd']`).value = '';
			// 상품구분선택 초기화
			// document.querySelector(`#${this.targetElId} [name='searchPrdtCfcd']`).value = '';

			// 그리드 초기화
			this.data.gridOptions_01.api.setRowData([]);
			this.data.gridOptions_02.api.setRowData([]);

			document.querySelectorAll(`#${this.targetElId} [name='${this.data.selectCond}']`).forEach(el => el.style.display = '');

			if(this.data.selectCond === 'cond_01') {
				this.pageToFirst_01();
			} else {
				this.setPrdtList_02();
			}

		}
	},
	// 검색란에서 보험사 선택변경시
	onChangeCmpnyCode: function() {
		if(this.data.selectCond === 'cond_01') {
			this.pageToFirst_01();
		} else {
			this.setPrdtList_02();
		}
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
	gridOnCellClicked_01: function(event) {
		// 클릭된 타겟 cell 의 field값을 추출( 체크박스클릭의 경우는 적용을 제외하기 위해 )
		if(!event.colDef.field)  return;

		// 객체를 깊은복사를 진행한다.
		this.data.gridClickedData_01 = JSON.parse(JSON.stringify(event.data));
		// console.log('>>> selectedData: ', this.data.selectedData);
		this.CMN_P05_open();
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

		const target = sortedColumns.length > 0 ? sortedColumns[0].field : 'crtDtm';  // 정렬대상 셋팅
		const isAsc = sortedColumns.length > 0 ? sortedColumns[0].direction === "asc" : false;  // 오름차순여부 셋팅

		this.data.pageConfig_01.orders[0] = { target, isAsc };
		this.pageToFirst_01();
	},
	pageToFirst_01: function() {
		this.pageTo_01(1);
	},
	// 팝업열기
	CMN_P05_open: function() {
		CMN000000_P05.open(
			this.data.gridClickedData_01,
			[ this.pageToFirst_01.bind(this) ]
		);
	},
	// 검색
	search_01: async function() {

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

		const params = {
			cmpnyCode: document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`).value,
			prdtNm: document.querySelector(`#${this.targetElId} [name='searchPrdtNm']`).value,
			clusItmClcd: document.querySelector(`#${this.targetElId} [name='searchClusItmClcd']`).value,
			// prdtChgYmd: document.querySelector(`#${this.targetElId} [name='searchPrdtChgYmd']`).value.replaceAll('.',''),

			pageConfig: this.data.pageConfig_01,
		}

		const response = await CMMN.api.post('/api/cnt/prdtMng/getListPage', { params });

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

		document.querySelector(`#${this.targetElId} [name='CNT001001_M01_totalCount_1']`).innerText = '총 건수 : ' + CMMN.priceToString(this.data.paginator_01.totalCount);
	},
	// 페이지 이동
	pageTo_01: function(page) {
		this.data.pageConfig_01.page = page;
		this.search_01();
	},
	// 상품 신규등록
	add_01: function() {
		this.data.gridClickedData_01 = {};
		this.CMN_P05_open();
	},
	// 삭제
	delete_01: async function() {

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "D")) return;

		if(this.data.gridSelectedDataList_01.length === 0) {
			await CMMN.alert('삭제할 대상을 선택하세요.');
			return;
		}
		if(!await CMMN.confirm('선택한 상품을 삭제하시겠습니까?')) {
			return;
		}
		const params = this.data.gridSelectedDataList_01;
		await CMMN.api.post('/api/cnt/prdtMng/deleteList', { params });

		this.pageToFirst_01();
	},
	// 상품등록 엑셀업로드
	excelUp_01: async function() {

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "E")) return;

		const el_excelFile = document.querySelector(`#${this.targetElId} [name='prdtupexcel01']`);
		const excelFile = el_excelFile.files[0];
		if (!excelFile) return;

		const fileNm = excelFile.name;
		const ext = fileNm.toLowerCase().substring(fileNm.lastIndexOf('.') + 1, fileNm.length)
		if(ext !== 'xlsx') {
			await CMMN.alert('엑셀파일만 업로드가 가능합니다.');
			return;
		}
		if(!await CMMN.confirm('선택한 엑셀파일을 업로드 하시겠습니까?')) {
			return;
		}

		const params = { excelFile };
		await CMMN.api.post('/api/cnt/prdtMng/excelUp_01', { params });
		el_excelFile.value = '';  // 엑셀파일 첨부input 을 초기화 한다.

		this.pageToFirst_01();
	},
	// grid02 초기화
	gridInit_02: function() {
		// grid 초기화
		new agGrid.Grid(
			document.querySelector(`#${this.targetElId} [name='table-content-02']`),
			this.data.gridOptions_02
		);
		this.data.gridOptions_02.api.setRowData([]);
	},
	// 주계약 select box 셋팅
	setPrdtList_02: async function() {
		const cmpnyCode = document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`).value;
		const prdtCfcd = document.querySelector(`#${this.targetElId} [name='searchPrdtCfcd']`).value;

		const mnspccCfcd = "1"; // 주계약
		const params = { cmpnyCode, prdtCfcd, mnspccCfcd};

		const response = await CMMN.api.post('/api/cnt/prdtMng/getList', { params });
		console.log('>>> response:', response);

		response.data
			.sort((a, b) => a.cmpnyNm.localeCompare(b.cmpnyNm))
			.sort((a, b) => a.nprdtNm.localeCompare(b.nprdtNm))
			;

		const prdtInfoList = response.data;

		document.querySelector(`#${this.targetElId} [name='searchPrdtCd']`).innerHTML
			= prdtInfoList
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.prdtCd}">${curr.nprdtNm}</option>` );
				}, '<option value="">= 주계약 선택 =</option>');
		document.querySelector(`#${this.targetElId} [name='searchPrdtCd']`).value = "";

		this.data.gridOptions_02.api.setRowData([]);
	},
	// 검색
	search_02: async function() {

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

		const prdtCd = document.querySelector(`#${this.targetElId} [name='searchPrdtCd']`).value;
		if(prdtCd) {
			const { data } = await CMMN.api.get(`/api/cnt/prdtClusMng/getInfo?prdtCd=${prdtCd}`);

			// console.log('>>> data: ', data);

			this.data.gridOptions_02.api.setRowData(data);

			document.querySelector(`#${this.targetElId} [name='CNT001001_M01_totalCount_2']`).innerText = '총 건수 : ' + CMMN.priceToString(data.length);
		} else {
			this.data.gridOptions_02.api.setRowData([]);
		}
	},
	// 약관구성등록 엑셀업로드
	excelUp_02: async function() {

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "E")) return;

		const el_excelFile = document.querySelector(`#${this.targetElId} [name='prdtupexcel02']`);
		const excelFile = el_excelFile.files[0];
		if (!excelFile) return;

		const fileNm = excelFile.name;
		const ext = fileNm.toLowerCase().substring(fileNm.lastIndexOf('.') + 1, fileNm.length)
		if(ext !== 'xlsx') {
			await CMMN.alert('엑셀파일만 업로드가 가능합니다.');
			return;
		}
		if(!await CMMN.confirm('선택한 엑셀파일을 업로드 하시겠습니까?')) {
			return;
		}

		const params = { excelFile };
		CMMN.api.post('/api/cnt/prdtMng/excelUp_02', { params }).then(data => {
			el_excelFile.value = '';  // 엑셀파일 첨부input 을 초기화 한다.
			this.pageToFirst_01();
		}).catch(err => {
			console.error('>>> error: ', err);
			el_excelFile.value = '';  // 엑셀파일 첨부input 을 초기화 한다.
		});
	},
};