
window.addEventListener('SYS004001_M01', () => {
	SYS004001_M01.init();
	CMMN.include("SYS004001_P01"); // 팝업
})

const SYS004001_M01 = {
	targetElId: 'SYS004001_M01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();

		this.search_01();

		// grid 초기화
		this.gridInit_01();
		this.gridInit_02();

	},
	data: {
		// 페이징처리 설정
		pageConfig: {
			page: 1,
			orders: [ { target: 'menuCd', isAsc: true } ],
			limit:50,
		},
		// 페이징처리후 페이징정보
		paginator: {},
		// grid 설정 옵션
		gridOptions_01: {
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
			},
		},
		// grid 에서 선택된 데이터목록
		gridSelectedDataList_01: [],
		// grid 에서 클릭한 row의 데이터
		gridClickedData_01: {},

		// grid02 설정 옵션 (상품약관)
		gridOptions_02: {
			columnDefs: [  // grid 컬럼 정의
				{
					headerName: '메뉴코드',
					field: 'menuCd',
				},
				{
					headerName: '메뉴명',
					field: 'menuNm',
				},
			],
			defaultColDef: {  // 기본 컬럼정의
				flex: 1,  // 컬럼이동이 가능하게 한다.
				minWidth: 85,  // 각 컬럼당 최소넓이
				resizable: true,  // 컬럼사이즈 조정가능 여부
			},

		},
		// grid02 에서 선택된 데이터목록
		gridSelectedDataList_02: [],
		// grid 에서 클릭한 row의 데이터
		gridClickedData_02: {},

		gridDataList_01: [],
		gridDataList_02: [],
	},

	// 화면 UI 설정
	configUI: function() {

		this.data.isNew = true;

		//순서에 이벤트(숫자 이외는 제거)
		document.querySelector(`#${this.targetElId} [name='sortNo']`).addEventListener("input", function () {
		    this.value = this.value.replace(/[^0-9]/g, ''); // 숫자 이외 제거
		});

		//상위메뉴 이벤트(대문자로 변경)
		document.querySelector(`#${this.targetElId} [name='upprMenuCd']`).addEventListener("input", function () {
		    this.value = this.value.toUpperCase(); // 대문자로변경
		});


		//메뉴코드 이벤트(대문자로 변경)
		let isComposing = false;

		document.querySelector(`#${this.targetElId} [name='menuCd']`).addEventListener("compositionstart", function() {
		  isComposing = true;
		});

		document.querySelector(`#${this.targetElId} [name='menuCd']`).addEventListener("compositionend", function() {
		  isComposing = false;
		  this.value = this.value.toUpperCase().replace(/[^A-Za-z0-9]/g, "");
		});

		document.querySelector(`#${this.targetElId} [name='menuCd']`).addEventListener("input", function() {
		  if (!isComposing) {
		    this.value = this.value.toUpperCase().replace(/[^A-Za-z0-9]/g, "");
		  }
		});

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
			document.querySelector(`#${this.targetElId} [name='table-content_01']`),
			this.data.gridOptions_01
		);
		this.data.gridOptions_01.api.setRowData([]);
	},
	// grid 선택이벤트 발생
	gridOnSelectionChanged_01: function(event) {
		this.data.gridSelectedDataList_01 = [];
		event.api.getSelectedNodes().forEach(item => this.data.gridSelectedDataList_01.push(item.data));
	},
	// grid 셀 클릭 이벤트 발생
	gridOnCellClicked_01: function(event) {
		// 클릭된 타겟 cell 의 field값을 추출( 체크박스클릭의 경우는 적용을 제외하기 위해 )
		if(!event.colDef.field)  return;

		// 객체를 깊은복사를 진행한다.
		this.data.gridClickedData_01 = JSON.parse(JSON.stringify(event.data));
		this.data.gridDtlData = this.data.gridClickedData_01;

		this.data.isNew = false;

		//하위목록 조회
		this.search_02();

		//상세보이게
		document.querySelector(`#${this.targetElId} [name='menuCd_02']`).style.removeProperty('display');

		//상세에 데이터 셋팅
		this.setDate();

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

		const target = sortedColumns.length > 0 ? sortedColumns[0].field : 'menuCd';  // 정렬대상 셋팅
		const isAsc = sortedColumns.length > 0 ? sortedColumns[0].direction === "asc" : true;  // 오름차순여부 셋팅

		this.data.pageConfig.orders[0] = { target, isAsc };

		this.search_01();
	},
	gridInit_02: function() {
		// 선택된 row들의 변경 이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions_02.onSelectionChanged = this.gridOnSelectionChanged_02.bind(this);
		// row 클릭이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions_02.onCellClicked = this.gridOnCellClicked_02.bind(this);
		// sorting 이벤트발생시 직접 제어할 함수 등록
		this.data.gridOptions_02.onSortChanged = this.gridOnSortChanged_02.bind(this);
		// grid 초기화
		new agGrid.Grid(
			document.querySelector(`#${this.targetElId} [name='table-content_02']`),
			this.data.gridOptions_02
		);
		this.data.gridOptions_02.api.setRowData([]);
	},
	// grid 선택이벤트 발생
	gridOnSelectionChanged_02: function(event) {
		this.data.gridSelectedDataList_02 = [];
		event.api.getSelectedNodes().forEach(item => this.data.gridSelectedDataList_02.push(item.data));
	},

	// grid 셀 클릭 이벤트 발생
	gridOnCellClicked_02: function(event) {
		// 클릭된 타겟 cell 의 field값을 추출( 체크박스클릭의 경우는 적용을 제외하기 위해 )
		if(!event.colDef.field)  return;

		// 객체를 깊은복사를 진행한다.
		this.data.gridClickedData_02 = JSON.parse(JSON.stringify(event.data));

		this.data.isNew = false;

		//상세에 데이터 셋팅
		this.data.gridDtlData = this.data.gridClickedData_02;
		this.setDate();

	},
	// grid 정렬이벤트 발생
	gridOnSortChanged_02: function(params) {
		// 정렬대상 컬럼 추출
		const sortedColumns = params.columnApi.getAllColumns()
			.filter(col => col.getSort())
			.map(col => ({
				field: col.getColDef().field,
				direction: col.getSort()
			}));
		//console.log("정렬 정보:", sortedColumns);

		const target = sortedColumns.length > 0 ? sortedColumns[0].field : 'menuCd';  // 정렬대상 셋팅
		const isAsc = sortedColumns.length > 0 ? sortedColumns[0].direction === "asc" : true;  // 오름차순여부 셋팅

		this.data.pageConfig.orders[0] = { target, isAsc };

		this.search_01();
	},

	//조회
	search_01: async function() {

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

		//상세닫기
		document.querySelector(`#${this.targetElId} [name='menuCd_02']`).style.display = 'none';

		const searchClcd = document.querySelector(`#${this.targetElId} [name='searchClcd']`).value;
		const searchData = document.querySelector(`#${this.targetElId} [name='searchData']`).value.toUpperCase();

		if(searchClcd == '1'){
			document.querySelector(`#${this.targetElId} [name='searchData']`).value = searchData.replace(/[^0-9]/g, '');
		}

		const params = {
			menuLev : searchClcd == '1' ? searchData.replace(/[^0-9]/g, '') : "",
			menuNm : searchClcd == '2' ? searchData : "",
			menuCd : searchClcd == '3' ? searchData : "",
		}

		const response = await CMMN.api.post('/api/sys/MenuMng/getListPage', { params });

		// grid 에 데이터를 표시한다.
		this.data.gridSelectedDataList_01 = [];
		this.data.gridOptions_01.api.setRowData(response.data);

		document.querySelector(`#${this.targetElId} [name='SYS004001_M01_totalCount']`).innerText = '총 건수 : ' + CMMN.priceToString(response.data.length);

	},

	//상세
	search_02: async function() {

		const upprMenuCd = this.data.gridDtlData.menuCd;

		const params = {
			menuLev : "",
			menuNm : "",
			upprMenuCd : upprMenuCd,
		}

		const response = await CMMN.api.post('/api/sys/MenuMng/getListPage', { params });

		// grid 에 데이터를 표시한다.
		this.data.gridSelectedDataList_02 = [];
		this.data.gridOptions_02.api.setRowData(response.data);

	},

	//상세에 목록 셋팅
	setDate : async function(){

		document.querySelector(`#${this.targetElId} [name='menuCd']`).disabled = this.data.isNew ? false : true;

		if(this.data.isNew){
			document.querySelector(`#${this.targetElId} [name='save']`).setAttribute('data-auth', 'I');
		}else{
			document.querySelector(`#${this.targetElId} [name='save']`).setAttribute('data-auth', 'U');
		}

		// tag UI 별 권한제어  (I:insert, S:select, U:update, D:delete, E:excel)
		CMMN.setAuthBtn(this.targetElId);

		// 상세보기로 스크롤
		$('html, body').animate({
		  scrollTop: $(`#${this.targetElId} [name='menuCd_02']`).offset().top
		}, 500); // 500ms 동안 부드럽게 스크롤

		const data = this.data.gridDtlData;

		//데이터 셋팅
		document.querySelectorAll(`#${this.targetElId} [data-field]`).forEach(el => {
			const dataField = el.getAttribute('data-field');
			if(this.data.isNew) {
				el.value = '';
			} else {
				el.value = data[dataField] || '';
			}

			if(dataField == 'useYn' && !this.data.isNew){
				el.value = data[dataField] || 'Y';
			}

		});

		//삭제버튼
		if(this.data.isNew){
			document.querySelector(`#${this.targetElId} [name='delete']`).style.display = 'none';
		}else{
			document.querySelector(`#${this.targetElId} [name='delete']`).style.removeProperty('display');
		}

	},

	//초기화
	insert : async function(){

		//상세보이게
		document.querySelector(`#${this.targetElId} [name='menuCd_02']`).style.removeProperty('display');
		//삭제버튼 안보이게
		document.querySelector(`#${this.targetElId} [name='delete']`).style.display = 'none';

		this.data.isNew = true;
		await this.setDate();
		await this.data.gridOptions_02.api.setRowData();

		document.querySelector(`#${this.targetElId} [name='menuTypCd']`).selectedIndex = 0;
		document.querySelector(`#${this.targetElId} [name='menuLev']`).selectedIndex = 0;
		document.querySelector(`#${this.targetElId} [name='menuDispYn']`).selectedIndex = 0;

	},

	//상위메뉴 버튼 클릭 이벤트
	setUpprMenuCd :async function(data){

		//
		if(data.menuCd != "" || data.menuCd!=undefined){
			//상위그룹 셋팅
			document.querySelector(`#${this.targetElId} [name='upprMenuCd']`).value = data.menuCd;

			//메뉴레벨셋팅
			document.querySelector(`#${this.targetElId} [name='menuLev']`).value = String(parseInt(data.menuLev) + 1);

			//상위그룹명 셋팅
			document.querySelector(`#${this.targetElId} [name='upprMenuNm']`).value = data.menuNm;

		}


	},

	// 팝업열기
	P01_open: function(data) {

		const upprMenuCdData = document.querySelector(`#${this.targetElId} [name='upprMenuCd']`).value;
		const upprMenuNmData = document.querySelector(`#${this.targetElId} [name='upprMenuNm']`).value;

		const params = {
			upprMenuCdData : upprMenuCdData,
			upprMenuNmData : upprMenuNmData
		}

		if(data == 'cd'){
			params.upprMenuNmData = "";
		}else if(data == 'nm'){
			params.upprMenuCdData = "";
		}

		SYS004001_P01.open(
			params,
			[this.setUpprMenuCd.bind(this)]
		);
	},

	//메뉴코드 변경이벤트
	change : async function(){

		const menuCd = document.querySelector(`#${this.targetElId} [name='menuCd']`).value.toUpperCase();
		const menuCdHidden = document.querySelector(`#${this.targetElId} [name='menuCdHidden']`).value.toUpperCase();

		if(menuCd != menuCdHidden || menuCdHidden== ""){
			this.data.isNew = true;
		}else{
			this.data.isNew = false;
		}

		//삭제버튼
		if(this.data.isNew){
			document.querySelector(`#${this.targetElId} [name='delete']`).style.display = 'none';
		}else{
			document.querySelector(`#${this.targetElId} [name='delete']`).style.removeProperty('display');
		}

		//영어,숫자만 가능하게
		const regexMenuCd = /^[A-Z0-9]{1,10}$/; //영어,숫자 20자리

		//메뉴아이디
		if(!regexMenuCd.test(menuCd) && menuCd != ""){
			await CMMN.alert("메뉴ID를 확인해주세요.");
			document.querySelector(`#${this.targetElId} [name='menuCd']`).value = "";
			return
		}

	},

	//저장
	save : async function(){

		//파람값셋팅
		const menuCd = document.querySelector(`#${this.targetElId} [name='menuCd']`).value.toUpperCase(); //메뉴코드
		const menuNm = document.querySelector(`#${this.targetElId} [name='menuNm']`).value; //메뉴명
		const upprMenuCd = document.querySelector(`#${this.targetElId} [name='upprMenuCd']`).value.toUpperCase(); //상위메뉴코드
		const menuTypCd = document.querySelector(`#${this.targetElId} [name='menuTypCd']`).value; //메뉴유형코드
		const menuLev = parseInt(document.querySelector(`#${this.targetElId} [name='menuLev']`).value,10); //메뉴레벨
		const menuDtext = document.querySelector(`#${this.targetElId} [name='menuDtext']`).value; //메뉴상세내용
		const sortNo = parseInt(document.querySelector(`#${this.targetElId} [name='sortNo']`).value,10); //정렬순서
		const menuDispYn = document.querySelector(`#${this.targetElId} [name='menuDispYn']`).value; //메뉴표시여부
		const pgid = document.querySelector(`#${this.targetElId} [name='pgid']`).value; //프로그램아이디
		const oldSortNo = !this.data.isNew ? parseInt(this.data.gridDtlData.sortNo,10) : ""; //기존 정렬순서

		//영어,숫자만 가능하게
		const regexMenuCd = /^[A-Z0-9]{1,10}$/; //영어,숫자 20자리

		//특수문자만 불가
		const regexMenuNm = /^[A-Za-z가-힣0-9]{1,100}$/; //특수문자 불가

		const regexSortNo = /^[1-9][0-9]*$/; //숫자만 가능

		const params = {
			menuCd : menuCd,
			menuNm :menuNm,
			upprMenuCd : upprMenuCd,
			menuTypCd : menuTypCd,
			menuLev : menuLev,
			menuDtext : menuDtext,
			sortNo : sortNo,
			menuDispYn : menuDispYn,
			pgid : pgid,
			oldSortNo : oldSortNo
		}

		//메뉴아이디
		if(!regexMenuCd.test(menuCd)){
			await CMMN.alert("메뉴ID를 확인해주세요.");
			return
		}

		if(!regexMenuCd.test(upprMenuCd)){
			if(upprMenuCd != ""){
				await CMMN.alert("상위메뉴를 확인해주세요.");
				return
			}
		}

		//신규저장시 코드 중복확인
		if(this.data.isNew){
			const menuCdYn = await CMMN.api.post('/api/sys/MenuMng/selectMenuCdYn', { params });

			if(menuCdYn.data){
				await CMMN.alert("중복된 코드입니다.");
				return
			}
		}


		//상위메뉴
		if(parseInt(menuLev)>1 && upprMenuCd == ''){
			await CMMN.alert("상위메뉴를 확인해주세요");
			return
		}

		if(menuLev == ""){
			await CMMN.alert("메뉴레벨을 확인해주세요");
			return

		}

		//상위메뉴 확인
		if(upprMenuCd != ''){
			const UpprMenuYn = await CMMN.api.post('/api/sys/MenuMng/selectUpprMenu', { params });

			if(UpprMenuYn.data.length == 0 ){
				await CMMN.alert("3레벨 또는 없는 상위메뉴입니다. 상위메뉴를 다시 선택해주세요");
				return;
			}

			//상위메뉴 데이터 저장
			this.data.UpprMenuYnList = UpprMenuYn.data[0];
		}

		//메뉴명
		if(!regexMenuNm.test(menuNm)){
			await CMMN.alert("메뉴명를 확인해주세요.");
			return
		}

		//메뉴레벨
		if(this.data.UpprMenuYnList){
			const upprMenuLev = String(parseInt(this.data.UpprMenuYnList.menuLev)+1)

			if(menuLev != upprMenuLev){
				await CMMN.alert("메뉴레벨을 확인해주세요. 상위메뉴는 "+this.data.UpprMenuYnList.menuLev+"레벨입니다.");
				return
			}

		}


		//메뉴순서
		if(!regexSortNo.test(sortNo) || sortNo == ''){
			await CMMN.alert("메뉴순서를 확인해주세요.");
			return
		}

		//표시여부
		if(menuDispYn == ''){
			await CMMN.alert("표시여부를 확인해주세요");
			return
		}

		//저장하기
		if(this.data.isNew){
			//신규등록
			await CMMN.api.post('/api/sys/MenuMng/insertList', { params });
		}else{
			//수정등록
			await CMMN.api.post('/api/sys/MenuMng/updateList', { params });
		}

		await CMMN.alert("저장이 완료되었습니다.");

		//사용자정보, 사이드바 셋팅
		INDEX_PAGE.init();

		//this.search_01(); //목록 재조회

	},

	//삭제
	delete : async function(){

		const menuCd = document.querySelector(`#${this.targetElId} [name='menuCd']`).value;

		const params = {
			menuCd : menuCd
		}

		await CMMN.api.post('/api/sys/MenuMng/deleteList', { params });

		await CMMN.alert("삭제가 완료되었습니다.");

		//사용자정보, 사이드바 셋팅
		INDEX_PAGE.init();

		//this.search_01(); //목록 재조회


	}








};














