
window.addEventListener('SYS002001_M01', () => {
	SYS002001_M01.init();
})

const SYS002001_M01 = {
	targetElId: 'SYS002001_M01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();
		// grid 초기화
		this.gridInit();

		this.search();

	},
	data: {
		selectCond: 'admUsr_01',
		// grid 설정 옵션
		gridOptions: {
			columnDefs: [  // grid 컬럼 정의
				{
					headerName: '아이디',
					field: 'memId',
				},
				{
					headerName: '이름',
					field: 'memNm',
				},
				{
					headerName: '이메일',
					field: 'email',
				},
				{
					headerName: '권한',
					field: 'cdNm',
				},
				{
					headerName: '로그인실패횟수',
					field: 'loginCnt',
				},
				{
					headerName: '최근로그인일자',
					field: 'lastLgnDt',
				},
				{
					headerName: '사용여부',
					valueGetter: 'data.useYn == "Y" ? "사용" : "미사용"',
					field: 'useYn',
				},
				{
					headerName: '등록일자',
					valueGetter: 'data.crtDtm ? moment(data.crtDtm, "YYYYMMDD").format("YYYY.MM.DD") : ""',
					field: 'crtDtm',
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
		//권한그룹 공통코드로 셋팅
		const authCd = CMMN.getCmmnCd('AUTH_CD');
		console.log(authCd);
		document.querySelector(`#${this.targetElId} [name='authGrpCd']`).innerHTML
			= authCd
				.sort((a, b) => a.cdNm.localeCompare(b.cdNm))
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.cd}">${curr.cdNm}</option>` );
				},'');
		//이메일 공통코드 셋팅
		const email = CMMN.getCmmnCd('EMAIL_ADDR');
		document.querySelector(`#${this.targetElId} [name='emailType']`).innerHTML
			= email
				.sort((a, b) => a.cdNm.localeCompare(b.cdNm))
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.cd}">${curr.cdNm}</option>` );
				},'');


		// 보험사 공통코드를 추출한다.
		const cmpnyCode = CMMN.getCmmnCd('CMPNY_CODE');
		// 검색란의 보험사 공통코드 dropdown 을 셋팅한다.
		document.querySelector(`#${this.targetElId} [name='comCode']`).innerHTML
			= cmpnyCode
				.sort((a, b) => a.cdNm.localeCompare(b.cdNm))
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.cd}">${curr.cdNm}</option>` );
				}, '<option value="">= 선택 =</option>');
		$(`#${this.targetElId} [name='comCode']`).select2( {
		    theme: "bootstrap-5",
		    width: $( this ).data( 'width' ) ? $( this ).data( 'width' ) : $( this ).hasClass( 'w-100' ) ? '100%' : 'style',
		    placeholder: $( this ).data( 'placeholder' ),
			dropdownParent: $(`#${this.targetElId}`),
		} );


		// tag UI 별 권한제어  (I:insert, S:select, U:update, D:delete, E:excel)
		CMMN.setAuthBtn(this.targetElId);

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
			memId : searchClcd == '1' ? searchData : "",
			memNm : searchClcd == '2' ? searchData : "",
			comCode : CMMN.user.authGrpCd !== '100' ? CMMN.user.comCode : "",
		}

		const response = await CMMN.api.post('/api/sys/AdmUsrMng/getList', { params });

		// grid 에 데이터를 표시한다.
		this.data.gridSelectedDataList = [];
		this.data.gridOptions.api.setRowData(response.data);

		this.insert(); //상세 초기화

		//상세목록 안보이게
		document.querySelector(`#${this.targetElId} [name='admUsrDtl_01']`).style.display = 'none';

		document.querySelector(`#${this.targetElId} [name='SYS002001_M01_totalCount']`).innerText = '총 건수 : ' + CMMN.priceToString(response.data.length);

	},

	//상세 데이터 셋팅
	dtlSet : async function(){

		const data = this.data.gridClickedData;

		if(this.data.isNew){
			this.data.authGrpCd = '500';
			this.data.authCd = '';
			document.querySelector(`#${this.targetElId} [name='save']`).setAttribute('data-auth', 'I');
		}else{
			this.data.authGrpCd = this.data.gridClickedData.authGrpCd;
			this.data.authCd = this.data.gridClickedData.authCd;
			document.querySelector(`#${this.targetElId} [name='save']`).setAttribute('data-auth', 'U');
		}

		// tag UI 별 권한제어  (I:insert, S:select, U:update, D:delete, E:excel)
		CMMN.setAuthBtn(this.targetElId);

		this.searchAuthCd();

		//상세보이도록
		document.querySelector(`#${this.targetElId} [name='admUsrDtl_01']`).style.removeProperty('display');

		// 상세보기로 스크롤
		$('html, body').animate({
		  scrollTop: $(`#${this.targetElId} [name='admUsrDtl_01']`).offset().top
		}, 500); // 500ms 동안 부드럽게 스크롤

		//아이디 활성화 비활성화
		document.querySelector(`#${this.targetElId} [name='memId']`).disabled = this.data.isNew ? false : true;

		//데이터 셋팅
		document.querySelectorAll(`#${this.targetElId} [data-field]`).forEach(el => {
			const dataField = el.getAttribute('data-field');

			if(this.data.isNew) {
				el.value = '';
			} else {
				el.value = data[dataField] || '';
			}

		});

		//사용여부
		document.querySelector(`#${this.targetElId} [name='useYn']`).value = (data.useYn != null && !this.data.isNew)? data.useYn : "N";

		// 회사
		data.comCode = CMMN.user.comCode;

		const select = document.querySelector(`#${this.targetElId} [name='comCode']`);
		const options = Array.from(select.options);
		const targetValue = data.comCode;

		let matched = false;

		for (let i = 0; i < options.length; i++) {
		  if (options[i].value === targetValue) {
		    select.selectedIndex = i;
		    matched = true;
		    break;
		  }
		}

		if (!matched || (this.data.isNew && CMMN.user.authGrpCd === '100')) {
		  select.selectedIndex = 0; // 첫 번째 옵션 선택
		}

		// select2 UI 업데이트도 반영 (필수!)
		const event = new Event('change', { bubbles: true });
		select.dispatchEvent(event);

		//슈퍼관리자 아닌 경우 회사선택막기
		document.querySelector(`#${this.targetElId} [name='comCode']`).disabled = CMMN.user.authGrpCd !== '100' ? true : false;


		if(data.email && !this.data.isNew){
			const emailData = data.email.split('@')[0];
			const emailType = data.email.split('@')[1];
			const select = document.querySelector(`#${this.targetElId} [name='emailType']`);
			let found = false;

			//이메일 데이터 셋팅
			document.querySelector(`#${this.targetElId} [name='email']`).value = emailData ;
			document.querySelector(`#${this.targetElId} [name='emailDomain']`).value = emailType ;


			for (let i = 0; i < select.options.length; i++) {
			  if (select.options[i].text === emailType) {
			    select.selectedIndex = i;
			    found = true;
				document.querySelector(`#${this.targetElId} [name='emailDomain']`).style.display = 'none';
			    break;
			  }
			}
			if (!found) {
			  // 디폴트로 직접입력
			  select.value = '01'; //직접입력
			  document.querySelector(`#${this.targetElId} [name='emailDomain']`).style.removeProperty('display');
			}

		}else{
			document.querySelector(`#${this.targetElId} [name='emailType']`).value = '01'; //도메인(직접입력)
			document.querySelector(`#${this.targetElId} [name='emailDomain']`).value = ''; //빈값
			document.querySelector(`#${this.targetElId} [name='emailDomain']`).style.removeProperty('display');
		}


		//중복확인버튼 disable 셋팅
		if(this.data.isNew){
			document.querySelector(`#${this.targetElId} [name='emailType']`).value = '01'; //도메인(직접입력)
			document.querySelector(`#${this.targetElId} [name='authGrpCd']`).value = '500'; //권한(일반)
		 	document.querySelector(`#${this.targetElId} [name='emailDomain']`).style.removeProperty('display');
			document.querySelector(`#${this.targetElId} [name='memIdChk']`).style.removeProperty('display'); //중복확인버튼
			document.querySelector(`#${this.targetElId} [name='passReset']`).style.display = 'none'; //비번초기화버튼
			this.searchAuthCd();
		}else{
			document.querySelector(`#${this.targetElId} [name='memIdChk']`).style.display = 'none'; //중복확인버튼
			document.querySelector(`#${this.targetElId} [name='passReset']`).style.removeProperty('display'); //비번초기화버튼
		}

	},

	//신규등록.초기화버튼 선택
	insert : async function(){
		//신규등록
		this.data.isNew = true;

		//상세데이터 셋팅
		this.dtlSet();

	},

	//저장
	save : async function(){

		const memId = document.querySelector(`#${this.targetElId} [name='memId']`).value;//아이디
		const memIdHidden = document.querySelector(`#${this.targetElId} [name='memIdHidden']`).value;//아이디
		const authCd = document.querySelector(`#${this.targetElId} [name='authCd']`).value;//권한
		const memNm = document.querySelector(`#${this.targetElId} [name='memNm']`).value;//성명
		const email = document.querySelector(`#${this.targetElId} [name='email']`).value;//이메일
		const emailDomain = document.querySelector(`#${this.targetElId} [name='emailDomain']`).value;//이메일도메인
		const useYn = document.querySelector(`#${this.targetElId} [name='useYn']`).value;//사용여부
		const comCode = document.querySelector(`#${this.targetElId} [name='comCode']`).value;//회사코드


		const nameRegex = /^[가-힣a-zA-Z]{2,30}$/; //성명 정규식 한글,영어만 가능 (2자 이상 30자 이하)
		const emailRegex = /^[a-zA-Z0-9._%+-]{1,64}$/; //이메일아이디 영문,대소문자, 64자리까지 ._%+-가능
		const emailDomainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; //도메인
		const regex = /^[a-zA-Z0-9._%+-]{2,10}$/; //아이디 영문,대소문자, 10자리까지 ._%+-가능



		//밸리데이션체크
		if(!regex.test(memId)){
			await CMMN.alert("아이디를 확인 해주세요.");
			return
		}

		if(memId != memIdHidden){
			await CMMN.alert("중복확인을 해주세요.");
			return
		}

		if(authCd == ''){
			await CMMN.alert("권한을 확인 해주세요.");
			return
		}

		if(!nameRegex.test(memNm)){
			await CMMN.alert("성명을 확인 해주세요.");
			return
		}

		if(!emailRegex.test(email)){
			await CMMN.alert("이메일 아이디를 확인 해주세요.");
			return
		}

		if(!emailDomainRegex.test(emailDomain)){
			await CMMN.alert("이메일 도메인을 확인 해주세요.");
			return
		}

		if(comCode == ''){
			await CMMN.alert("회사를 선택 해주세요.");
			return
		}

		if(comCode !== CMMN.user.comCode && CMMN.user.authGrpCd !== '100' ){
			await CMMN.alert("다른회사는 선택할수 없습니다.");
			return
		}


		//파람값 셋팅
		const params = {
			memId : memId
			,authCd : authCd
			,memNm : memNm
			,email : email + "@" + emailDomain
			,useYn : useYn
			,delYn : useYn == 'Y' ? 'N':'Y'
			,comCode : comCode
		}

		// 아이디 중복체크 한번더 하고
		if(this.data.isNew){
			//신규등록
			if(!await this.check("save")){
				return;
			}
		}

		// 저장할지 물어보기
		const confirmMsg =  `입력한 내용을 ${this.data.isNew ? '등록' : '수정'} 하시겠습니까?`;
		if(!await CMMN.confirm(confirmMsg)) {
			return;
		}

		if(this.data.isNew){
			//신규등록
			await CMMN.api.post('/api/sys/AdmUsrMng/insertList', { params });
			await CMMN.alert("저장이 완료되었습니다. 초기비밀번호는 '1234'입니다.");
		}else{
			//수정등록
			await CMMN.api.post('/api/sys/AdmUsrMng/updateList', { params });
			await CMMN.alert("저장이 완료되었습니다.");
		}

		this.search(); //목록 재조회

	},

	//중복확인
	check : async function(checkYn){

		const memId = document.querySelector(`#${this.targetElId} [name='memId']`).value; //메시지아이디 입력값
		const regex = /^[a-zA-Z0-9._%+-]{2,10}$/; //아이디 영문,대소문자, 10자리까지 ._%+-가능

		if(!regex.test(memId)){
			await CMMN.alert("형식에 맞지 않는 아이디입니다. 아이디를 확인해주세요.");
			return
		}

		//중복확인
		const params = {
			memId : memId
		}


		const response = await CMMN.api.post('/api/sys/AdmUsrMng/selectMemIdYn', { params });

		//중복인 경우 true / 사용 가능한 경우 false

		if(!response.data) {
			if(!checkYn){
				document.querySelector(`#${this.targetElId} [name='memIdHidden']`).value = memId;
				await CMMN.alert("사용가능한 아이디입니다.");
			}
			return true;
		}else{
			await CMMN.alert("중복된 아이디입니다.");
			document.querySelector(`#${this.targetElId} [name='memIdHidden']`).value = "";
			return false;
		}


	},

	//셀렉트박스 변경 이벤트
	change : async function(data){

		if(data == 'searchClcd'){
			document.querySelector(`#${this.targetElId} [name='searchData']`).value = '';//검색값 초기화
		}else if(data == 'authGrpCd'){
			const authGrpCd = document.querySelector(`#${this.targetElId} [name='authGrpCd']`).value;//권한
			this.data.authGrpCd = authGrpCd;
			this.data.authCd = '';
			this.searchAuthCd();
		}else{
			//도메인
			const emailType = document.querySelector(`#${this.targetElId} [name='emailType']`).value

			if(emailType == '01'){
				//직접입력으로 변경한 경우
				document.querySelector(`#${this.targetElId} [name='emailDomain']`).value = '';
				document.querySelector(`#${this.targetElId} [name='emailDomain']`).style.removeProperty('display'); //비번초기화버튼
			}else{
				const domainOption = document.querySelector(`#${this.targetElId} [name='emailType']`).selectedIndex;
				const domainText = document.querySelector(`#${this.targetElId} [name='emailType']`).options[domainOption].text;
				document.querySelector(`#${this.targetElId} [name='emailDomain']`).value = domainText;
				document.querySelector(`#${this.targetElId} [name='emailDomain']`).style.display = 'none';
			}
		}

	},

	//비밀번호초기화 버튼
	rstPwdSave : async function(){

		const memId = document.querySelector(`#${this.targetElId} [name='memId']`).value;//아이디

		//파람값 셋팅
		const params = {
			memId : memId
		}

		// 물어보기
		const confirmMsg =  `비밀번호 초기화를 하시겠습니까?`;
		if(!await CMMN.confirm(confirmMsg)) {
			return;
		}

		//초기화
		await CMMN.api.post('/api/sys/AdmUsrMng/updateRstPwd', { params });

		await CMMN.alert("비밀번호 초기화가 완료되었습니다. 초기비밀번호는 '1234'입니다.");

	},

	//그룹조회
	searchAuthCd : async function(){

		//중복확인
		const params = {
			authGrpCd : this.data.authGrpCd == "" ? '500' : this.data.authGrpCd
		}

		const response = await CMMN.api.post('/api/sys/AdmUsrMng/searchAuthCd', { params });

		document.querySelector(`#${this.targetElId} [name='authCd']`).innerHTML
			= response.data
				.sort((a, b) => a.authNm.localeCompare(b.authNm))
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.authCd}">${curr.authNm}</option>` );
				},'<option value="">선택</option>');

		//값이 있으면 셋팅
		document.querySelector(`#${this.targetElId} [name='authCd']`).value = this.data.authCd ;

	},

};



























