
window.addEventListener('SYS001002_M01', () => {
	SYS001002_M01.init();
})

const SYS001002_M01 = {
	targetElId: 'SYS001002_M01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);


		// 화면 UI 설정
		this.configUI();

		// grid 초기화
		this.gridInit();

		this.search();

	},
	data: {
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
			},
		},
		// grid 에서 선택된 데이터목록
		gridSelectedDataList: [],
		// grid 에서 클릭한 row의 데이터
		gridClickedData: {},
	},
	// 화면 UI 설정
	configUI: function() {

		//그룹코드 이벤트(대문자로 변경)
		let isComposing = false;

		document.querySelector(`#${this.targetElId} [name='grpCd']`).addEventListener("compositionstart", function() {
		  isComposing = true;
		});

		document.querySelector(`#${this.targetElId} [name='grpCd']`).addEventListener("compositionend", function() {
		  isComposing = false;
		  this.value = this.value.toUpperCase().replace(/[^a-zA-Z_]/g, "");
		});

		document.querySelector(`#${this.targetElId} [name='grpCd']`).addEventListener("input", function() {
		  if (!isComposing) {
		    this.value = this.value.toUpperCase().replace(/[^a-zA-Z_]/g, "");
		  }
		});

		// tag UI 별 권한제어  (I:insert, S:select, U:update, D:delete, E:excel)
		CMMN.setAuthBtn(this.targetElId)

	},

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
		this.data.isNew = false;

		//상세내역에 보여줘
		this.dtlSet();

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

		//this.data.pageConfig.orders[0] = { target, isAsc };
	},
	//조회
	search: async function() {

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

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

		this.insert(); //상세 초기화

		//상세목록 안보이게
		document.querySelector(`#${this.targetElId} [name='grpCdDtl_01']`).style.display = 'none';

		document.querySelector(`#${this.targetElId} [name='SYS001002_M01_totalCount']`).innerText = '총 건수 : ' + CMMN.priceToString(response.data.length);

	},

	//상세 데이터 셋팅
	dtlSet : async function(){

		const data = this.data.gridClickedData;

		//상세보이도록
		document.querySelector(`#${this.targetElId} [name='grpCdDtl_01']`).style.removeProperty('display');

		// 상세보기로 스크롤
		$('html, body').animate({
		  scrollTop: $(`#${this.targetElId} [name='grpCdDtl_01']`).offset().top
		}, 500); // 500ms 동안 부드럽게 스크롤

		//아이디 활성화 비활성화
		document.querySelector(`#${this.targetElId} [name='grpCd']`).disabled = this.data.isNew ? false : true;

		//데이터 셋팅
		document.querySelectorAll(`#${this.targetElId} [data-field]`).forEach(el => {
			const dataField = el.getAttribute('data-field');

			if(this.data.isNew) {
				el.value = '';
			} else {
				el.value = data[dataField] || '';
			}

		});

		if(data.useYn == '' || data.useYn == null){
			document.querySelector(`#${this.targetElId} [name='useYn']`).value = 'N';
		}

		//중복확인버튼 disable 셋팅
		if(this.data.isNew){
			document.querySelector(`#${this.targetElId} [name='grpCdChk']`).style.removeProperty('display'); //중복확인버튼
			document.querySelector(`#${this.targetElId} [name='delete']`).style.display = 'none'; //삭제버튼
			document.querySelector(`#${this.targetElId} [name='useYn']`).value = 'N';
			document.querySelector(`#${this.targetElId} [name='save']`).setAttribute('data-auth', 'I');
		}else{
			document.querySelector(`#${this.targetElId} [name='grpCdChk']`).style.display = 'none'; //중복확인버튼
			document.querySelector(`#${this.targetElId} [name='delete']`).style.removeProperty('display'); //삭제버튼
			document.querySelector(`#${this.targetElId} [name='save']`).setAttribute('data-auth', 'U');
		}

		await CMMN.setAuthBtn(this.targetElId);

	},

	//신규등록.초기화버튼 선택
	insert : async function(){
		//신규등록
		this.data.isNew = true;

		//상세데이터 셋팅
		this.dtlSet();

	},

	//중복확인
	check : async function(checkYn){

		const grpCd = document.querySelector(`#${this.targetElId} [name='grpCd']`).value; //메시지아이디 입력값
		const regex = /^[a-zA-Z_]{1,20}$/; //아이디 영문,대소문자, 20자리 _가능

		if(!regex.test(grpCd)){
			await CMMN.alert("형식에 맞지 않는 아이디입니다.");
			return
		}

		//중복확인
		const params = {
			grpCd : grpCd
		}

		const response = await CMMN.api.post('/api/sys/GrpCdMng/selectGrpCd', { params });

		//중복인 경우 true / 사용 가능한 경우 false

		if(!response.data) {
			if(!checkYn){
				document.querySelector(`#${this.targetElId} [name='grpCdHidden']`).value = grpCd;
				await CMMN.alert("사용가능한 그룹코드입니다.");
			}
			return true;
		}else{
			await CMMN.alert("중복된 그룹코드입니다.");
			document.querySelector(`#${this.targetElId} [name='grpCdHidden']`).value = "";
			return false;
		}


	},

	//그룹코드 변경이벤트
	grpCdChange : async function(){

		//그룹코드를 전부 대문자로 변경
		const grpCd = document.querySelector(`#${this.targetElId} [name='grpCd']`).value.toUpperCase();
		const regex = /^[a-zA-Z_]{1,20}$/; //아이디 영문,대소문자, 20자리 _가능

		if(!regex.test(grpCd) && grpCd != ""){
			await CMMN.alert("그룹코드 형식에 맞지 않는 코드입니다.");
			document.querySelector(`#${this.targetElId} [name='grpCd']`).value = ''; //빈값으로 넣어주기
			return
		}

	},

	//저장
	save : async function(){

		//저장
		//파람값 셋팅
		const grpCd = document.querySelector(`#${this.targetElId} [name='grpCd']`).value.toUpperCase(); //그룹코드
		const grpCdHidden = document.querySelector(`#${this.targetElId} [name='grpCdHidden']`).value.toUpperCase(); //그룹코드
		const grpCdNm = document.querySelector(`#${this.targetElId} [name='grpCdNm']`).value; //그룹코드
		const grpDesc = document.querySelector(`#${this.targetElId} [name='grpDesc']`).value; //그룹코드
		const useYn = document.querySelector(`#${this.targetElId} [name='useYn']`).value; //그룹코드

		const regex = /^[a-zA-Z_]{1,20}$/; //아이디 영문,대소문자, 20자리 _가능

		if(!regex.test(grpCd)){
			await CMMN.alert("그룹코드를 확인해주세요.");
			return
		}

		if(grpCd != grpCdHidden){
			await CMMN.alert("중복확인을 해주세요.");
			return
		}

		if(grpCdNm == ''){
			await CMMN.alert("그룹명을 입력해주세요.");
			return
		}

		if(grpDesc == ''){
			await CMMN.alert("그룹상세를 입력해주세요.");
			return
		}

		//신규일때(저장 전 아이디체크 다시 하기)
		if(this.data.isNew){
			if(!await this.check("save")){
				return;
			}
		}

		const params = {
			grpCd : grpCd,
			grpCdNm : grpCdNm,
			grpDesc : grpDesc,
			useYn : useYn
		};

		//등록할건지 확인창
		const confirmMsg =  `입력한 내용을 ${this.data.isNew ? '등록' : '수정'} 하시겠습니까?`;
		if(!await CMMN.confirm(confirmMsg)) {
			return;
		}

		//저장하기
		if(this.data.isNew){
			//신규등록
			await CMMN.api.post('/api/sys/GrpCdMng/insertList', { params });
		}else{
			//수정등록
			await CMMN.api.post('/api/sys/GrpCdMng/updateList', { params });
		}

		await CMMN.alert("저장이 완료되었습니다.");

		this.search(); //목록 재조회
	},

	delete : async function(){

		const grpCd = document.querySelector(`#${this.targetElId} [name='grpCd']`).value.toUpperCase(); //그룹코드

		const params = {
			grpCd : grpCd
		};

		await CMMN.api.post('/api/sys/GrpCdMng/deleteList', { params });

		await CMMN.alert("그룹코드가 삭제 되었습니다.");

		this.search(); //목록 재조회

	},

	//검색조건 변경이벤트
	change : async function(){
		document.querySelector(`#${this.targetElId} [name='searchData']`).value = ''; //검색어 초기화
	}

};






























