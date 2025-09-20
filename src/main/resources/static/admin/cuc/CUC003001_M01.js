
window.addEventListener('CUC003001_M01', () => {
	CUC003001_M01.init();
})

const CUC003001_M01 = {
	targetElId: 'CUC003001_M01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();
		// grid 초기화
		this.gridInit();
	},
	data: {
		// grid 설정 옵션
		gridOptions: {
			columnDefs: [  // grid 컬럼 정의
				{
					headerName: '약관항목코드',
					field: 'clusItmCd',
					minWidth: 135,
					maxWidth: 135,
				},
				{
					headerName: '주계약/특약',
					minWidth: 500,
					field: 'clusItmNm',
				},
				{
					headerName: '약관파일명',
					minWidth: 500,
					field: 'fileNm',
				},
				{
					headerName: '보종코드',
					minWidth: 135,
					field: 'inskndCd',
				},
			],
			defaultColDef: {  // 기본 컬럼정의
				flex: 1,  // 컬럼이동이 가능하게 한다.
				resizable: true,  // 컬럼사이즈 조정가능 여부
				suppressMovable: true, // 컬럼 이동 불가 설정
			},
		},
		dataList: [],  // 조회된 데이터목록
		prdt: {},  // 주계약정보
		mxtrClusCd: '',  // 개별약관조합코드
	},
	// 화면 UI 설정
	configUI: function() {
		// 계약일자
		$(`#${this.targetElId} [name='contYmd']`).datepicker({
			format: 'yyyy.mm.dd',	  // 날짜 형식
			autoclose: true,		   // 선택 시 자동 닫기
			todayHighlight: true,	  // 오늘 날짜 강조
			language: 'ko',			 // 한글 지원
			startDate: new Date("1000-01-01"),
			endDate: new Date("9999-12-31"),
		})
		.on("changeDate", (e) => { // 날자의 값이 변경될때마다 data.params 의 해당 데이터를 실시간 변경하도록 설정
			const selectedDate = e.format();
			document.querySelector(`#${this.targetElId} [name='contYmd']`).value = selectedDate;
			this.genMxtrClusCd();
		});
		$(`#${this.targetElId} [name='contYmd']`).datepicker('setDate', new Date());

		document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).value = '';

		// tag UI 별 권한제어  (I:insert, S:select, U:update, D:delete, E:excel)
		CMMN.setAuthBtn(this.targetElId)

		// document.querySelector(`#${this.targetElId} [name='searchResultShow']`).style.display = "none";

		// 슈퍼관리자그룹이 아닐경우...
		if(CMMN.user.authGrpCd !== '100') {
			const comCode = CMMN.user.comCode;
			const comName = CMMN.user.comName;
			$(`#${this.targetElId} [name='cmpnyNm']`).val(comName);
		}
	},
	// grid 초기화
	gridInit: function() {
		this.data.mxtrClusCd = '';
		// grid 초기화
		new agGrid.Grid(
			document.querySelector(`#${this.targetElId} [name='table-content']`),
			this.data.gridOptions
		);
		this.data.dataList = [];
		this.data.gridOptions.api.setRowData(this.data.dataList);
	},
	CMN_P04_open: function() {
		CMN000000_P04.open(
			{},
			[this.search.bind(this)]
		);
	},
	search: async function() {
		this.data.gridOptions.api.setRowData([]);
		document.querySelector(`#${this.targetElId} [name='CUC003001_M01_totalCount']`).innerText = "";

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

		const _mxtrClusCd = document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).value.toUpperCase();

		document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).value = _mxtrClusCd;

		const splitMxtrClusCd = document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).value.toUpperCase().split('-');

		let mxtrClusCd = "", hex = "", binary = "", condDate = "";

		if(splitMxtrClusCd.length > 2){
			mxtrClusCd = splitMxtrClusCd[0];
			hex = splitMxtrClusCd[1];
			condDate = splitMxtrClusCd[2];
		}

		// 약관번호를 입력하지 않은경우.
		if(CMMN.isEmpty(mxtrClusCd)) {
			await CMMN.alert('약관번호를 입력해주세요.');
			document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).focus();
			return;
		}

		const pattern = /^[A-Z0-9]{8}-[A-F0-9]+-\d{8}$/;

		// 약관번호 유효성 검사
		if(!pattern.test(_mxtrClusCd)) {
			await CMMN.alert('약관번호가 유효하지 않습니다.');
			document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).focus();
			return;
		}

		// 계약일자 날짜 유효성 검사
		if(!this.isValidDateString(condDate)) {
			await CMMN.alert('계약일자를 확인하세요.');
			document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).focus();
			return;
		}

		//16진수 부분 값이 8이하인 경우 [1번째 자리수로 판단]
		if(!CMMN.isEmpty(hex) && hex.length > 0) {
			if(parseInt(hex.charAt(0), 16) < 8){
				await CMMN.alert('주계약이 항상 가입 대상으로 첫번째 16진수 값은 항상 8 이상이어야 합니다.');
				document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).focus();
				return;
			}
		}

		const response = await CMMN.api.get(`/api/cnt/prdtClusMng/getInfo?prdtCd=${mxtrClusCd}`);

		//console.log('>>> response: ', response);

		this.data.dataList = response.data;

		let maxBinary = "";


		// 주계약을 추출한다.
		this.data.prdt
			= this.data.dataList.length > 0
				? this.data.dataList.find(d => d.clusItmClcd == "C")
				: {};

		document.querySelector(`#${this.targetElId} [name='clusItmNm']`).value
			= this.data.prdt.clusItmNm || '';

		// 주계약,특약만으로 다시 재구성한다.
		this.data.dataList
			= this.data.dataList
				.filter(d => d.clusItmClcd === 'C' || d.clusItmClcd === 'T')  // 주계약,특약만 추출
				.sort((a, b) => Number(a.sn) - Number(b.sn))  // 순번으로 정렬
				;

		// 16진수 값을 2진수로 변환한다. [maxBinary 값]
		for(let i = 0; i < this.data.dataList.length; i++){
			maxBinary += "1";
		}

		let mod = this.data.dataList.length % 4;

		if(mod > 0){
			// 16진수 값을 2진수로 변환한다. [maxBinary 값]
			for(let i = 0; i < mod; i++){
				maxBinary += "0";
			}
		}

		// 16진수 값을 2진수로 변환한다.
		for(let i = 0; i < hex.length; i++){
			let hx = hex.substring(i, i+1);
			binary += parseInt(hx, 16).toString(2).lpad(4, '0');
		}

		if(Number(binary) > Number(maxBinary)){
			await CMMN.alert('약관번호를 확인해주세요.');
			document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).focus();
			return;
		}

		let newList = [];

		// 2진수로 변환한 값을 이용하여 1이면 목록에 띄워주고 0이면 제외대상이다.
		for(let i = 0; i < binary.length; i++){
			let bx = binary.substring(i, i+1);

			if(!CMMN.isEmpty(this.data.dataList[i]) && bx == '1'){
				newList.push(this.data.dataList[i]);
			}
		}

		console.log('>>> this.data.dataList: ', newList);
		this.data.gridOptions.api.setRowData(newList);

		document.querySelector(`#${this.targetElId} [name='CUC003001_M01_totalCount']`).innerText = '총 건수 : ' + CMMN.priceToString(newList.length);

		//this.genMxtrClusCd();
	},
	// 가입여부 선택 체크박스값이 변경되면...
	onChangeChk: async function(clusItmCd, obj){

		let isChecked = obj.checked;
		const clusItm = this.data.dataList.find(d => d.clusItmCd === clusItmCd);
		// 체크표시를 했는데, 약관파일이 존재하지 않으면...
		if(isChecked && !clusItm.fileNm) {
			await CMMN.alert('약관파일이 존재하지 않아서 선택이 불가합니다.');
			obj.checked = false; // 다시 체크박스의 체크표시를 해제한다.
			return;
		}
		clusItm.chk = isChecked;

		// console.log('>>> clusItmCd, isChecked: ', clusItmCd, isChecked);  // 약관항목코드, 선택여부
		// console.log('>>> onChangeChk this.data.dataList: ', this.data.dataList);

		this.genMxtrClusCd();
	},
	isValidDateString: function(dateStr) {
		// 1. 정규식: 정확히 8자리 숫자 형식 (YYYYMMDD)
		if (!/^\d{8}$/.test(dateStr)) {
			return false;
		}

		// 2. 연도, 월, 일 추출
		const year = parseInt(dateStr.substring(0, 4), 10);
		const month = parseInt(dateStr.substring(4, 6), 10);
		const day = parseInt(dateStr.substring(6, 8), 10);

		// 3. 날짜 객체 생성
		const date = new Date(year, month - 1, day);

		// 4. 실제 날짜와 비교 (자동 보정 방지)
		return (
			date.getFullYear() === year &&
			date.getMonth() === month - 1 &&
			date.getDate() === day
		);
	},
	genMxtrClusCd: function() {
		this.data.mxtrClusCd = '';

		if(this.data.dataList.length == 0) return;

		const dataList_T = this.data.dataList;

		// 4로 나눈 나머지는 모두 chk를 false로 채운다.
		let tmpval = dataList_T.length % 4;
		if(tmpval !== 0){
			tmpval = 4 - tmpval;
			for(let i=0; i < tmpval; i++) {
				dataList_T.push( { chk: false } );
			}
		}

		// 이진수 생성
		const binary = dataList_T.reduce((prev, curr) => prev += curr.chk ? '1' : '0', '')
		// console.log('>>> binary: ', binary);

		const binarySize = binary.length;
		let hex = '';
		for(let i=0; i<binarySize; i+=4) {
			// 이진수를 16진수로 변환
			const bi = binary.substring(i, i+4);
			hex += parseInt(bi, 2)
					.toString(16)
					.toUpperCase();
		}
		// console.log('>>> hex: ', hex);

		// 계약일자추출
		const contYmd = document.querySelector(`#${this.targetElId} [name='contYmd']`).value;
		if(!contYmd) return;

		// 약관조합코드를 생성한다.
		this.data.mxtrClusCd =
			this.data.prdt.prdtCd
			+ '-'
			+ hex
			+ '-'
			+ contYmd.replaceAll('.','')
			;
		// console.log('>>> 약관조합코드: ', mxtrClusCd);
		document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).value = this.data.mxtrClusCd;

		// document.querySelector(`#${this.targetElId} [name='searchResultShow']`).style.display = "flex";
	},
	// 약관조합코드에 의한 개별약관 생성
	procIndvClusCrtmx: async function() {
		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

		const __mxtrClusCd = document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).value.toUpperCase();

		document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).value = __mxtrClusCd;

		const mxtrClusCd = document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).value;

		const _splitMxtrClusCd = document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).value.toUpperCase().split('-');

		let ___mxtrClusCd = "", hex = "", binary = "", condDate = "";

		if(_splitMxtrClusCd.length > 2){
			___mxtrClusCd = _splitMxtrClusCd[0];
			hex = _splitMxtrClusCd[1];
			condDate = _splitMxtrClusCd[2];
		}

		// 약관번호를 입력하지 않은경우
		if(CMMN.isEmpty(___mxtrClusCd)) {
			await CMMN.alert('약관번호를 입력해주세요.');
			document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).focus();
			return;
		}

		const pattern = /^[A-Z0-9]{8}-[A-F0-9]+-\d{8}$/;

		// 약관번호 유효성 검사
		if(!pattern.test(mxtrClusCd)) {
			await CMMN.alert('약관번호가 유효하지 않습니다.');
			document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).focus();
			return;
		}

		// 계약일자 날짜 유효성 검사
		if(!this.isValidDateString(condDate)) {
			await CMMN.alert('계약일자를 확인하세요.');
			document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).focus();
			return;
		}

		//16진수 부분 값이 8이하인 경우 [1번째 자리수로 판단]
		if(!CMMN.isEmpty(hex) && hex.length > 0) {
			if(parseInt(hex.charAt(0), 16) < 8){
				await CMMN.alert('주계약이 항상 가입 대상으로 첫번째 16진수 값은 항상 8 이상이어야 합니다.');
				document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).focus();
				return;
			}
		}

		const __response = await CMMN.api.get(`/api/cnt/prdtClusMng/getInfo?prdtCd=${___mxtrClusCd}`);

		this.data.dataList = __response.data;

		let maxBinary = "";

		// 주계약을 추출한다.
		this.data.prdt
			= this.data.dataList.length > 0
				? this.data.dataList.find(d => d.clusItmClcd == "C")
				: {};

		document.querySelector(`#${this.targetElId} [name='clusItmNm']`).value
			= this.data.prdt.clusItmNm || '';

		// 주계약,특약만으로 다시 재구성한다.
		this.data.dataList
			= this.data.dataList
				.filter(d => d.clusItmClcd === 'C' || d.clusItmClcd === 'T')  // 주계약,특약만 추출
				.sort((a, b) => Number(a.sn) - Number(b.sn))  // 순번으로 정렬
				;

		// 16진수 값을 2진수로 변환한다. [maxBinary 값]
		for(let i = 0; i < this.data.dataList.length; i++){
			maxBinary += "1";
		}

		let mod = this.data.dataList.length % 4;

		if(mod > 0){
			// 16진수 값을 2진수로 변환한다. [maxBinary 값]
			for(let i = 0; i < mod; i++){
				maxBinary += "0";
			}
		}

		// 16진수 값을 2진수로 변환한다.
		for(let i = 0; i < hex.length; i++){
			let hx = hex.substring(i, i+1);
			binary += parseInt(hx, 16).toString(2).lpad(4, '0');
		}

		if(Number(binary) > Number(maxBinary)){
			await CMMN.alert('약관번호를 확인해주세요.');
			document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).focus();
			return;
		}

		const splitMxtrClusCd = mxtrClusCd.split('-');

		let _mxtrClusCd = "";

		if(splitMxtrClusCd.length > 0){
			_mxtrClusCd = splitMxtrClusCd[0];
		}

		const _response = await CMMN.api.get(`/api/cnt/prdtClusMng/getInfo?prdtCd=${_mxtrClusCd}`);

		//console.log('>>> _response: ', _response);

		this.data.dataList = _response.data;

		const prdtInfo = this.data.dataList.find(d => d.clusItmClcd === 'C');

		if(!prdtInfo) {
			await CMMN.alert('주계약의 약관파일이 존재하지 않아서 처리가 불가합니다.');
			return;
		}

		const options = { responseType: 'blob' }
		const response = await CMMN.api.get(`/api/cnt/prdtClusPdfMng/indvClusRcv?mxtrClusCd=${mxtrClusCd}&sndurl=${location.href}`, options);
		// CMMN.downloadFileProc(response);
		const filename = prdtInfo.clusItmNm;


		const href = window.URL.createObjectURL(new Blob([response.data]));
		const toUrl = `/static/lib/pdfjs-custom/web/viewer.html?filename=${filename}&file=${href}`;

		//window.open(encodeURI(toUrl), '_blank');
		const src = encodeURI(toUrl);

		this.CMN_P06_open({ src });
	},
	CMN_P06_open: function(params) {
		CMN000000_P06.open(
			params,
			[]
		);
	},
	splitDn: async function() {
		if(!this.data.mxtrClusCd) {
			await CMMN.alert('조합약관코드를 생성해 주세요.');
			return;
		}

		const prdtInfo = this.data.dataList.find(d => d.clusItmClcd === 'C');
		if(!prdtInfo.chk) {
			await CMMN.alert('주계약의 약관파일이 존재하지 않아서 처리가 불가합니다.');
			return;
		}

		const options = { responseType: 'blob' }
		const response = await CMMN.api.get(`/api/cnt/prdtClusPdfMng/indvClusRcvSplitDn?mxtrClusCd=${this.data.mxtrClusCd}`, options);
		CMMN.downloadFileProc(response);
	},
};