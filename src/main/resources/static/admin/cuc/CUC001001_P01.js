window.addEventListener('CUC001001_P01', () => {
	CUC001001_P01.init();
})

const CUC001001_P01 = {
	targetElId: 'CUC001001_P01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();

		// grid 초기화
		this.gridInit();

		// 팝업 인스턴스를 생성한다.
		this.data.modal = CMMN.genModal(
			document.getElementById(this.targetElId)
		);

		// 팝업을 마우스드래그로 이동이 가능하게 한다.
		CMMN.setModalDraggable(this.data.modal);
	},
	data: {
		modal: null,
		params: {},
		callbacks: [],
		isNew: false,
		old_prdtChgYmd: null,

		// grid 설정 옵션
		gridOptions: {
			columnDefs: [  // grid 컬럼 정의
				{
					headerName: '약관항목코드',
					field: 'clusItmCd',
					maxWidth: 120,
				},
				{
					headerName: '주계약/특약명',
					field: 'clusItmNm',
					maxWidth: 300,
				},
				{
					headerName: '순번',
					field: 'sn',
					maxWidth: 80,
				},
				{
					headerName: '주/특약가입',
					field: 'sbscrbYn',
					maxWidth: 80,
				},
				{
					headerName: '보종코드',
					field: 'inskndCd',
					maxWidth: 120,
				},
			],
			defaultColDef: {  // 기본 컬럼정의
				flex: 1,  // 컬럼이동이 가능하게 한다.
				minWidth: 100,  // 각 컬럼당 최소넓이
				resizable: true,  // 컬럼사이즈 조정가능 여부
				suppressMovable: true, // 컬럼 이동 불가 설정
				wrapHeaderText: true,
			},
			suppressRowTransform: true,
		},
		// grid 에서 클릭한 row의 데이터
		gridClickedData: {},  // grid 에서 클릭한 row의 데이터
	},
	// 화면 UI 설정
	configUI: function() {
	},
	// grid 초기화
	gridInit: function() {
		// row 클릭이벤트 발생시 리스너함수를 적용.
		// this.data.gridOptions.onCellClicked = this.gridOnCellClicked.bind(this);
		// grid 초기화
		new agGrid.Grid(
			document.querySelector(`#${this.targetElId} [data-field='indvClusCrtMppgLst']`),
			this.data.gridOptions
		);
		this.data.gridOptions.api.setRowData([]);
	},
	// grid 셀 클릭 이벤트 발생
	gridOnCellClicked: async function(event) {
		// 객체를 깊은복사를 진행한다.
		this.data.gridClickedData = JSON.parse(JSON.stringify(event.data));
		this.data.gridClickedData.rowIndex = event.rowIndex;

		// 파일 다운로드
		if(!CMMN.isEmpty(event.data)){
			if(event.colDef.field == 'fileNo' && !CMMN.isEmpty(event.data.fileNo) && event.data.fileNo.endsWith('.pdf')){
				await CMMN.downloadfilePost(event.data.fileNo);
				return;
			} else if(event.colDef.field == 'fileNo' && CMMN.isEmpty(event.data.fileNo)){
				await CMMN.alert('업로드한 파일이 없습니다.');
				return;
			}
		} else {
			await CMMN.alert('업로드한 파일이 없습니다.');
			return;
		}
	},
	// 팝업을 연다.
	open: function(params, callbacks) {
		this.data.params = params;
		this.data.callbacks = callbacks || [];

		// 팝업의 내용을 셋팅한다.
		this.setPopUiData(this.data.params);

		// 팝업을 보여준다.
		CMMN.showModal(this.data.modal);

		//개별약관생성조합내역상세조회
		this.indvClusMngDtl(this.data.params);
	},
	// 팝업의 내용을 셋팅한다.
	setPopUiData: function(data) {
		document.querySelector(`#${this.targetElId} [name='indvClusRcvId']`).value = data.indvClusRcvId;
		document.querySelector(`#${this.targetElId} [name='rcmYmd']`).value = data.rcmYmd;
		document.querySelector(`#${this.targetElId} [name='mncntrctSpccNm']`).value = data.mncntrctSpccNm;
		document.querySelector(`#${this.targetElId} [name='sndurl']`).value = data.sndurl;
		document.querySelector(`#${this.targetElId} [name='mxtrClusCd']`).value = data.mxtrClusCd;
		document.querySelector(`#${this.targetElId} [name='cmpnyNm']`).value = data.cmpnyNm;
	},
	// 개별약관생성조합내역상세조회
	indvClusMngDtl: async function(data) {
		const params = {
			indvClusRcvId: data.indvClusRcvId,
			prdtCd: data.prdtCd,
		}

		const response = await CMMN.api.post('/api/cuc/clusCd/clusResHisDtlList', { params });

		// console.log(">>> response: ", response);

		// grid 에 데이터를 표시한다.
		this.data.gridOptions.api.setRowData(response.data);

		// 페이징정보 추출
		// this.data.paginator_01 = response.data.paginator;

		// grid 하단의 페이징 표시처리
		/*CMMN.setPagination(
			`#${this.targetElId} [name='paginator_01']`,  // 페이징표시를 셋팅할 타겟
			this.data.paginator_01,  // 페이징정보
			this.pageTo_01.bind(this),  // 패이지이동시 실행할 함수
		)*/
		// document.querySelector("#IDC001001_M01_totalCount").innerText = '총 건수 : ' + this.data.paginator_01.totalCount;
	},
	close: function() {
		CMMN.hideModal(this.data.modal);
	},
	CUC001001_P01_callback: function(params) {
		// console.log('>>> CUC001001_P01_callback params: ', params);
	},
}