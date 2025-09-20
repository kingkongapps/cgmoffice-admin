
window.addEventListener('SYS004004_M01', () => {
	SYS004004_M01.init();
})

const SYS004004_M01 = {
	targetElId: 'SYS004004_M01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();

		// grid 초기화
		this.gridInit();

		// 검색실행
		this.pageToFirst();

	},
	data: {
		selectCond: 'lgnHist_01',
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
					headerName: '순번',
					field: 'lgnSeq',
					maxWidth : "80",
				},
				{
					headerName: '아이디',
					field: 'memId',
				},
				{
					headerName: '이름',
					field: 'memNm',
				},
				{
					headerName: '아이피',
					field: 'acsIp',
				},
				{
					headerName: '접속일시',
					field: 'acsDt',
				},
				{
					headerName: '로그인성공여부',
					valueGetter: 'data.lgnScsYn == "Y" ? "성공" : "실패"',
					field: 'lgnScsYn',
				},
				{
					headerName: '로그인구분',
					field: 'loginCfcd',
				},
			],
			defaultColDef: {  // 기본 컬럼정의
				flex: 1,  // 컬럼이동이 가능하게 한다.
				minWidth: 50,  // 각 컬럼당 최소넓이
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
		$(`#${this.targetElId} [data-field='searchDataYmd']`).datepicker({
			format: 'yyyy.mm.dd',      // 날짜 형식
			autoclose: true,           // 선택 시 자동 닫기
			todayHighlight: true,      // 오늘 날짜 강조
			language: 'ko',            // 한글 지원
			startDate: new Date("1000-01-01"),
			endDate: new Date("9999-12-31"),
		});

		// tag UI 별 권한제어  (I:insert, S:select, U:update, D:delete, E:excel)
		CMMN.setAuthBtn(this.targetElId);
	},

	// grid01 초기화
	gridInit: function() {
		// grid 초기화
		new agGrid.Grid(
			document.querySelector(`#${this.targetElId} [name='table-content']`),
			this.data.gridOptions
		);
		this.data.gridOptions.api.setRowData([]);
	},

	//검색
	search : async function(){

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

		const searchClcd = document.querySelector(`#${this.targetElId} [name='searchClcd']`).value;
		const searchData = document.querySelector(`#${this.targetElId} [name='searchData']`).value;
		const searchDataYmd = document.querySelector(`#${this.targetElId} [name='searchDataYmd']`).value;

		const params = {
			memId : searchClcd == '1' ? searchData : "",
			memNm : searchClcd == '2' ? searchData : "",
			acsDt : searchClcd == '3' ? searchDataYmd : "",

			pageConfig: this.data.pageConfig,
		}

		//목록조회
		const response = await CMMN.api.post('/api/sys/lgnAuthHistMng/getListPage', { params });

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

		document.querySelector(`#${this.targetElId} [name='SYS004004_M01_totalCount']`).innerText = '총 건수 : ' + CMMN.priceToString(this.data.paginator.totalCount);
	},

	//첫번째 페이지로 이동
	pageToFirst: function() {
		this.pageTo(1);
	},

	// 페이지 이동
	pageTo: function(page) {
		this.data.pageConfig.page = page;
		this.search();
	},

	//구분변경
	change : function(){
		const searchClcd = document.querySelector(`#${this.targetElId} [name='searchClcd']`).value;

		//입력값 초기화
		document.querySelector(`#${this.targetElId} [name='searchDataYmd']`).value = "";
		document.querySelector(`#${this.targetElId} [name='searchData']`).value = "";

		//일자일 경우 데이터피커인 인풋으로 변경
		if(searchClcd == '3'){
			document.querySelector(`#${this.targetElId} [name='searchDataYmd']`).style.removeProperty('display');
			document.querySelector(`#${this.targetElId} [name='searchData']`).style.display = 'none';
		}else{
			document.querySelector(`#${this.targetElId} [name='searchData']`).style.removeProperty('display');
			document.querySelector(`#${this.targetElId} [name='searchDataYmd']`).style.display = 'none';
		}

	},


};



















