
window.addEventListener('SYS004002_P01', () => {
	SYS004002_P01.init();
})

const SYS004002_P01 = {
	targetElId: 'SYS004002_P01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();

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
	},
	// 화면 UI 설정
	configUI: function() {

		//공통코드 추출
		const msgType = CMMN.getCmmnCd('MSG_TYPE');

		// 검색란의 상품구분 공통코드 dropdown 을 셋팅한다.
		document.querySelector(`#${this.targetElId} [name='msgType']`).innerHTML
			= msgType
				.sort((a, b) => a.cdNm.localeCompare(b.cdNm))
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.cd}">${curr.cdNm}</option>` );
				}, '');


		// 각 입력단의 값이 변경될때마다 data.params 의 해당 데이터를 실시간 변경하도록 설정
		document.querySelectorAll(`#${this.targetElId} [data-field]`).forEach(el => {
			el.addEventListener('change', (event) => {
				const target = event.target
				const dataField = target.getAttribute('data-field');
				const dataType = target.getAttribute('data-type');
				if(dataType !== 'date') {
					this.data.params[dataField] = target.value;
				}
			})
		});


		//메뉴코드 이벤트(대문자로 변경)
		let isComposing = false;

		document.querySelector(`#${this.targetElId} [name='msgId']`).addEventListener("compositionstart", function() {
		  isComposing = true;
		});

		document.querySelector(`#${this.targetElId} [name='msgId']`).addEventListener("compositionend", function() {
		  isComposing = false;
		  this.value = this.value.toUpperCase().replace(/[^A-Za-z0-9]/g, "");
		});

		document.querySelector(`#${this.targetElId} [name='msgId']`).addEventListener("input", function() {
		  if (!isComposing) {
		    this.value = this.value.toUpperCase().replace(/[^A-Za-z0-9]/g, "");
		  }
		});

		// tag UI 별 권한제어  (I:insert, S:select, U:update, D:delete, E:excel)
		CMMN.setAuthBtn('SYS004002_M01');


	},
	// 팝업을 연다.
	open: function(params, callbacks) {
		this.data.params = params;
		this.data.callbacks = callbacks || [];

		console.log(params);

		//신규등록여부 셋팅
		this.data.isNew = params.msgId ? false : true;

		document.querySelector(`#${this.targetElId} [name='title']`)
			.innerText = this.data.isNew ? '메시지등록' : '메시지수정/상세';
		document.querySelector(`#${this.targetElId} [name='save']`)
			.innerText = this.data.isNew ? '등록' : '수정';

		if(this.data.isNew){
			document.querySelector(`#${this.targetElId} [name='save']`).setAttribute('data-auth', 'I');
		}else{
			document.querySelector(`#${this.targetElId} [name='save']`).setAttribute('data-auth', 'U');
		}

		// tag UI 별 권한제어  (I:insert, S:select, U:update, D:delete, E:excel)
		CMMN.setAuthBtn('SYS004002_M01');


		//메시지아이디의 활성화 비활성화 셋팅
		document.querySelector(`#${this.targetElId} [name='msgId']`).disabled = this.data.isNew ? false : true;
		document.querySelector(`#${this.targetElId} [name='msgType']`).disabled = this.data.isNew ? false : true;

		//중복확인버튼 disable 셋팅
		if(this.data.isNew){
			document.querySelector(`#${this.targetElId} [name='msgIdChk']`).style.removeProperty('display');
		}else{
			document.querySelector(`#${this.targetElId} [name='msgIdChk']`).style.display = 'none';
		}

		//팝업내용 셋팅
		this.setPopUiData(this.data.params);

		// 팝업을 보여준다.
		CMMN.showModal(this.data.modal);
	},
	// 팝업 내용 셋팅
	setPopUiData: function(data) {

		//데이터 셋팅
		document.querySelectorAll(`#${this.targetElId} [data-field]`).forEach(el => {
			const dataField = el.getAttribute('data-field');

			if(dataField === 'delYn' && this.data.isNew) {
				el.value = 'N';
			} else {
				el.value = data[dataField] || '';
			}
		});

		//셀렉트박스 값 셋팅
		document.querySelector(`#${this.targetElId} [name='msgType']`).value = data.msgType ? data.msgType : "E";

		//데이터가 없는 경우 디폴트값 셋팅
		if(!data.msgType){
			document.querySelector(`#${this.targetElId} [name='msgId']`).value = "E";
		}

	},
	//닫기, 취소버튼
	close: function() {
		CMMN.hideModal(this.data.modal);
	},

	//중복확인버튼
	check : async function(checkYn){

		console.log(checkYn);

		const msgId = document.querySelector(`#${this.targetElId} [name='msgId']`).value; //메시지아이디 입력값
		const regex = /^[EFSIWefsiw][0-9]{3}$/; //정규식 영어1자리+숫자3자리

		console.log(regex.test(msgId));

		//밸리데이션 체크하기 영어1자리 + 숫자3자리
		if(!regex.test(msgId)){
			//얼럿띄우기
			await CMMN.alert("형식에 맞지 않는 메시지ID입니다.");
			return
		}

		//중복확인
		const params = {
			msgId : msgId
		}

		const response = await CMMN.api.post('/api/sys/SysMsgMng/selectMsgIdYn', { params });

		//중복인 경우 true / 사용 가능한 경우 false

		if(response.data == "Y") {
			if(!checkYn){
				document.querySelector(`#${this.targetElId} [name='msgIdHidden']`).value = msgId;
				await CMMN.alert("사용가능한 아이디입니다.");
			}
			return true;
		} else if(response.data == "D") {
			await CMMN.alert("삭제된 아이디입니다.");
			document.querySelector(`#${this.targetElId} [name='msgIdHidden']`).value = "";
			return false;
		} else {
			await CMMN.alert("중복된 아이디입니다.");
			document.querySelector(`#${this.targetElId} [name='msgIdHidden']`).value = "";
			return false;
		}

	},

	//셀렉트박스 변경이벤트
	change : async function(){
		//변경이벤트
		const msgType = document.querySelector(`#${this.targetElId} [name='msgType']`).value;

		//등록과 동일하게 초기화
		document.querySelector(`#${this.targetElId} [name='msgId']`).value = msgType; //선택한값으로 id 구분값 변경
		document.querySelector(`#${this.targetElId} [name='msgIdHidden']`).value = ""; //초기화
		document.querySelector(`#${this.targetElId} [name='msgId']`).disabled = false; //입력이 가능하도록
		document.querySelector(`#${this.targetElId} [name='save']`).innerText = '등록'; //수정버튼을 등록으로 변경
		document.querySelector(`#${this.targetElId} [name='title']`).innerText = '메시지 등록'; //타이틀 변경
		document.querySelector(`#${this.targetElId} [name='msgIdChk']`).style.removeProperty('display'); //중복확인버튼보이도록

		this.data.isNew = true; //신규등록으로 수정

		if(this.data.isNew){
			document.querySelector(`#${this.targetElId} [name='save']`).setAttribute('data-auth', 'I');
		}else{
			document.querySelector(`#${this.targetElId} [name='save']`).setAttribute('data-auth', 'U');
		}

		// tag UI 별 권한제어  (I:insert, S:select, U:update, D:delete, E:excel)
		CMMN.setAuthBtn('SYS004002_M01');

	},

	//아이디변경이벤트
	msgIdChange : async function(){

		const msgId = document.querySelector(`#${this.targetElId} [name='msgId']`).value.toUpperCase();
		const msgIdHidden = document.querySelector(`#${this.targetElId} [name='msgIdHidden']`).value.toUpperCase();
		document.querySelector(`#${this.targetElId} [name='msgId']`).value = msgId; //입력시 대문자로 변경된게 보이도록
		const regexMsgId = /^[EFSIWefsiw][0-9]{3}$/; //정규식 영어1자리+숫자3자리
		const regex = /^[EFSIWefsiw]$/; //유형에 해당하는 정규식

		if(msgId != msgIdHidden || msgIdHidden == ""){
			this.data.isNew = true; //신규등록으로 수정
			document.querySelector(`#${this.targetElId} [name='save']`).setAttribute('data-auth', 'I');
		}else{
			this.data.isNew = false;
			document.querySelector(`#${this.targetElId} [name='save']`).setAttribute('data-auth', 'U');
		}

		// tag UI 별 권한제어  (I:insert, S:select, U:update, D:delete, E:excel)
		CMMN.setAuthBtn('SYS004002_M01');

		//아이디 형식과 메시지타입유형이 맞지 않는 경우
		if(!regexMsgId.test(msgId) && !regex.test(msgId.slice(0,1))){
			await CMMN.alert("형식에 맞지 않는 메시지ID입니다.");
			document.querySelector(`#${this.targetElId} [name='msgId']`).value = "";
			return;
		}

		//아이디 형식이 맞지 않는 경우
		if(!regexMsgId.test(msgId) && msgId != ""){
			await CMMN.alert("형식에 맞지 않는 메시지ID입니다.");
			document.querySelector(`#${this.targetElId} [name='msgId']`).value = msgId.slice(0,1);
			return;
		}

		//메시지타입유형이 맞지 않는 경우
		if(!regex.test(msgId.slice(0,1))){
			await CMMN.alert("존재하지 않는 유형입니다 메시지ID를 확인해주세요.");
			document.querySelector(`#${this.targetElId} [name='msgId']`).value = "";
			return;
		}

		//아이디 형식과 메시지타입유형이 맞는 경우
		document.querySelector(`#${this.targetElId} [name='msgType']`).value = msgId.slice(0,1);

	},

	//저장
	save : async function(){

		//메시지유형 셋팅
		this.data.params.msgType = document.querySelector(`#${this.targetElId} [name='msgType']`).value;

		//밸리데이션체크 (메시지코드 + 중복체크했는지 확인 / 메시지명입력되었는지 확인)
		const msgId = document.querySelector(`#${this.targetElId} [name='msgId']`).value.toUpperCase(); //메시지아이디 입력값
		const msgIdHidden = document.querySelector(`#${this.targetElId} [name='msgIdHidden']`).value.toUpperCase(); //메시지아이디 히든입력값
		const regex = /^[EFSIWefsiw][0-9]{3}$/; //정규식 영어1자리+숫자3자리

		if(!regex.test(msgId)){
			await CMMN.alert("메시지ID를 확인해주세요.");
			return
		}

		if(msgId != msgIdHidden){
			await CMMN.alert("중복확인을 해주세요.");
			return
		}

		if(!this.data.params.msgNm){
			await CMMN.alert("메시지명을 입력해주세요.");
			return
		}

		//신규일때(저장 전 아이디체크 다시 하기)
		if(this.data.isNew){
			if(!await this.check("save")){
				return;
			}
		}


		const params = this.data.params;

		console.log(params);

		//등록할건지 확인창
		const confirmMsg =  `입력한 내용을 ${this.data.isNew ? '등록' : '수정'} 하시겠습니까?`;
		if(!await CMMN.confirm(confirmMsg)) {
			return;
		}

		//저장하기
		if(this.data.isNew){
			//신규등록
			await CMMN.api.post('/api/sys/SysMsgMng/insertList', { params });
		}else{
			//수정등록
			await CMMN.api.post('/api/sys/SysMsgMng/updateList', { params });

		}

		//등록완료 후 팝업닫기
		this.close();  // 팝업을 닫는다.

		//콜백
		if(this.data.callbacks[0]) {
			this.data.callbacks[0]();
		}

	},

}





















