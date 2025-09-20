window.addEventListener('FLE001003_P01', () => {
	FLE001003_P01.init();
})

const FLE001003_P01 = {
	targetElId: 'FLE001003_P01',
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

		// grid 설정 옵션 (gridOptions_01 : 목차선택 그리드)
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
				/*{
					maxWidth: 50,
					minWidth: 50,
					lockPosition: 'left', // 위치를 왼쪽으로 고정
					rowDrag: true,
				},*/
				{
					headerName: '목차명',
					field: 'title',
					maxWidth: 500,
					editable: true,
				},
				{
					headerName: '시작페이지',
					field: 'startPage',
					maxWidth: 120,
					editable: true,
				},
				{
					headerName: '종료페이지',
					field: 'endPage',
					maxWidth: 120,
					editable: true,
				},
				/*{
					headerName: '순서',
					field: 'idx',
					maxWidth: 100,
				},*/
			],
			defaultColDef: {  // 기본 컬럼정의
				flex: 1,  // 컬럼이동이 가능하게 한다.
				minWidth: 100,  // 각 컬럼당 최소넓이
				resizable: true,  // 컬럼사이즈 조정가능 여부
				suppressMovable: true, // 컬럼 이동 불가 설정
				wrapHeaderText: true,
			},
			rowDragManaged: true,  // row를 drag 가능하게 한다.
			suppressRowClickSelection: true,  // row 클릭으로 row가 선택처리되는 것을 막는다. 체크박스를 통해서만 선택이 가능해야 되기 때문...
			rowSelection: 'multiple', // 다중선택이 가능하게 한다.
		},
		// grid 설정 옵션 (gridOptions_02 : 목차확인 그리드)
		gridOptions_02: {
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
					headerName: '목차명',
					field: 'title',
					maxWidth: 500,
				},
				{
					headerName: '시작페이지',
					field: 'startPage',
					maxWidth: 120,
				},
				{
					headerName: '종료페이지',
					field: 'endPage',
					maxWidth: 120,
				},
				/*{
					headerName: '순서',
					field: 'idx',
					maxWidth: 100,
				},*/
			],
			defaultColDef: {  // 기본 컬럼정의
				flex: 1,  // 컬럼이동이 가능하게 한다.
				minWidth: 100,  // 각 컬럼당 최소넓이
				resizable: true,  // 컬럼사이즈 조정가능 여부
				suppressMovable: true, // 컬럼 이동 불가 설정
				wrapHeaderText: true,
			},
			rowDragManaged: true,  // row를 drag 가능하게 한다.
			suppressRowClickSelection: true,  // row 클릭으로 row가 선택처리되는 것을 막는다. 체크박스를 통해서만 선택이 가능해야 되기 때문...
			rowSelection: 'multiple', // 다중선택이 가능하게 한다.
		},
		// grid 에서 클릭한 row의 데이터
		gridClickedData: {},  // grid 에서 클릭한 row의 데이터
	},
	// 화면 UI 설정
	configUI: function() {
		//내용 초기화
		document.querySelector(`#${this.targetElId} [name='calPage']`).value = '';

		const footerBox = document.querySelector(`#${this.targetElId} [id='titleAddList']`);
		footerBox.style.border = '1px solid #babfc7';
		footerBox.style.padding = '10px';
		footerBox.style.borderRadius = '6px';

		this.initValue();
	},
	// grid 초기화
	gridInit: function() {
		// 선택된 row들의 변경 이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions_01.onSelectionChanged = this.gridOnSelectionChanged.bind(this);
		// 선택된 row들의 drag 이벤트 발생시 리스너 함수를 적용.
		this.data.gridOptions_01.onRowDragEnd = this.gridOnRowDragEnd.bind(this);
		// row 클릭이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions_01.onCellClicked = this.gridOnCellClicked.bind(this);
		// grid 초기화
		new agGrid.Grid(
			document.querySelector(`#${this.targetElId} [data-field='indvClusCrtMppgLst_01']`),
			this.data.gridOptions_01
		);
		this.data.gridOptions_01.api.setRowData([]);
		this.data.gridSelectedDataList = [];

		// grid 초기화
		new agGrid.Grid(
			document.querySelector(`#${this.targetElId} [data-field='indvClusCrtMppgLst_02']`),
			this.data.gridOptions_02
		);
		this.data.gridOptions_02.api.setRowData([]);
	},
	// grid row drag 발생
	gridOnRowDragEnd: function() {
		// console.log('드래그 종료:', event.node.data);
		let newRowList = [];
		const rowCount = this.data.gridOptions_01.api.getDisplayedRowCount();
		for (let i = 0; i < rowCount; i++) {
			const rowNode = this.data.gridOptions_01.api.getDisplayedRowAtIndex(i);
			newRowList.push(rowNode.data);
		}

		// grid_02 데이터 sorting 셋팅
		newRowList.forEach((item, idx) => {
			item.idx = idx;
		});

		this.data.gridOptions_01.api.setRowData(newRowList);
	},
	// grid 선택이벤트 발생
	gridOnSelectionChanged: function(event) {
		this.data.gridSelectedDataList = [];
		event.api.getSelectedNodes().forEach(item => {
			item.data.selected = "Y";
			this.data.gridSelectedDataList.push(item.data)
		});
	},
	// grid 셀 클릭 이벤트 발생
	gridOnCellClicked: function(event) {
		// console.log('클릭한 행:', event.data);
		// 객체를 깊은복사를 진행한다.
		this.data.gridClickedData = JSON.parse(JSON.stringify(event.data));

		this.titleSet(this.data.gridClickedData);
	},
	// 팝업을 연다.
	open: function(params, callbacks) {
		this.data.params = params.pTocList;
		this.data.pageList = params.pageList;
		this.data.inputPdf = params.inputPdf;

		this.data.callbacks = callbacks || [];

		// 화면 UI 설정
		this.configUI();

		// 팝업의 내용을 셋팅한다.
		this.setPopUiData(this.data.params);

		this.prevPage();

		// 팝업을 보여준다.
		CMMN.showModal(this.data.modal);
	},
	// 팝업의 내용을 셋팅한다.
	setPopUiData: function(data) {
		// grid 에 데이터를 표시한다.
		this.data.gridOptions_01.api.setRowData(data);

		this.data.initData = data;

		if(this.data.initData.length > 0){
			this.data.totalPages = data[0].totalPages;
		}

		CMMN.sessionStorage.setItem('data', data);
		CMMN.sessionStorage.setItem('initData', data);
	},
	close: function(isClose) {
		if(CMMN.isEmpty(this.data.gridSelectedDataList) && isClose != "Y") {
			CMMN.alert('목차를 선택해주세요.')
			return;
		}

		if(this.data.callbacks[0]) {
			this.data.callbacks[0](this.data.gridSelectedDataList);
		}

		//클릭 데이터 초기화
		this.data.gridClickedData = {};
		//선택 데이터 초기화
		this.data.gridSelectedDataList = [];

		// 화면 UI 설정
		this.configUI();

		CMMN.hideModal(this.data.modal);
	},
	//값 초기화 [목차 추가 입력영역]
	initValue: function() {
		document.querySelector(`#${this.targetElId} [data-field='title']`).value = "";
		document.querySelector(`#${this.targetElId} [data-field='startPage']`).value = "";
		document.querySelector(`#${this.targetElId} [data-field='endPage']`).value = "";
		document.querySelector(`#${this.targetElId} [id='titleAddList']`).style.setProperty('display', 'none', 'important');
	},
	// 목차선택으로 되돌아가기
	prevPage: async function(isInit) {
		const titleName = "목차선택";

		document.querySelector(`#${this.targetElId} [data-field='calPage']`).value = "";
		document.querySelector(`#${this.targetElId} [data-field='saveFileNm']`).value = "";

		this.initValue();

		document.querySelector(`#${this.targetElId} [id='scroll_01']`).style.display = "";
		document.querySelector(`#${this.targetElId} [id='scroll_02']`).style.setProperty('display', 'none', 'important');
		document.querySelector(`#${this.targetElId} [id='button_01']`).style.display = "";
		document.querySelector(`#${this.targetElId} [id='button_02']`).style.setProperty('display', 'none', 'important');
		document.querySelector(`#${this.targetElId} [name='popupTitle']`).textContent = titleName;
		document.querySelector(`#${this.targetElId} [name='gridLabel']`).textContent = titleName;

		if(isInit == "Y"){
			const initData = CMMN.sessionStorage.getItem('initData');
			// grid 에 데이터를 표시한다.
			this.data.gridOptions_01.api.setRowData(CMMN.sessionStorage.getItem('initData'));
			// 현재 세션스토리지 값도 같이 초기화
			CMMN.sessionStorage.setItem('data', initData);
		} else {
			// grid 에 데이터를 표시한다.
			this.data.gridOptions_01.api.setRowData(!this.data.gridSelectedDataList.length ? this.data.initData : this.data.gridSelectedDataList);
		}
	},
	// 목차확인 팝업열기
	nextPage: async function() {
		if(CMMN.isEmpty(this.data.gridSelectedDataList)) {
			CMMN.alert('목차를 선택해주세요.')
			return;
		}

		const titleName = "목차확인";

		document.querySelector(`#${this.targetElId} [id='scroll_01']`).style.setProperty('display', 'none', 'important');
		document.querySelector(`#${this.targetElId} [id='scroll_02']`).style.display = "";
		document.querySelector(`#${this.targetElId} [id='button_01']`).style.setProperty('display', 'none', 'important');
		document.querySelector(`#${this.targetElId} [id='button_02']`).style.display = "";
		document.querySelector(`#${this.targetElId} [name='popupTitle']`).textContent = titleName;
		document.querySelector(`#${this.targetElId} [name='gridLabel']`).textContent = titleName;

		CMMN.sessionStorage.setItem('data', this.data.gridSelectedDataList)

		// grid 에 데이터를 표시한다.
		this.data.gridOptions_02.api.setRowData(this.data.gridSelectedDataList);
	},
	change: function(value) {
		const val = value.replace(/(?!^-)[^\d]/g, '');

		let oldVal = 0, newVal = val;
		let realVal = (isNaN(Number(oldVal)) ? 0 : Number(oldVal)) + (isNaN(Number(newVal)) ? 0 : Number(newVal));
		let data = "";

		if(!CMMN.isEmpty(CMMN.sessionStorage.getItem('data'))){
			data = CMMN.sessionStorage.getItem('data');
		} else {
			data = CMMN.sessionStorage.getItem('initData');
		}

		data.forEach((item, idx) => {
			item.startPage = (Number(item.startPage) + realVal > this.data.totalPages) ? this.data.totalPages : Number(item.startPage) + realVal;
			item.endPage = (Number(item.endPage) + realVal > this.data.totalPages) ? this.data.totalPages : Number(item.endPage) + realVal;
		})

		this.data.initData = data;
		this.data.gridOptions_01.api.setRowData(data);

		this.initValue();
	},
	// 목차 수정
	titleSave: async function() {
		const title = document.querySelector(`#${this.targetElId} [data-field='title']`).value;
		const startPage = document.querySelector(`#${this.targetElId} [data-field='startPage']`).value;
		const endPage = document.querySelector(`#${this.targetElId} [data-field='endPage']`).value;
		const totalPages = this.data.totalPages;

		if(CMMN.isEmpty(title)) {
			await CMMN.alert('목차명을 입력해주세요.');
			document.querySelector(`#${this.targetElId} [data-field='title']`).focus();
			return;
		}
		if(CMMN.isEmpty(startPage)) {
			await CMMN.alert('시작페이지를 입력해주세요.');
			document.querySelector(`#${this.targetElId} [data-field='startPage']`).focus();
			return;
		}
		if(CMMN.isEmpty(endPage)) {
			await CMMN.alert('종료페이지를 입력해주세요.');
			document.querySelector(`#${this.targetElId} [data-field='endPage']`).focus();
			return;
		}
		if(startPage > endPage){
			await CMMN.alert('시작페이지가 종료페이지 보다 큽니다.');
			document.querySelector(`#${this.targetElId} [data-field='startPage']`).focus();
			return;
		}
		if(totalPages < startPage){
			await CMMN.alert('시작페이지가 총 페이지 보다 큽니다. (총 페이지 : ' + totalPages + '페이지)');
			document.querySelector(`#${this.targetElId} [data-field='startPage']`).focus();
			return;
		}
		if(totalPages < endPage){
			await CMMN.alert('종료페이지가 총 페이지 보다 큽니다. (총 페이지 : ' + totalPages + '페이지)');
			document.querySelector(`#${this.targetElId} [data-field='endPage']`).focus();
			return;
		}
		if(!await CMMN.confirm('입력하신 목차를 수정하시겠습니까?')) {
			return;
		}

		let newRowList = [];
		const rowCount = this.data.gridOptions_01.api.getDisplayedRowCount();
		const gridClickedData = this.data.gridClickedData;

		for (let i = 0; i < rowCount; i++) {
			const rowNode = this.data.gridOptions_01.api.getDisplayedRowAtIndex(i);
			let isSaveRow = "N";

			if(gridClickedData.idx == rowNode.data.idx){
				isSaveRow = "Y";
			}

			if(isSaveRow == "Y"){
				rowNode.data.title = title;
				rowNode.data.startPage = startPage;
				rowNode.data.endPage = endPage;

				newRowList.push(rowNode.data);
			} else {
				newRowList.push(rowNode.data);
			}
		}

		newRowList = this.newRowListSort(newRowList);

		CMMN.sessionStorage.setItem('data', newRowList);

		this.data.gridOptions_01.api.setRowData(newRowList);
	},
	// 목차 신규등록
	titleAdd: async function() {
		if(this.data.saveType == "U"){
			this.titleSave();
			return;
		}

		const title = document.querySelector(`#${this.targetElId} [data-field='title']`).value;
		const startPage = document.querySelector(`#${this.targetElId} [data-field='startPage']`).value;
		const endPage = document.querySelector(`#${this.targetElId} [data-field='endPage']`).value;
		const totalPages = this.data.totalPages;

		if(CMMN.isEmpty(title)) {
			await CMMN.alert('목차명을 입력해주세요.');
			document.querySelector(`#${this.targetElId} [data-field='title']`).focus();
			return;
		}
		if(CMMN.isEmpty(startPage)) {
			await CMMN.alert('시작페이지를 입력해주세요.');
			document.querySelector(`#${this.targetElId} [data-field='startPage']`).focus();
			return;
		}
		if(CMMN.isEmpty(endPage)) {
			await CMMN.alert('종료페이지를 입력해주세요.');
			document.querySelector(`#${this.targetElId} [data-field='endPage']`).focus();
			return;
		}
		if(startPage > endPage){
			await CMMN.alert('시작페이지가 종료페이지 보다 큽니다.');
			document.querySelector(`#${this.targetElId} [data-field='startPage']`).focus();
			return;
		}
		if(totalPages < startPage){
			await CMMN.alert('시작페이지가 총 페이지 보다 큽니다. (총 페이지 : ' + totalPages + '페이지)');
			document.querySelector(`#${this.targetElId} [data-field='startPage']`).focus();
			return;
		}
		if(totalPages < endPage){
			await CMMN.alert('종료페이지가 총 페이지 보다 큽니다. (총 페이지 : ' + totalPages + '페이지)');
			document.querySelector(`#${this.targetElId} [data-field='endPage']`).focus();
			return;
		}
		if(!await CMMN.confirm('입력하신 목차를 등록하시겠습니까?')) {
			return;
		}

		let newRowList = [];
		const rowCount = this.data.gridOptions_01.api.getDisplayedRowCount();
		for (let i = 0; i < rowCount; i++) {
			const rowNode = this.data.gridOptions_01.api.getDisplayedRowAtIndex(i);
			newRowList.push(rowNode.data);
		}

		if(newRowList.length > 0){
			let lastObj = newRowList[newRowList.length - 1];
			newRowList.push({totalPages : 0, number : 0, title : title, startPage : startPage, endPage : endPage, firstPage : 0, idx : lastObj.idx + 1});
		} else {
			newRowList.push({totalPages : 0, number : 0, title : title, startPage : startPage, endPage : endPage, firstPage : 0, idx : 0});
		}

		newRowList = this.newRowListSort(newRowList);

		CMMN.sessionStorage.setItem('data', newRowList);

		this.data.gridOptions_01.api.setRowData(newRowList);
	},
	// 목차 신규등록 목록 노출
	titleAddList: function(buttonName, type) {
		this.data.saveType = type;

		if(type == "S"){
			document.querySelector(`#${this.targetElId} [data-field='title']`).value = "";
			document.querySelector(`#${this.targetElId} [data-field='startPage']`).value = "";
			document.querySelector(`#${this.targetElId} [data-field='endPage']`).value = "";
			document.querySelector(`#${this.targetElId} [data-field='title']`).focus();
		}

		document.querySelector(`#${this.targetElId} [id='titleAddList']`).style.display = '';

		const $scrollContainer = $(`#${this.targetElId} [id='scroll_01']`);
		const $target = $(`#${this.targetElId} [id='titleAddList']`);

		// 1) titleAddList 보이기 (important 제거 등 필요하면 style 직접 수정)
		$target.css('display', 'flex'); // 기존 클래스에 맞게 flex로 보이게 설정

		// 2) 조금 딜레이 줘서 렌더링 보장
		setTimeout(() => {
			// 3) #scroll 컨테이너 내에서 #titleAddList 위치에 스크롤
			const scrollTop = $scrollContainer.scrollTop() + $target.position().top;

			$scrollContainer.animate({ scrollTop: scrollTop }, 500);
		}, 100);

		document.querySelector(`#${this.targetElId} [data-field='titleButton']`).textContent = buttonName;
	},
	// 타이틀 세팅
	titleSet: function(data){
		this.titleAddList('수정', 'U');

		document.querySelector(`#${this.targetElId} [data-field='title']`).value = data.title;
		document.querySelector(`#${this.targetElId} [data-field='startPage']`).value = data.startPage;
		document.querySelector(`#${this.targetElId} [data-field='endPage']`).value = data.endPage;
	},
	// 삭제
	delete: async function() {
		if(this.data.gridSelectedDataList.length === 0) {
			await CMMN.alert('삭제할 목차를 선택하세요.');
			return;
		}
		if(!await CMMN.confirm('선택한 목차를 삭제하시겠습니까?')) {
			return;
		}

		let newRowList = [];
		const rowCount = this.data.gridOptions_01.api.getDisplayedRowCount();
		for (let i = 0; i < rowCount; i++) {
			const rowNode = this.data.gridOptions_01.api.getDisplayedRowAtIndex(i);
			let isDelete = "N";

			this.data.gridSelectedDataList.some((item, idx) => {
				if(item.idx == rowNode.data.idx){
					isDelete = "Y";
					return true;
				}
			});

			if(isDelete == "N"){
				newRowList.push(rowNode.data);
			}
		}

		CMMN.sessionStorage.setItem('data', newRowList);

		this.data.gridOptions_01.api.setRowData(newRowList);

		this.initValue();
	},
	// 배열을 정렬 한다.
	newRowListSort: function(newRowList){
		newRowList = newRowList.sort((a, b) => {
			if (a.startPage !== b.startPage) {
				return a.startPage - b.startPage;
			}
			return a.idx - b.idx;
		});

		for(let i = 0; i < newRowList.length; i++){
			newRowList[i].idx = i;
		}

		return newRowList;
	},
	// 자동분할처리 된 파일을 PC에 저장한다.
	autoSplitPdf: async function() {
		const fileNmList = [];
		/*document.querySelectorAll(`#${this.targetElId} [name='split_pdf']`).forEach(el => {
			if(el.checked) {
				const filenm = el.getAttribute('data-filenm');
				fileNmList.push(filenm);
			}
		});*/

		let resList = this.data.gridSelectedDataList;

		if(resList.length == 0) {
			await CMMN.alert('리스트를 먼저 추출하세요.');
			return;
		}

		const pageList = this.data.pageList;

		const saveFileNm = document.querySelector(`#${this.targetElId} [name='saveFileNm']`).value;
		if(!saveFileNm) {
			await CMMN.alert('저장 할 파일명을 입력하세요.');
			document.querySelector(`#${this.targetElId} [name='saveFileNm']`).focus();
			return;
		}

		if(!await CMMN.confirm('자동분할처리 된 파일을 PC에 저장하시겠습니까?')) return;

		const inputPdf = this.data.inputPdf;

		const strResList = JSON.stringify(resList);

		const params = {
			taskDir: "", // 분할된 pdf가 존재하는 서버측 임시작업폴더
			fileNmList,  // 합본할 PDF 목록
			saveFileNm, // 저장할 파일명
			pageList,
			inputPdf,
			strResList,
		}

		const options = { params, responseType: 'blob' }

		const response = await CMMN.api.post(`/api/cnt/prdtClusPdfMng/autoSplitPdf`, options);
		CMMN.downloadFileProc(response);

		// 모든 pdf 미리보기 선택을 해제
		document.querySelectorAll(`#${this.targetElId} [name='split_pdf']`).forEach(el => el.checked = false);
		// 저장할 파일명입력란을 초기화
		document.querySelector(`#${this.targetElId} [name='saveFileNm']`).value = '';
	},
	FLE001003_P01_callback: function(params) {
		// console.log('>>> FLE001003_P01_callback params: ', params);
	},
}