window.addEventListener('SYS001004_M01', () => {
	SYS001004_M01.init();
})

const SYS001004_M01 = {
	targetElId: 'SYS001004_M01',

	init: function() {
		// tag UI 별 권한제어  (I:insert, S:select, U:update, D:delete, E:excel)
		CMMN.setAuthBtn(this.targetElId)

		this.search();
	},

	data: {

	},

	//값 조기화
	reset: async function() {
		//값 초기화
		document.querySelector(`#${this.targetElId} [name='cd']`).value = "";
		document.querySelector(`#${this.targetElId} [name='cdNm']`).value = "";
		document.querySelector(`#${this.targetElId} [name='qrUrl']`).value = "";

		if(Object.keys(this.data.dataObj).length > 0){
			const dataObj = this.data.dataObj;

			document.querySelector(`#${this.targetElId} [name='cd']`).value = dataObj.cd;
			document.querySelector(`#${this.targetElId} [name='cdNm']`).value = dataObj.cdNm;
			document.querySelector(`#${this.targetElId} [name='qrUrl']`).value = dataObj.cdVal1;

			this.getQrCode();
		} else {
			await CMMN.alert("QR 코드 정보가 없습니다. QR 코드 정보가 등록 되어있는지 확인 해주세요.");

			document.querySelector(`#${this.targetElId} [name='reset']`).disabled = true;
		}
	},

	//조회
	search: async function() {
		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

		//값 초기화
		document.querySelector(`#${this.targetElId} [name='cd']`).value = "";
		document.querySelector(`#${this.targetElId} [name='cdNm']`).value = "";
		document.querySelector(`#${this.targetElId} [name='qrUrl']`).value = "";

		const params = {
			grpCdNm : "QR",
			//cd : "Q01",
		}

		const response = await CMMN.api.post('/api/sys/DtlCdMng/getList', { params });

		if(response.data.length > 0){
			const dataObj = response.data[0];

			this.data.dataObj = dataObj;

			document.querySelector(`#${this.targetElId} [name='cd']`).value = dataObj.cd;
			document.querySelector(`#${this.targetElId} [name='cdNm']`).value = dataObj.cdNm;
			document.querySelector(`#${this.targetElId} [name='qrUrl']`).value = dataObj.cdVal1;

			qrImg.src = dataObj.qrImg;
		} else {
			await CMMN.alert("QR 코드 정보가 없습니다. QR 코드 정보가 등록 되어있는지 확인 해주세요.");

			document.querySelector(`#${this.targetElId} [name='reset']`).disabled = true;
		}
	},

	// 이미지 영역에 QR코드 표시
	getQrCode: async function() {
		const url = document.querySelector(`#${this.targetElId} [name='qrUrl']`);
		const qrImg = document.querySelector(`#${this.targetElId} [id='qrImg']`);

		qrImg.src = "";

		const params = {
			mxtrClusCd: url.value,
		};

		const options = { params, loadingbar: 'N' }

		const response = await CMMN.api.post('/api/cnt/prdtClusPdfMng/getQrCode', options);

		qrImg.src = response.data;
	},

	// QR코드 수정 (상세 코드)
	saveQrCode: async function() {
		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "U")) return;

		const cd = document.querySelector(`#${this.targetElId} [name='cd']`);
		const cdNm = document.querySelector(`#${this.targetElId} [name='cdNm']`);
		const qrUrl = document.querySelector(`#${this.targetElId} [name='qrUrl']`);

		//validation
		//빈값 확인
		if(cd.value == ""){
			await CMMN.alert('QR이미지사용번호를 입력해주세요.');
			cd.focus();
			return;
		}
		if(cdNm.value == ""){
			await CMMN.alert('콘텐츠명을 입력해주세요.');
			cdNm.focus();
			return;
		}
		if(qrUrl.value == ""){
			await CMMN.alert('QR URL을 입력해주세요.');
			qrUrl.focus();
			return;
		}

		if(!await CMMN.confirm('수정하시겠습니까?')){
			return;
		} else {
			//콘텐츠명 변경
			this.data.dataObj.cdNm = cdNm.value;
			//콘텐츠 상세 설명도 같이 반영
			this.data.dataObj.cdDesc = cdNm.value;
			//QR URL 변경
			this.data.dataObj.cdVal1 = qrUrl.value;

			const params = this.data.dataObj;

			await CMMN.api.post('/api/sys/DtlCdMng/updateList', { params });

			await CMMN.alert("수정이 완료되었습니다.");
		}
	},
}