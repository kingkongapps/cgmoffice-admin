window.addEventListener('SYS000001_M01', () => {
	SYS000001_M01.init();
})

const SYS000001_M01 = {
	targetElId: 'SYS000001_M01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		if(this.configUI()){

			// grid01 초기화
			this.gridInit_01();

			// grid02 초기화
			this.gridInit_02();

			this.search();

		}
	},
	data: {
		// grid01 설정 옵션(상품목록)
		gridOptions_01: {
			columnDefs: [  // grid 컬럼 정의
				{
					headerName: '보험사',
					field: 'cmpnyNm',
					width: 150,
				},
				{
					headerName: '상품코드',
					field: 'prdtCd',
					width: 150,
				},
				{
					headerName: '상품명',
					field: 'nprdtNm',
					width: 350,
				},
				{
					headerName: '보종코드',
					field: 'inskndCd',
					width: 100,
				},
			],
			defaultColDef: {  // 기본 컬럼정의
				minWidth: 100,  // 각 컬럼당 최소넓이
				resizable: true,  // 컬럼사이즈 조정가능 여부
			},
		},
		// grid01 에서 클릭한 row의 데이터
		gridClickedData_01: {},
		// grid02 설정 옵션(상품목록)
		gridOptions_02: {
			columnDefs: [  // grid 컬럼 정의
				{
					headerName: '보험사',
					field: 'cmpnyNm',
					width: 150,
				},
				{
					headerName: '상품코드',
					field: 'prdtCd',
					width: 150,
				},
				{
					headerName: '상품명',
					field: 'nprdtNm',
					width: 350,
				},
				{
					headerName: '보종코드',
					field: 'inskndCd',
					width: 150,
				},
			],
			defaultColDef: {  // 기본 컬럼정의
				minWidth: 100,  // 각 컬럼당 최소넓이
				resizable: true,  // 컬럼사이즈 조정가능 여부
			},
		},
		// grid02 에서 클릭한 row의 데이터
		gridClickedData_02: {},
	},
	// 화면 UI 설정
	configUI: async function() {

		//아이디 생성 후 초기 비밀번호를 변경하였는지 확인.
		const userDto = await CMMN.api.post(`/api/common/authenticate/checkFindAcYn`);

		console.log('>>> login userDto : ', userDto);
		//console.log('>>> login userDto : ', CMMN.user);
		if(userDto.data.findAcYn && 'N' != userDto.data.findAcYn){
			await CMMN.alert('비밀번호 재설정이 필요합니다. 지금 바로 새로운 비밀번호를 등록해 주세요.');
			CMMN.goTo('SYS003001_M01');
			return false;
		}
		return true;
	},
	// grid01 초기화
	gridInit_01: function() {
		// row 클릭이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions_01.onCellClicked = this.gridOnCellClicked_01.bind(this);
		// grid 초기화
		new agGrid.Grid(
			document.querySelector(`#${this.targetElId} [name='table-content-01']`),
			this.data.gridOptions_01
		);
		this.data.gridOptions_01.api.setRowData([]);
	},
	// grid01 셀 클릭 이벤트 발생
	gridOnCellClicked_01: function(event) {
		// 클릭된 타겟 cell 의 field값을 추출( 체크박스클릭의 경우는 적용을 제외하기 위해 )
		if(!event.colDef.field)  return;

		// 객체를 깊은복사를 진행한다.
		this.data.gridClickedData_01 = JSON.parse(JSON.stringify(event.data));
		// console.log('>>> selectedData: ', this.data.selectedData);
		this.CMN_P05_open(
			this.data.gridClickedData_01
		);
	},
	// grid02 초기화
	gridInit_02: function() {
		// row 클릭이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions_02.onCellClicked = this.gridOnCellClicked_02.bind(this);
		// grid 초기화
		new agGrid.Grid(
			document.querySelector(`#${this.targetElId} [name='table-content-02']`),
			this.data.gridOptions_02
		);
		this.data.gridOptions_02.api.setRowData([]);
	},
	// grid02 셀 클릭 이벤트 발생
	gridOnCellClicked_02: function(event) {
		// 클릭된 타겟 cell 의 field값을 추출( 체크박스클릭의 경우는 적용을 제외하기 위해 )
		if(!event.colDef.field)  return;

		// 객체를 깊은복사를 진행한다.
		this.data.gridClickedData_02 = JSON.parse(JSON.stringify(event.data));
		// console.log('>>> selectedData: ', this.data.selectedData);
		/*this.CMN_P05_open(
			this.data.gridClickedData_02
		);*/
		CMMN.goTo('CNT002001_M01', this.data.gridClickedData_02);
	},
	search: async function() {

		const { data } = await CMMN.api.get(`/api/sys/dashboardMng/getInfo`);
		// console.log('>>> search data: ', data);

		// 개별약관생성 총 건수
		const countUp_dashCnt01 = new countUp.CountUp('dashCnt01', data.clusRcvTotalCnt);
		countUp_dashCnt01.start();

		// 상품등록 누적건수
		const countUp_dashCnt02 = new countUp.CountUp('dashCnt02', data.prdtTotalCnt);
		countUp_dashCnt02.start();

		// 상품등록 당월건수
		const countUp_dashCnt03 = new countUp.CountUp('dashCnt03', data.prdtCurrMonthCnt);
		countUp_dashCnt03.start();

		this.setChart01(data.quarterDataList);


		this.data.gridOptions_01.api.setRowData(data.grid01);
		this.data.gridOptions_02.api.setRowData(data.grid02);

	},
	// 팝업열기
	CMN_P05_open: function(params) {
		CMN000000_P05.open(
			params,
			[ this.search.bind(this) ]
		);
	},
	setChart01: function(quarterDataList) {
		const option = {
			color: [CMMN.getChartColor(),"#dee2e6"], // 앞 코드명이 25년 , 뒤 코드명이 24년
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'cross',
					crossStyle: {
						color: '#999'
					}
				}
			},
			legend: {
				//show: true,  // 하단 범례 보이기
				data: ['Evaporation', 'Precipitation'],
				bottom: 20,
			},

			//이 부분을 PRDT_CFCD:상품구분코드 조회해서 가져오는 것으로 수정필요
			xAxis: [
				{
					type: 'category',
					data: quarterDataList.filter(item => item.gubun == "first").map(item => item.cdNm),
					axisPointer: {
						type: 'shadow'
					}
				}
			],

			yAxis: [
				{
					type: 'value',
					name: '생성건수',
					minInterval: 1,
					axisLabel: {
						formatter: '{value}'
					}
				}
			],

			/*
				quarterDataList 데이터 수정 필요.
				DashboardMng_SQL.xml > getClusRcvHistMonth_TB_INDV_CLUS_RCV_MST 쿼리 수정 필요.
				6월 이내(상반기, 전년 상반기) 또는 7월 이상(하반기, 전년 후반기)로 구분하고 PRDT_CFCD 코드 별 접수상품의 수를 표시한다.

				[수정쿼리]
				SELECT
					PRDT_CFCD
				  , COUNT(PRDT_CFCD)
				FROM
					(
					SELECT
						A.PRDT_CFCD
					FROM
						TB_PRDT_INFO_MST A INNER JOIN TB_INDV_CLUS_RCV_MST B ON SUBSTR(B.MXTR_CLUS_CD, 1, INSTR(B.MXTR_CLUS_CD, '-') - 1) = A.PRDT_CD
					WHERE 1=1
						AND B.CRT_DTM >= TO_DATE('202505', 'YYYYMM') AND B.CRT_DTM <= TO_DATE('202506', 'YYYYMM')
					)
				GROUP BY PRDT_CFCD


				조건절 ex)
					상반기 		CRT_DTM >= TO_DATE('202501', 'YYYYMM') AND CRT_DTM <= TO_DATE('202506', 'YYYYMM') 조건으로 위 쿼리 조회
					하반기 		CRT_DTM >= TO_DATE('202507', 'YYYYMM') AND CRT_DTM <= TO_DATE('202512', 'YYYYMM') 조건으로 위 쿼리 조회
					전년 상반기	CRT_DTM >= TO_DATE('202407', 'YYYYMM') AND CRT_DTM <= TO_DATE('202412', 'YYYYMM') 조건으로 위 쿼리 조회
					전년 하반기	CRT_DTM >= TO_DATE('202407', 'YYYYMM') AND CRT_DTM <= TO_DATE('202412', 'YYYYMM') 조건으로 위 쿼리 조회
			*/
			series: [
				{
					name: quarterDataList.filter(item => item.gubun == "first")[0].quarter,
					type: 'bar',
					tooltip: {
						valueFormatter: function(value) {
							return value + '';
						}
					},
					data: quarterDataList.filter(item => item.gubun == "first").map(item => item.cnt),
				},

				//bar 두개로 표현
				{
					name: quarterDataList.filter(item => item.gubun == "second")[0].quarter,
					type: 'bar',
					tooltip: {
						valueFormatter: function(value) {
							return value + '';
						}
					},
					data: quarterDataList.filter(item => item.gubun == "second").map(item => item.cnt),
				},

				//line이 필요한 경우
				/*{
					type: 'line',
					tooltip: {
						show: false,
					},
					data: quarterDataList.map(item => item.cnt),
				},*/

			]
		};

		const myChart = echarts.init(
			document.querySelector(`#${this.targetElId} [name='chart01']`),
			null,
			{
				renderer: 'canvas',
				useDirtyRect: false
			}
		);
		myChart.setOption(option);

		window.addEventListener('resize', myChart.resize);
	},
};