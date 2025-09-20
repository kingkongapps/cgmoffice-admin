window.addEventListener('SYS005002_M01', () => {
	SYS005002_M01.init();
})

const SYS005002_M01 = {
	targetElId: 'SYS005002_M01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();

		// grid01 초기화
		this.gridInit_01();

		// 검색실행
		this.condChange();

		this.pageToFirst_01();
	},
	data: {
		selectCond: 'cond_01',
		// 페이징처리 설정
		pageConfig_01: {
			page: 1,
			orders: [ { target: 'mdfDtm', isAsc: false } ],
		},
		// 페이징처리후 페이징정보
		paginator_01: {},
		// grid 설정 옵션
		gridOptions_01: {
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
					headerName: '수정일시',
					field: 'mdfDtm',
					minWidth: 150,
				},
				{
					headerName: '약관파일명',
					minWidth: 150,
					field: 'fileNm',
				},
				{
					headerName: '약관파일ID',
					field: 'fileNo',
					minWidth: 450,
				},
				{
					headerName: '생성자',
					field: 'crtr',
					minWidth: 120,
				},
				{
					headerName: '생성일시',
					field: 'crtDtm',
					minWidth: 120,
				},
				{
					headerName: '타입코드',
					minWidth: 100,
					field: 'fileGb',
				},
				{
					headerName: '정렬순서',
					field: 'sortNo',
					minWidth: 120,
				},
				{
					headerName: '파일용량',
					field: 'fileSize',
					minWidth: 120,
				},
				{
					headerName: '파일확장자',
					field: 'fileExt',
					minWidth: 120,
				},
				{
					headerName: '파일타입',
					field: 'fileType',
					minWidth: 120,
				},
				{
					headerName: '저장파일물리경로',
					field: 'filePath',
					minWidth: 120,
				},
				{
					headerName: '비고',
					field: 'rm',
					minWidth: 120,
				},
				{
					headerName: '삭제여부',
					field: 'delYn',
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
	},
	// 화면 UI 설정
	configUI: async function() {

		//데이터피커사용
		$(`#${this.targetElId} [data-field='startDate']`).datepicker({
		    format: 'yyyy.mm.dd',
		    autoclose: true,
		    todayHighlight: true,
		    language: 'ko',
			startDate: new Date("1000-01-01"),
			endDate: new Date("9999-12-31"),
		}).on('changeDate', (e) => {
		    const selectedDate = e.date;
		    $(`#${this.targetElId} [data-field='endDate']`).datepicker('setStartDate', selectedDate);
		});

		$(`#${this.targetElId} [data-field='endDate']`).datepicker({
		    format: 'yyyy.mm.dd',
		    autoclose: true,
		    todayHighlight: true,
		    language: 'ko',
			startDate: new Date("1000-01-01"),
			endDate: new Date("9999-12-31"),
		}).on('changeDate', (e) => {
		    const selectedDate = e.date;
		    $(`#${this.targetElId} [data-field='startDate']`).datepicker('setEndDate', selectedDate);
		});

		// 항목분류 공통코드를 추출 및 dropdown 적용.
		/*const clusItmClcd = CMMN.getCmmnCd('CLUS_ITM_CLCD');
		document.querySelector(`#${this.targetElId} [name='searchClusItmClcd']`).innerHTML
			= clusItmClcd
				.sort((a, b) => a.sortNo - b.sortNo)
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.cd}">${curr.cdNm}</option>` );
				}, '<option value="">= 항목 전체 =</option>');*/


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

		/*// 상품구분 공통코드를 추출한다.
		const prdtCfcd = CMMN.getCmmnCd('PRDT_CFCD');
		// 검색란의 상품구분 공통코드 dropdown 을 셋팅한다.
		document.querySelector(`#${this.targetElId} [name='searchPrdtCfcd']`).innerHTML
			= prdtCfcd
				.sort((a, b) => a.cdNm.localeCompare(b.cdNm))
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.cd}">${curr.cdNm}</option>` );
				}, '<option value="">= 상품구분 선택 =</option>');*/

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

			// 그리드 초기화
			this.data.gridOptions_01.api.setRowData([]);

			document.querySelectorAll(`#${this.targetElId} [name='${this.data.selectCond}']`).forEach(el => el.style.display = '');
		}
	},
	// grid01 초기화
	gridInit_01: function() {
		// 선택된 row들의 변경 이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions_01.onSelectionChanged = this.gridOnSelectionChanged_01.bind(this);
		// row 클릭이벤트 발생시 리스너함수를 적용.
		// this.data.gridOptions_01.onCellClicked = this.gridOnCellClicked_01.bind(this);
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

		const startDate = document.querySelector(`#${this.targetElId} [name='startDate']`).value;
		const startTime = document.querySelector(`#${this.targetElId} [name='startTime']`).value;
		const endDate = document.querySelector(`#${this.targetElId} [name='endDate']`).value;
		const endTime = document.querySelector(`#${this.targetElId} [name='endTime']`).value;

		/*//시작수정일시(FROM)가 입력되지 않은 경우
		if(!startDate) {
			await CMMN.alert('시작수정일시(FROM)를 입력해주세요.');
			document.querySelector(`#${this.targetElId} [name='startDate']`).focus();
			return;
		}
		//시작수정시간(FROM)이 입력되지 않은 경우
		if(!startTime) {
			await CMMN.alert('시작수정시간(FROM)을 입력해주세요.');
			document.querySelector(`#${this.targetElId} [name='startTime']`).focus();
			return;
		}*/
		//시작수정시간(FROM)이 올바르지 않은 경우
		if(startDate && !this.isValidTimeHHMMSS(startTime)){
			await CMMN.alert('시작수정시간(FROM)이 올바르지 않습니다.');
			document.querySelector(`#${this.targetElId} [name='startTime']`).focus();
			return;
		}

		/*//종료수정일시(TO)가 입력되지 않은 경우
		if(!endDate) {
			await CMMN.alert('종료수정일시(TO)를 입력해주세요.');
			document.querySelector(`#${this.targetElId} [name='endDate']`).focus();
			return;
		}
		//종료수정시간(TO)이 입력되지 않은 경우
		if(!endTime) {
			await CMMN.alert('종료수정시간(TO)을 입력해주세요.');
			document.querySelector(`#${this.targetElId} [name='endTime']`).focus();
			return;
		}*/
		//종료수정시간(TO)이 올바르지 않은 경우
		if(endDate && !this.isValidTimeHHMMSS(endTime)){
			await CMMN.alert('종료수정시간(TO)이 올바르지 않습니다.');
			document.querySelector(`#${this.targetElId} [name='endTime']`).focus();
			return;
		}

		const today = new Date().toISOString().slice(0, 10);
		const defaultStartTime = "00:00:00";
		const defaultEndTime = "23:59:59";

		const formatStartDate = !startDate ? today : this.formatDate(startDate);
		const formatStartTime = !startTime ? defaultStartTime : this.formatTime(startTime);
		const formatEndDate = !endDate ? today : this.formatDate(endDate);
		const formatEndTime = !endTime ? defaultEndTime : this.formatTime(endTime);

		const params = {
			cmpnyCode: document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`).value,
			startMdfDtm: (!formatStartDate || !formatStartTime) ? "" : formatStartDate + " " + formatStartTime,
			endMdfDtm: (!formatEndDate || !formatEndTime) ? "" : formatEndDate + " " + formatEndTime,
			pageConfig: this.data.pageConfig_01,
		}

		const response = await CMMN.api.post('/api/sys/cmFile/getFileListPage', { params });

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

		document.querySelector(`#${this.targetElId} [name='${this.targetElId}_totalCount_1']`).innerText = '총 건수 : ' + CMMN.priceToString(this.data.paginator_01.totalCount);
	},
	formatDate: function(dateStr, pattern) {
		if(!pattern) pattern = "-";

		// 빈 값 인지 먼저 확인
		if (CMMN.isEmpty(dateStr)) return dateStr;

		// 8자리 날짜인지 먼저 확인
		if (!/^\d{8}$/.test(dateStr.split(".").join(""))) return dateStr;

		const replaceDateStr = dateStr.split(".").join("");

		const year = replaceDateStr.slice(0, 4);
		const month = replaceDateStr.slice(4, 6);
		const day = replaceDateStr.slice(6, 8);

		return year + pattern + month + pattern + day;
	},
	formatTime: function(timeStr, pattern) {
		if(!pattern) pattern = ":";

		// 빈 값 인지 먼저 확인
		if (CMMN.isEmpty(timeStr)) return timeStr;

		// 6자리 숫자인지 먼저 확인
		if (!/^\d{6}$/.test(timeStr)) return false;

		const hh = Number(timeStr.slice(0, 2));
		const mm = Number(timeStr.slice(2, 4));
		const ss = Number(timeStr.slice(4, 6));

		return hh + pattern + mm + pattern + ss;
	},
	isValidTimeHHMMSS: function(timeStr) {
		// 6자리 숫자인지 먼저 확인
		if (!/^\d{6}$/.test(timeStr)) return false;

		const hh = Number(timeStr.slice(0, 2));
		const mm = Number(timeStr.slice(2, 4));
		const ss = Number(timeStr.slice(4, 6));

		if (hh < 0 || hh > 23) return false;
		if (mm < 0 || mm > 59) return false;
		if (ss < 0 || ss > 59) return false;

		return true;
	},
	// 페이지 이동
	pageTo_01: function(page) {
		this.data.pageConfig_01.page = page;
		this.search_01();
	},
	// 엑셀다운로드
	excelDownLoad_01: async function() {
		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

		const startDate = document.querySelector(`#${this.targetElId} [name='startDate']`).value;
		const startTime = document.querySelector(`#${this.targetElId} [name='startTime']`).value;
		const endDate = document.querySelector(`#${this.targetElId} [name='endDate']`).value;
		const endTime = document.querySelector(`#${this.targetElId} [name='endTime']`).value;

		/*//시작수정일시(FROM)가 입력되지 않은 경우
		if(!startDate) {
			await CMMN.alert('시작수정일시(FROM)를 입력해주세요.');
			document.querySelector(`#${this.targetElId} [name='startDate']`).focus();
			return;
		}
		//시작수정시간(FROM)이 입력되지 않은 경우
		if(!startTime) {
			await CMMN.alert('시작수정시간(FROM)을 입력해주세요.');
			document.querySelector(`#${this.targetElId} [name='startTime']`).focus();
			return;
		}*/
		//시작수정시간(FROM)이 올바르지 않은 경우
		if(startDate && !this.isValidTimeHHMMSS(startTime)){
			await CMMN.alert('시작수정시간(FROM)이 올바르지 않습니다.');
			document.querySelector(`#${this.targetElId} [name='startTime']`).focus();
			return;
		}

		/*//종료수정일시(TO)가 입력되지 않은 경우
		if(!endDate) {
			await CMMN.alert('종료수정일시(TO)를 입력해주세요.');
			document.querySelector(`#${this.targetElId} [name='endDate']`).focus();
			return;
		}
		//종료수정시간(TO)이 입력되지 않은 경우
		if(!endTime) {
			await CMMN.alert('종료수정시간(TO)을 입력해주세요.');
			document.querySelector(`#${this.targetElId} [name='endTime']`).focus();
			return;
		}*/
		//종료수정시간(TO)이 올바르지 않은 경우
		if(endDate && !this.isValidTimeHHMMSS(endTime)){
			await CMMN.alert('종료수정시간(TO)이 올바르지 않습니다.');
			document.querySelector(`#${this.targetElId} [name='endTime']`).focus();
			return;
		}

		const today = new Date().toISOString().slice(0, 10);
		const defaultStartTime = "00:00:00";
		const defaultEndTime = "23:59:59";

		const formatStartDate = !startDate ? today : this.formatDate(startDate);
		const formatStartTime = !startTime ? defaultStartTime : this.formatTime(startTime);
		const formatEndDate = !endDate ? today : this.formatDate(endDate);
		const formatEndTime = !endTime ? defaultEndTime : this.formatTime(endTime);

		const params = {
			cmpnyCode: document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`).value,
			startMdfDtm: (!formatStartDate || !formatStartTime) ? "" : formatStartDate + " " + formatStartTime,
			endMdfDtm: (!formatEndDate || !formatEndTime) ? "" : formatEndDate + " " + formatEndTime,
			pageConfig: this.data.pageConfig_01,
		}

		const options = { params, responseType: 'blob' }

		const response = await CMMN.api.post('/api/sys/cmFile/excelDownLoad_01', options);

		CMMN.downloadFileProc(response);
	},
	// 엑셀업로드
	excelUpLoad_01: async function() {
		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "E")) return;

		const el_excelFile = document.querySelector(`#${this.targetElId} [name='excelUpLoad_01']`);
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
		await CMMN.api.post('/api/sys/cmFile/excelUpLoad_01', { params });
		el_excelFile.value = '';  // 엑셀파일 첨부input 을 초기화 한다.

		this.pageToFirst_01();
	},
	// 약관구성등록 파일다운로드
	fileDownLoad_01: async function() {
		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

		const startDate = document.querySelector(`#${this.targetElId} [name='startDate']`).value;
		const startTime = document.querySelector(`#${this.targetElId} [name='startTime']`).value;
		const endDate = document.querySelector(`#${this.targetElId} [name='endDate']`).value;
		const endTime = document.querySelector(`#${this.targetElId} [name='endTime']`).value;

		/*//시작수정일시(FROM)가 입력되지 않은 경우
		if(!startDate) {
			await CMMN.alert('시작수정일시(FROM)를 입력해주세요.');
			document.querySelector(`#${this.targetElId} [name='startDate']`).focus();
			return;
		}
		//시작수정시간(FROM)이 입력되지 않은 경우
		if(!startTime) {
			await CMMN.alert('시작수정시간(FROM)을 입력해주세요.');
			document.querySelector(`#${this.targetElId} [name='startTime']`).focus();
			return;
		}*/
		//시작수정시간(FROM)이 올바르지 않은 경우
		if(startDate && !this.isValidTimeHHMMSS(startTime)){
			await CMMN.alert('시작수정시간(FROM)이 올바르지 않습니다.');
			document.querySelector(`#${this.targetElId} [name='startTime']`).focus();
			return;
		}

		/*//종료수정일시(TO)가 입력되지 않은 경우
		if(!endDate) {
			await CMMN.alert('종료수정일시(TO)를 입력해주세요.');
			document.querySelector(`#${this.targetElId} [name='endDate']`).focus();
			return;
		}
		//종료수정시간(TO)이 입력되지 않은 경우
		if(!endTime) {
			await CMMN.alert('종료수정시간(TO)을 입력해주세요.');
			document.querySelector(`#${this.targetElId} [name='endTime']`).focus();
			return;
		}*/
		//종료수정시간(TO)이 올바르지 않은 경우
		if(endDate && !this.isValidTimeHHMMSS(endTime)){
			await CMMN.alert('종료수정시간(TO)이 올바르지 않습니다.');
			document.querySelector(`#${this.targetElId} [name='endTime']`).focus();
			return;
		}

		const today = new Date().toISOString().slice(0, 10);
		const defaultStartTime = "00:00:00";
		const defaultEndTime = "23:59:59";

		const formatStartDate = !startDate ? today : this.formatDate(startDate);
		const formatStartTime = !startTime ? defaultStartTime : this.formatTime(startTime);
		const formatEndDate = !endDate ? today : this.formatDate(endDate);
		const formatEndTime = !endTime ? defaultEndTime : this.formatTime(endTime);

		const params = {
			cmpnyCode: document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`).value,
			startMdfDtm: (!formatStartDate || !formatStartTime) ? "" : formatStartDate + " " + formatStartTime,
			endMdfDtm: (!formatEndDate || !formatEndTime) ? "" : formatEndDate + " " + formatEndTime,
			pageConfig: this.data.pageConfig_01,
		}

		const options = { params, responseType: 'blob' }

		const response = await CMMN.api.post('/api/sys/cmFile/fileDownLoad_01', options);

		CMMN.downloadFileProc(response);
	},
	// 약관구성등록 파일업로드
	fileUpLoad_01: async function() {
		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "E")) return;

		const el_zipFile = document.querySelector(`#${this.targetElId} [name='fileUpLoad_01']`);
		const zipFile = el_zipFile.files[0];
		if (!zipFile) return;

		const fileNm = zipFile.name;
		const ext = fileNm.toLowerCase().substring(fileNm.lastIndexOf('.') + 1, fileNm.length)
		if(ext !== 'zip') {
			await CMMN.alert('압축 파일만 업로드가 가능합니다.');
			return;
		}
		if(!await CMMN.confirm('선택한 압축 파일을 업로드 하시겠습니까?')) {
			return;
		}

		const params = { zipFile };
		CMMN.api.post('/api/sys/cmFile/fileUpLoad_01', { params }).then(data => {
			el_zipFile.value = '';  // 압축파일 첨부input 을 초기화 한다.
			this.pageToFirst_01();
		}).catch(err => {
			console.error('>>> error: ', err);
			el_zipFile.value = '';  // 압축파일 첨부input 을 초기화 한다.
		});
	},
};