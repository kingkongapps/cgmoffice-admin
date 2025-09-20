
window.addEventListener('CNT002001_M01', () => {
	CNT002001_M01.init();
})

const CNT002001_M01 = {
	targetElId: 'CNT002001_M01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();
		// grid01 초기화
		this.gridInit_01();
		// grid02 초기화
		this.gridInit_02();
	},
	data: {
		// grid01 설정 옵션(상품목록)
		gridOptions_01: {
			columnDefs: [  // grid 컬럼 정의
				{
					headerCheckboxSelection: true,
					headerCheckboxSelectionFilteredOnly: true,
					checkboxSelection: true,
					maxWidth: 100,
					minWidth: 100,
					lockPosition: 'left', // 위치를 왼쪽으로 고정
					suppressMovable: true,  // 이동이 불가능하도록 설정
				},
				{
					headerName: '항목',
					minWidth: 100,
					field: 'clusItmClcdNm',
				},
				{
					headerName: '약관항목코드',
					field: 'prdtCd',
					minWidth: 100,
				},
				{
					headerName: '약관항목명',
					field: 'nprdtNm',
					minWidth: 450,
				},
				{
					headerName: '보험사',
					minWidth: 110,
					field: 'cmpnyNm',
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
		// grid01 에서 선택된 데이터목록
		gridSelectedDataList_01: [],

		// grid02 설정 옵션 (상품약관)
		gridOptions_02: {
			columnDefs: [  // grid 컬럼 정의
				{
					headerCheckboxSelection: false,
					checkboxSelection: (params) => {
						// 예: 주특구분이 'C'인(주계약) 경우 체크박스 비활성화
						return params.data.clusItmClcd !== 'C';
					},
					sortable: false,
					maxWidth: 50,
					minWidth: 50,
					lockPosition: 'left', // 위치를 왼쪽으로 고정
				},
				{
					sortable: false,
					maxWidth: 50,
					minWidth: 50,
					lockPosition: 'left', // 위치를 왼쪽으로 고정
					rowDrag: true,
				},
				{
					headerName: '항목',
					valueGetter: 'CMMN.getCmmnCdNm("CLUS_ITM_CLCD", data.clusItmClcd)',
					minWidth: 80,
					field: 'clusItmClcd',
				},
				{
					headerName: '약관항목코드',
					minWidth: 100,
					field: 'clusItmCd',
				},
				{
					headerName: '약관항목명',
					field: 'clusItmNm',
					minWidth: 350,
				},
				{
					headerName: '약관번호순',
					field: 'sn',
					maxWidth: 85,
					minWidth: 85,
				},
				{
					headerName: '항목순',
					field: 'screnDispOrd',
					maxWidth: 85,
					minWidth: 85,
				},
			],
			defaultColDef: {  // 기본 컬럼정의
				flex: 1,  // 컬럼이동이 가능하게 한다.
				minWidth: 50,  // 각 컬럼당 최소넓이
				resizable: true,  // 컬럼사이즈 조정가능 여부
			},
			rowDragManaged: true,  // row를 drag 가능하게 한다.
			suppressRowClickSelection: true,  // row 클릭으로 row가 선택처리되는 것을 막는다. 체크박스를 통해서만 선택이 가능해야 되기 때문...
			rowSelection: 'multiple', // 다중선택이 가능하게 한다.

		},
		// grid02 에서 선택된 데이터목록
		gridSelectedDataList_02: [],

		gridDataList_01: [],
		gridDataList_02: [],
	},
	// 화면 UI 설정
	configUI: async function() {
		// 보험사 공통코드를 추출한다.
		const cmpnyCode = CMMN.getCmmnCd('CMPNY_CODE');
		// 검색란의 보험사 공통코드 dropdown 을 셋팅한다.
		document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`).innerHTML
			= cmpnyCode
				.sort((a, b) => a.cdNm.localeCompare(b.cdNm))
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.cd}">${curr.cdNm}</option>` );
				}, '<option value="">= 보험사 전체 =</option>');
		$(`#${this.targetElId} [name='searchCmpnyCode']`).select2( {
		    theme: "bootstrap-5",
		    width: $( this ).data( 'width' ) ? $( this ).data( 'width' ) : $( this ).hasClass( 'w-100' ) ? '100%' : 'style',
		    placeholder: $( this ).data( 'placeholder' ),
			dropdownParent: $(`#${this.targetElId}`),
		} );

		// 약관항목분류코드 공통코드를 추출 및 dropdown 적용.
		const clusItmClcd = CMMN.getCmmnCd('CLUS_ITM_CLCD');
		// 검색란의 약관항목분류코드 공통코드 dropdown 을 셋팅한다.
		document.querySelector(`#${this.targetElId} [name='searchClusItmClcd']`).innerHTML
			= clusItmClcd
				.filter(d => d.cd != 'C')  // 주계약 제외
				.sort((a, b) => a.sortNo - b.sortNo)
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.cd}">${curr.cdNm}</option>` );
				}, '<option value="">= 약관항목 전체 =</option>');

		// tag UI 별 권한제어  (I:insert, S:select, U:update, D:delete, E:excel)
		CMMN.setAuthBtn(this.targetElId)

		// 슈퍼관리자그룹이 아닐경우...
		if(CMMN.user.authGrpCd !== '100') {
			const comCode = CMMN.user.comCode;
			const comName = CMMN.user.comName;
			$(`#${this.targetElId} [name='searchCmpnyCode']`).val(comCode).trigger('change');
			document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`).disabled = true;
		}

		if(!CMMN.isEmpty(CMMN.sessionStorage.getItem('reqquery'))){
			let reqquery = CMMN.sessionStorage.getItem('reqquery');

			let splitReqquery = reqquery.split('&');

			let cmpnyCode = "", clusItmClcd = "", nprdtNm = "", prdtCd = "", fileNo = "";

			splitReqquery.some(item => {
				let splitKeyValue = item.split("=");

				if(splitKeyValue.length > 1){
					let key = splitKeyValue[0], value = splitKeyValue[1];

					if(key == "cmpnyCode"){
						cmpnyCode = value;
					}
					if(key == "clusItmClcd"){
						clusItmClcd = value;
					}
					if(key == "nprdtNm"){
						nprdtNm = value;
					}
					if(key == "prdtCd"){
						prdtCd = value;
					}
					if(key == "fileNo"){
						fileNo = value;
					}
				}
			});

			//주계약 상품인 경우 [주계약 상품이 확실 하여 상품약관검색과 같이 진행]
			if(clusItmClcd == "C"){
				$(`#${this.targetElId} [name='searchCmpnyCode']`).val(cmpnyCode).trigger('change');
				await this.search_01();
				await this.search_02({prdtCd : prdtCd, nprdtNm : nprdtNm, fileNo : fileNo});
				document.querySelector(`#${this.targetElId} [name='search_01_prdtCd']`).value = `${prdtCd} : ${nprdtNm}`;
			//그 외 상품인 경우 [주계약 상품이 여러개인 경우가 있어서 상품약관검색만 진행]
			} else {
				$(`#${this.targetElId} [name='searchClusItmClcd']`).val(clusItmClcd);
				$(`#${this.targetElId} [name='searchPrdtNm']`).val(nprdtNm);
				$(`#${this.targetElId} [name='searchCmpnyCode']`).val(cmpnyCode).trigger('change');
				await this.search_01();
			}
		}

		document.querySelector(`#${this.targetElId} [name='rquSelYn']`).value = "N";
	},
	// grid01 초기화
	gridInit_01: function() {
		// 선택된 row들의 변경 이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions_01.onSelectionChanged = this.gridOnSelectionChanged_01.bind(this);
		// grid 초기화
		new agGrid.Grid(
			document.querySelector(`#${this.targetElId} [name='table-content-01']`),
			this.data.gridOptions_01
		);
		this.data.gridDataList_01 = [];
		this.data.gridOptions_01.api.setRowData([]);
	},
	// grid01 선택이벤트 발생
	gridOnSelectionChanged_01: function(event) {
		this.data.gridSelectedDataList_01 = [];
		event.api.getSelectedNodes().forEach(item => this.data.gridSelectedDataList_01.push(item.data));
	},
	// grid02 초기화
	gridInit_02: function() {
		// 선택된 row들의 변경 이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions_02.onSelectionChanged = this.gridOnSelectionChanged_02.bind(this);
		// 선택된 row들의 drag 이벤트 발생시 리스너 함수를 적용.
		this.data.gridOptions_02.onRowDragEnd = this.gridOnRowDragEnd_02.bind(this);
		// grid 초기화
		new agGrid.Grid(
			document.querySelector(`#${this.targetElId} [name='table-content-02']`),
			this.data.gridOptions_02
		);
		this.data.gridDataList_02 = [];
		this.data.gridOptions_02.api.setRowData([]);
	},
	// grid02 선택이벤트 발생
	gridOnSelectionChanged_02: function(event) {
		this.data.gridSelectedDataList_02 = [];
		event.api.getSelectedNodes().forEach(item => this.data.gridSelectedDataList_02.push(item.data));
	},
	// grid02 row drag 발생
	gridOnRowDragEnd_02: function(event) {
		// console.log('드래그 종료:', event.node.data);

		const newRowList = [];
		const rowCount = this.data.gridOptions_02.api.getDisplayedRowCount();
		for (let i = 0; i < rowCount; i++) {
			const rowNode = this.data.gridOptions_02.api.getDisplayedRowAtIndex(i);
			newRowList.push(rowNode.data);
		}

		// grid_02 데이터 sorting 셋팅
		let cnt_screnDispOrd = 0;
		let cnt_sn = 0;
		newRowList.forEach(d => {
			cnt_screnDispOrd++;
			d.screnDispOrd = cnt_screnDispOrd; // 목차순서 셋팅
			if(d.clusItmClcd === 'C') {  // 주계약일 경우
				d.sn = 0;  // 약관생성순서 셋팅
			} else if(d.clusItmClcd === 'T') {  // 특약일 경우
				cnt_sn++;
				d.sn = cnt_sn;  // 약관생성순서 셋팅
			} else {
				d.sn = '';
			}
		});

		this.data.gridDataList_02 = newRowList;
		this.setGridData();
	},
	CMN_P04_open: function() {
		const prdtCd_old = document.querySelector(`#${this.targetElId} [name='search_01_prdtCd']`).value;

		CMN000000_P04.open(
			{ prdtCd_old },
			[this.search_02.bind(this)]
		);
	},
	search_01: async function(){

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

		const clusItmClcd = document.querySelector(`#${this.targetElId} [name='searchClusItmClcd']`).value;

		if(clusItmClcd == "T"){
			document.querySelector(`#${this.targetElId} [name='rquSelYn']`).closest('div').style.display = '';
			document.querySelector(`#${this.targetElId} [name='rquSelYn']`).focus();
		} else {
			document.querySelector(`#${this.targetElId} [name='rquSelYn']`).closest('div').style.display = 'none';
		}

		const params = {
			cmpnyCode: document.querySelector(`#${this.targetElId} [name='searchCmpnyCode']`).value,
			clusItmClcd: clusItmClcd,
			prdtNm: document.querySelector(`#${this.targetElId} [name='searchPrdtNm']`).value,
			rquSelYn: clusItmClcd == "T" ? document.querySelector(`#${this.targetElId} [name='rquSelYn']`).value : "",
		}

		const response = await CMMN.api.post(`/api/cnt/prdtMng/getList`, { params });

		this.data.gridSelectedDataList_01 = [];

		let data = response.data;

		data = data.filter(d => d.clusItmClcd != 'C');
		data.forEach(d => {
			d.clusItmClcdNm = CMMN.getCmmnCdNm("CLUS_ITM_CLCD", d.clusItmClcd);
		})
		data.sort((a, b) => a.clusItmClcdNm.localeCompare(b.clusItmClcdNm))  // 항목분류명으로 정렬
		//data.sort((a, b) => a.cmpnyNm.localeCompare(b.cmpnyNm))  // 회사명으로 정렬
		//data.sort((a, b) => a.nprdtNm.localeCompare(b.nprdtNm))  // 정식상품명으로 정렬

		this.data.gridDataList_01 = data;

		// grid 데이터 셋팅
		this.setGridData();
	},
	search_02: async function(params) {

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

		const response = await CMMN.api.get(`/api/cnt/prdtClusMng/getInfo?prdtCd=${params.prdtCd}`);

		console.log('>>> response: ', response);

		this.data.gridSelectedDataList_02 = [];

		this.data.gridDataList_02 = response.data;
		// 만약 조회결과가 비어있으면
		if(this.data.gridDataList_02.length == 0) {
			const newItem = {
				clusItmCd: params.prdtCd,  // 약관항목코드
				clusItmNm: params.nprdtNm,  // 약관항목명
				clusItmClcd: "C",  // 약관항목분류코드 '주계약'
				prdtCd: params.prdtCd,  // 주계약상품코드
				screnDispOrd: 1,  // 목차순서
				fileNo: params.fileNo,  // 파일ID
				sn: 0,  // 약관생성순서
			}
			this.data.gridDataList_02.push(newItem);
		}

		// grid 데이터 셋팅
		this.setGridData();

		// gridDataList_02 에서 주계약을 추출해서 검색란의 input 에 표시를 한다.
		const prdt = this.data.gridDataList_02.find(d => d.clusItmClcd == "C");
		document.querySelector(`#${this.targetElId} [name='search_01_prdtCd']`).value = `${prdt.prdtCd} : ${prdt.clusItmNm}`;
	},
	// grid01, grid02 데이터를 셋팅한다.
	setGridData: function(){

		// grid_01 데이터 셋팅
		this.data.gridDataList_01
			= this.data.gridDataList_01
				.filter(d => !this.data.gridDataList_02.find(x => x.clusItmCd === d.prdtCd));
		this.data.gridOptions_01.api.setRowData(this.data.gridDataList_01);

		// grid_02 데이터 셋팅
		// 목차순서순으로 정렬
		this.data.gridDataList_02.sort((a, b) => Number(a.screnDispOrd) - Number(b.screnDispOrd));
		this.data.gridOptions_02.api.setRowData(this.data.gridDataList_02);

		this.data.gridSelectedDataList_01 = [];
		this.data.gridSelectedDataList_02 = [];
	},
	// 오른쪽으로 이동버튼 클릭
	moveToRight: async function() {
		if(
			this.data.gridSelectedDataList_01.filter(d => d.mnspccCfcd == '1').length >= 2  // '상품검색' 선택목록에 주계약이 2개이상이면
		) {
			await CMMN.alert('주계약은 1개만 선택이 가능합니다.');
			return;
		}

		// '상품검색' 선택중 주계약 추출
		const left_prdt = this.data.gridSelectedDataList_01.find(d => d.clusItmClcd == "C");
		// '상품약관' 란의 주계약 추출
		let right_prdt = this.data.gridDataList_02.find(d => d.clusItmClcd == "C");

		if(
			this.data.gridDataList_02.length == 0  // '상품약관' 란이 비어있으면
			&& !left_prdt  // '상품검색' 선택목록에 주계약이 없으면
		) {
			await CMMN.alert('우측 상품약관란에<br/>주계약이 존재하지 않습니다.');
			return;
		}

		if(
			right_prdt // '상품약관' 란의 주계약이 존재하면
			&& left_prdt // '상품검색' 선택목록에 주계약이 존재하면
		) {
			await CMMN.alert('상품약관란에 주계약이 존재합니다.');
			return;
		}

		if(left_prdt) {
			// 주계약으로 먼저 상품약관란을 셋팅한다.
			await this.search_02(left_prdt);
		}
		// '상품약관' 란의 주계약을 다시 추출
		right_prdt = this.data.gridDataList_02.find(d => d.clusItmClcd == "C");


		let max_screnDispOrd = Math.max(...this.data.gridDataList_02.map(d => Number(d.screnDispOrd)));
		let max_sn = Math.max(...this.data.gridDataList_02.map(d => Number(d.sn)));

		const newDataList = this.data.gridSelectedDataList_01
			// 먼저 상품란에 존재하지 않는 상품만으로 추출한다.
			.filter(d => this.data.gridDataList_02.filter(x => x.clusItmCd === d.prdtCd).length == 0)
			.map(d => {
				// 목차순서 증가
				max_screnDispOrd++;

				let sn = '';
				// 약관생성순서는 주계약이나 특약일 경우만 증가
				if(d.clusItmClcd == 'C'){ // 주계약일 경우
					sn = 0;
				} else if(d.clusItmClcd == 'T'){ // 특약일 경우
					max_sn++;
					sn = max_sn;
				}

				return {
					clusItmCd: d.prdtCd,  // 약관항목코드
					clusItmNm: d.nprdtNm,  // 약관항목명
					clusItmClcd: d.clusItmClcd,  // 약관항목분류코드
					prdtCd: right_prdt.prdtCd,  // 주계약상품코드
					screnDispOrd: max_screnDispOrd,  // 목차순서
					fileNo: d.fileNo,  // 파일ID
					cmpnyCode: d.cmpnyCode,  // 회사코드
					sn,  // 약관생성순서
				}
			})

		// '상품약관' 란에 선택된 삼품을 붙인다.
		newDataList.forEach(d => this.data.gridDataList_02.push(d));

		// grid 에 데이터를 표시한다.
		this.data.gridOptions_02.api.setRowData(this.data.gridDataList_02);

		this.setGridData();
	},
	// 왼쪽으로 이동버튼 클릭
	moveToLeft: function() {
		// 만약 grid02에 전체선택버튼으로 되어있으면 주계약도 포함되어있으므로 주계약을 제회시킨다.
		const filtered_gridSelectedDataList_02 = this.data.gridSelectedDataList_02.filter(d => d.clusItmClcd != 'C')

		const newGrid01Data = filtered_gridSelectedDataList_02.map(d => {
			return {
				prdtCd: d.clusItmCd,
				nprdtNm: d.clusItmNm,
				fileNo: d.fileNo,
				mnspccCfcd: d.clusItmClcd == 'C' ? '1' : d.clusItmClcd == 'T' ? '2' : '3',
				clusItmClcd: d.clusItmClcd,
				clusItmClcdNm: CMMN.getCmmnCdNm("CLUS_ITM_CLCD", d.clusItmClcd),
				cmpnyNm: CMMN.getCmmnCdNm("CMPNY_CODE", d.cmpnyCode),
			}
		});

		// '상품약관' 란에 선택된 삼품을 붙인다.
		this.data.gridDataList_01 = this.data.gridDataList_01.concat(newGrid01Data);

		// grid02에서 선택된 row들을 제거한다.
		this.data.gridDataList_02 = this.data.gridDataList_02
				.filter(d => !filtered_gridSelectedDataList_02.find(x => x.clusItmCd == d.clusItmCd));

		// grid_02 데이터 순서 셋팅
		let cnt_screnDispOrd = 0;
		let cnt_sn = 0;
		this.data.gridDataList_02.forEach(d => {
			cnt_screnDispOrd++;
			d.screnDispOrd = cnt_screnDispOrd; // 목차순서 셋팅
			if(d.clusItmClcd === 'C') {  // 주계약일 경우
				d.sn = 0;  // 약관생성순서 셋팅
			} else if(d.clusItmClcd === 'T') { // 특약일 경우
				cnt_sn++;
				d.sn = cnt_sn;  // 약관생성순서 셋팅
			} else {
				d.sn = '';
			}
		});


		this.setGridData();
	},
	save: async function() {

		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "U")) return;

		if(this.data.gridDataList_02.length == 0){
			await CMMN.alert('저장할 내용이 없습니다.');
			return;
		}

		if(!await CMMN.confirm('저장하시겠습니까?')) return;

		const params = this.data.gridDataList_02;
		const response = await CMMN.api.post(`/api/cnt/prdtClusMng/save`, { params });
		// console.log('>>> response: ', response);

	},
}