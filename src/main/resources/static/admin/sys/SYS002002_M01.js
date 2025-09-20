
window.addEventListener('SYS002002_M01', () => {
	//console.log(CMMN);
	SYS002002_M01.init();
})

const SYS002002_M01 = {
	targetElId: 'SYS002002_M01',
	init: function() {
		//console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();
		// grid01 초기화
		//this.gridInit_01();
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
					maxWidth: 50,
					minWidth: 50,
					lockPosition: 'left', // 위치를 왼쪽으로 고정
					suppressMovable: true,  // 이동이 불가능하도록 설정
				},
				{
					headerName: '분류',
					width: 80,
					field: 'upprMenuNm',
				},
				{
					headerName: '메뉴',
					minWidth: 110,
					field: 'menuNm',
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
					headerCheckboxSelection: true,
					headerCheckboxSelectionFilteredOnly: true,
					checkboxSelection: true,
					maxWidth: 50,
					minWidth: 50,
					lockPosition: 'left', // 위치를 왼쪽으로 고정
					suppressMovable: true,  // 이동이 불가능하도록 설정
				},
				{
					headerName: '권한명',
					field: 'authNm',
					maxWidth: 140,
					minWidth: 140,
				},
				{
					headerName: '분류',
					field: 'upprMenuNm',
					maxWidth: 140,
					minWidth: 140,
				},
				{
					headerName: '메뉴',
					field: 'menuNm',
					maxWidth: 200,
					minWidth: 200,
				},
				{
					headerName: '전체',
					field: 'allYn',
					maxWidth: 65,
					minWidth: 65,
					editable: false,
				    cellRenderer: params => {
						return `<input
									name="allYnChk_${params.data.authGrpCd}_${params.data.authCd}_${params.data.menuCd}"
									type='checkbox' ${params.value == 'Y' ? 'checked' : ''}
									onchange="SYS002002_M01.checkAllYn(event, '_${params.data.authGrpCd}_${params.data.authCd}_${params.data.menuCd}')"
									class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper ${params.value == 'Y' ? 'ag-checked' : ''}"
								/>`;
					},
				},
				{
					headerName: '조회',
					field: 'selectYn',
					maxWidth: 65,
					minWidth: 65,
					editable: false,
					cellRenderer: params => {
						return `<input
									name="selectYnChk_${params.data.authGrpCd}_${params.data.authCd}_${params.data.menuCd}"
									onchange="SYS002002_M01.checkYn(event, '_${params.data.authGrpCd}_${params.data.authCd}_${params.data.menuCd}', 'sel')"
									class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper ${params.value == 'Y' ? 'ag-checked' : ''}"
									type='checkbox' ${params.value == 'Y' ? 'checked' : ''}
								/>`;
					},
				},
				{
					headerName: '등록',
					field: 'insertYn',
					maxWidth: 65,
					minWidth: 65,
					editable: false,
					cellRenderer: params => {
						return `<input
									name="insertYnChk_${params.data.authGrpCd}_${params.data.authCd}_${params.data.menuCd}"
									onchange="SYS002002_M01.checkYn(event, '_${params.data.authGrpCd}_${params.data.authCd}_${params.data.menuCd}', 'ins')"
									class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper ${params.value == 'Y' ? 'ag-checked' : ''}"
									type='checkbox' ${params.value == 'Y' ? 'checked' : ''}
								/>`;
					},
				},
				{
					headerName: '수정',
					field: 'updateYn',
					maxWidth: 65,
					minWidth: 65,
					editable: false,
					cellRenderer: params => {
						return `<input
									name="updateYnChk_${params.data.authGrpCd}_${params.data.authCd}_${params.data.menuCd}"
									onchange="SYS002002_M01.checkYn(event, '_${params.data.authGrpCd}_${params.data.authCd}_${params.data.menuCd}', 'upd')"
									class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper ${params.value == 'Y' ? 'ag-checked' : ''}"
									type='checkbox' ${params.value == 'Y' ? 'checked' : ''}
								/>`;
					},
				},
				{
					headerName: '삭제',
					field: 'deleteYn',
					maxWidth: 65,
					minWidth: 65,
					editable: false,
					cellRenderer: params => {
						return `<input
									name="deleteYnChk_${params.data.authGrpCd}_${params.data.authCd}_${params.data.menuCd}"
									onchange="SYS002002_M01.checkYn(event, '_${params.data.authGrpCd}_${params.data.authCd}_${params.data.menuCd}', 'del')"
									class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper ${params.value == 'Y' ? 'ag-checked' : ''}"
									type='checkbox' ${params.value == 'Y' ? 'checked' : ''}
								/>`;
					},
				},
				{
					headerName: '액셀조회',
					field: 'excelYn',
					maxWidth: 90,
					minWidth: 90,
					editable: false,
					cellRenderer: params => {
						return `<input
									name="excelYnChk_${params.data.authGrpCd}_${params.data.authCd}_${params.data.menuCd}"
									onchange="SYS002002_M01.checkYn(event, '_${params.data.authGrpCd}_${params.data.authCd}_${params.data.menuCd}', 'exc')"
									class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper ${params.value == 'Y' ? 'ag-checked' : ''}"
									type='checkbox' ${params.value == 'Y' ? 'checked' : ''}
								/>`;
					},
				},
			],
			defaultColDef: {  // 기본 컬럼정의
				flex: 1,  // 컬럼이동이 가능하게 한다.
				minWidth: 100,  // 각 컬럼당 최소넓이
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

		menuList: [],
		authGrpList: [],
		authList: [],
	},

	// 화면 UI 설정
	configUI: async function() {

		//메뉴, 권한 목록 조회
		const res = await CMMN.api.post(`/api/sys/SysMng/getList`, {});
		const menuList = res.data.menuList;
		const authGrpList = res.data.authGrpList;
		const authList = res.data.authList;

		//메뉴, 권한 목록 조회
		this.menuList = menuList;
		this.authList = authList;

		//초기 왼쪽 메뉴 목록 그리드 설정
		this.data.gridDataList_01 = menuList.filter((el) => el.menuLev == '2' || el.menuLev == '3')
		                                    .sort((a, b) => a.upprMenuNm.localeCompare(b.upprMenuNm) || a.menuNm.localeCompare(b.menuNm));
		this.gridInit_01();

		// [분류] > 2레벨 메뉴를 필터, 분류 및 설정
		document.querySelector(`#${this.targetElId} [name='search2LvMenu']`).innerHTML
			= menuList
				.filter((el) => el.menuTypCd == 'F')
				//.sort((a, b) => a.upprMenuNm.localeCompare(b.upprMenuNm) || a.menuNm.localeCompare(b.menuNm))
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.menuCd}">${curr.menuNm}</option>` );
				}, '<option value="">분류</option>');

		// [메뉴] > 3레벨 메뉴를 필터, 분류 및 설정
		document.querySelector(`#${this.targetElId} [name='search3LvMenu']`).innerHTML
			= '<option value="">메뉴</option>';

		// [오른쪽 검색 권한그룹]
		document.querySelector(`#${this.targetElId} [name='searchGrpAuth']`).innerHTML
			= authGrpList
				//.filter((el) => el.menuLev == '2')
				//.sort((a, b) => a.sortNo.localeCompare(b.sortNo))
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.cd}">${curr.cdNm}</option>` );
				}, '<option value="">권한그룹</option>');

		// [오른쪽 검색 권한명]
		document.querySelector(`#${this.targetElId} [name='searchAuth']`).innerHTML
			= '<option value="">권한명</option>';

		// [오른쪽 등록정보 권한그룹]
		document.querySelector(`#${this.targetElId} [name='selectedAuthGrp']`).innerHTML
			= authGrpList
				//.filter((el) => el.menuLev == '2')
				//.sort((a, b) => a.sortNo.localeCompare(b.sortNo))
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.cd}">${curr.cdNm}</option>` );
				}, '<option value="">선택</option>');

		// [오른쪽 등록정보 disabled 처리]
		document.querySelector(`#${this.targetElId} [name='selectedAuthGrp']`).setAttribute("disabled", "true");
		document.querySelector(`#${this.targetElId} [name='selectedAuthNm']`).setAttribute("disabled", "true");
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
		this.data.gridOptions_01.api.setRowData(this.data.gridDataList_01);
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

	//셀렉트박스 변경 시 이벤트
	search_01: async function(param){

		//신규 여부 확인
		const newYn = document.querySelector(`#${this.targetElId} [name='selectedAuthGrp']`).getAttribute("disabled") ? "N" : "Y";

		// [오른쪽 등록정보 disabled 처리]
		if('MENU' != param && '3LV' != param){
			document.querySelector(`#${this.targetElId} [name='selectedAuthGrp']`).value = '';
			document.querySelector(`#${this.targetElId} [name='selectedAuthCd']`).value = '';
			document.querySelector(`#${this.targetElId} [name='selectedAuthNm']`).value = '';
			document.querySelector(`#${this.targetElId} [name='selectedAuthGrp']`).setAttribute("disabled", "true");
			document.querySelector(`#${this.targetElId} [name='selectedAuthNm']`).setAttribute("disabled", "true");
		}

		//왼쪽 분류 셀렉트박스 값
		const lv2Value = document.querySelector(`#${this.targetElId} [name='search2LvMenu']`).value;

		//오른쪽 권한그룹 셀렉트박스 값
		const grpAuthValue = document.querySelector(`#${this.targetElId} [name='searchGrpAuth']`).value;

		//왼쪽 메뉴 셀렉트박스 값
		let search3LvMenu = document.querySelector(`#${this.targetElId} [name='search3LvMenu']`).value;
		if('MENU' == param){
			search3LvMenu = '';
		}

		//오른쪽 권한명 셀렉트박스 값
		let authValue = document.querySelector(`#${this.targetElId} [name='searchAuth']`).value;
		if('AUTH' == param){
			authValue = '';
		}

		//조회 파라미터 설정
		const params = {
			upprMenuCd: lv2Value,
			menuCd: search3LvMenu,
			authGrpCd: grpAuthValue,
			authCd: authValue,
		}

		const response = await CMMN.api.post(`/api/sys/SysMng/getList`, { params });

		// 2레벨 메뉴 변경시, 3레벨 메뉴를 필터, 분류 및 설정
		if('MENU' == param){
			document.querySelector(`#${this.targetElId} [name='search3LvMenu']`).innerHTML
				= response.data.menuList
					.filter((el) => el.upprMenuCd == lv2Value)
					.sort(function compare(a, b){return a.sortNo - b.sortNo;})
					.reduce((prev, curr) => {
						return ( prev += `<option value="${curr.menuCd}">${curr.menuNm}</option>` );
				}, '<option value="">메뉴</option>');
		}

		// 권한그룹 변경시, 권한명을 필터, 분류 및 설정
		if('AUTH' == param){
			//console.log('grpAuthValue >>> ' , grpAuthValue);
			document.querySelector(`#${this.targetElId} [name='searchAuth']`).innerHTML
				= response.data.authList

					//권한코드 중복제거
					.filter(
					          (review, idx) => {
					            return (
								  review.authGrpCd == grpAuthValue &&
					              response.data.authList.findIndex((review1) => {
					                return review.authCd === review1.authCd
					              }) === idx
					            )
					          }
					        )

					//.sort(function compare(a, b){return a.sortNo - b.sortNo;})
					.reduce((prev, curr) => {
						return ( prev += `<option value="${curr.authCd}">${curr.authNm}</option>` );

				}, '<option value="">권한명</option>');
		}

		this.data.gridSelectedDataList_01 = [];
		this.data.gridSelectedDataList_02 = [];

		let menuData = response.data.menuList;
		let authData = response.data.authList.sort((a, b) => a.authCd.localeCompare(b.authCd));

		this.data.gridDataList_01 = menuData;
		if(
			'' == document.querySelector(`#${this.targetElId} [name='search2LvMenu']`).value &&
			'' == document.querySelector(`#${this.targetElId} [name='search3LvMenu']`).value
		){
			this.data.gridDataList_01 = this.menuList.filter((el) => el.menuLev == '3').sort((a, b) => a.upprMenuNm.localeCompare(b.upprMenuNm) || a.menuNm.localeCompare(b.menuNm));
		}

		//신규 시 조건
		if('N' == newYn){
			if('' != grpAuthValue){

				if('MENU' != param && '3LV' != param){
					this.data.gridDataList_02 = authData;
				}
			}else{
				this.data.gridDataList_02 = [];
			}
		}

		// grid 데이터 셋팅
		this.setGridData();

		// [오른쪽 권한명]
		let authNm = "";
		if(!('' == document.querySelector(`#${this.targetElId} [name='searchAuth']`).value)){
			authNm = this.authList.filter((el) => {
				return el.authGrpCd == grpAuthValue && el.authCd == document.querySelector(`#${this.targetElId} [name='searchAuth']`).value
			})[0].authNm;
			//console.log(authNm);
		}

		//신규 시 조건
		if('N' == newYn){
			// [오른쪽 등록정보 설정]
			document.querySelector(`#${this.targetElId} [name='selectedAuthGrp']`).value = grpAuthValue;
			document.querySelector(`#${this.targetElId} [name='selectedAuthCd']`).value =
			document.querySelector(`#${this.targetElId} [name='searchAuth']`).value == "" ? "" : document.querySelector(`#${this.targetElId} [name='searchAuth']`).value;
			document.querySelector(`#${this.targetElId} [name='selectedAuthNm']`).value = authNm;
		}
	},

	//오른쪽 영역 전체 체크박스 이벤트
	checkAllYn: function(event, key) {
		//console.log('this.data.gridDataList_02 >>> ', this.data.gridDataList_02);
		if(event.target.checked){
			document.querySelector("[name='selectYnChk" + key + "']").checked = true;
			document.querySelector("[name='deleteYnChk" + key + "']").checked = true;
			document.querySelector("[name='updateYnChk" + key + "']").checked = true;
			document.querySelector("[name='insertYnChk" + key + "']").checked = true;
			document.querySelector("[name='excelYnChk" + key + "']").checked = true;

			document.querySelector("[name='allYnChk" + key + "']").classList.add('ag-checked');
			document.querySelector("[name='selectYnChk" + key + "']").classList.add('ag-checked');
			document.querySelector("[name='deleteYnChk" + key + "']").classList.add('ag-checked');
			document.querySelector("[name='updateYnChk" + key + "']").classList.add('ag-checked');
			document.querySelector("[name='insertYnChk" + key + "']").classList.add('ag-checked');
			document.querySelector("[name='excelYnChk" + key + "']").classList.add('ag-checked');

			this.data.gridDataList_02.forEach(d => {
				if(key == ('_' + d.authGrpCd + '_' + d.authCd + '_' + d.menuCd)){
					d.allYn = 'Y';
					d.selectYn = 'Y';
					d.deleteYn = 'Y';
					d.updateYn = 'Y';
					d.insertYn = 'Y';
					d.excelYn = 'Y';
				}
			});

		}else{
			document.querySelector("[name='selectYnChk" + key + "']").checked = false;
			document.querySelector("[name='deleteYnChk" + key + "']").checked = false;
			document.querySelector("[name='updateYnChk" + key + "']").checked = false;
			document.querySelector("[name='insertYnChk" + key + "']").checked = false;
			document.querySelector("[name='excelYnChk" + key + "']").checked = false;

			document.querySelector("[name='allYnChk" + key + "']").classList.remove('ag-checked');
			document.querySelector("[name='selectYnChk" + key + "']").classList.remove('ag-checked');
			document.querySelector("[name='deleteYnChk" + key + "']").classList.remove('ag-checked');
			document.querySelector("[name='updateYnChk" + key + "']").classList.remove('ag-checked');
			document.querySelector("[name='insertYnChk" + key + "']").classList.remove('ag-checked');
			document.querySelector("[name='excelYnChk" + key + "']").classList.remove('ag-checked');


			this.data.gridDataList_02.forEach(d => {
				if(key == ('_' + d.authGrpCd + '_' + d.authCd + '_' + d.menuCd)){
					d.allYn = 'N';
					d.selectYn = 'N';
					d.deleteYn = 'N';
					d.updateYn = 'N';
					d.insertYn = 'N';
					d.excelYn = 'N';
				}
			});

		}
	},

	//오른쪽 영역 체크박스 이벤트
	checkYn: function(event, key, mode) {

		let selectYnChk = document.querySelector("[name='selectYnChk" + key + "']").checked;
		let insertYnChk = document.querySelector("[name='insertYnChk" + key + "']").checked;
		let deleteYnChk = document.querySelector("[name='deleteYnChk" + key + "']").checked;
		let updateYnChk = document.querySelector("[name='updateYnChk" + key + "']").checked;
		let excelYnChk  = document.querySelector("[name='excelYnChk" + key + "']").checked;

		//전체체크 변경
		if(selectYnChk && insertYnChk && deleteYnChk && updateYnChk && excelYnChk){
			document.querySelector("[name='allYnChk" + key + "']").checked = true;
			document.querySelector("[name='allYnChk" + key + "']").classList.add('ag-checked');

			this.data.gridDataList_02.forEach(d => {
				if(key == ('_' + d.authGrpCd + '_' + d.authCd + '_' + d.menuCd)){
					d.allYn = 'Y';
				}
			});
		}else{
			document.querySelector("[name='allYnChk" + key + "']").checked = false;
			document.querySelector("[name='allYnChk" + key + "']").classList.remove('ag-checked');

			this.data.gridDataList_02.forEach(d => {
				if(key == ('_' + d.authGrpCd + '_' + d.authCd + '_' + d.menuCd)){
					d.allYn = 'N';
				}
			});
		}

		if(event.target.checked){

			if(mode == 'sel'){
				document.querySelector("[name='selectYnChk" + key + "']").checked = true;
				document.querySelector("[name='selectYnChk" + key + "']").classList.add('ag-checked');
				this.data.gridDataList_02.forEach(d => {
					if(key == ('_' + d.authGrpCd + '_' + d.authCd + '_' + d.menuCd)){
						d.selectYn = 'Y';
					}
				});

			}else if(mode == 'ins'){
				document.querySelector("[name='insertYnChk" + key + "']").checked = true;
				document.querySelector("[name='insertYnChk" + key + "']").classList.add('ag-checked');
				this.data.gridDataList_02.forEach(d => {
					if(key == ('_' + d.authGrpCd + '_' + d.authCd + '_' + d.menuCd)){
						d.insertYn = 'Y';
					}
				});

			}else if(mode == 'del'){
				document.querySelector("[name='deleteYnChk" + key + "']").checked = true;
				document.querySelector("[name='deleteYnChk" + key + "']").classList.add('ag-checked');
				this.data.gridDataList_02.forEach(d => {
					if(key == ('_' + d.authGrpCd + '_' + d.authCd + '_' + d.menuCd)){
						d.deleteYn = 'Y';
					}
				});

			}else if(mode == 'upd'){
				document.querySelector("[name='updateYnChk" + key + "']").checked = true;
				document.querySelector("[name='updateYnChk" + key + "']").classList.add('ag-checked');
				this.data.gridDataList_02.forEach(d => {
					if(key == ('_' + d.authGrpCd + '_' + d.authCd + '_' + d.menuCd)){
						d.updateYn = 'Y';
					}
				});

			}else if(mode == 'exc'){
				document.querySelector("[name='excelYnChk" + key + "']").checked = true;
				document.querySelector("[name='excelYnChk" + key + "']").classList.add('ag-checked');
				this.data.gridDataList_02.forEach(d => {
					if(key == ('_' + d.authGrpCd + '_' + d.authCd + '_' + d.menuCd)){
						d.excelYn = 'Y';
					}
				});

			}

		}else{

			if(mode == 'sel'){
				document.querySelector("[name='selectYnChk" + key + "']").checked = false;
				document.querySelector("[name='selectYnChk" + key + "']").classList.remove('ag-checked');
				this.data.gridDataList_02.forEach(d => {
					if(key == ('_' + d.authGrpCd + '_' + d.authCd + '_' + d.menuCd)){
						d.selectYn = 'N';
					}
				});

			}else if(mode == 'ins'){
				document.querySelector("[name='insertYnChk" + key + "']").checked = false;
				document.querySelector("[name='insertYnChk" + key + "']").classList.remove('ag-checked');
				this.data.gridDataList_02.forEach(d => {
					if(key == ('_' + d.authGrpCd + '_' + d.authCd + '_' + d.menuCd)){
						d.insertYn = 'N';
					}
				});

			}else if(mode == 'del'){
				document.querySelector("[name='deleteYnChk" + key + "']").checked = false;
				document.querySelector("[name='deleteYnChk" + key + "']").classList.remove('ag-checked');
				this.data.gridDataList_02.forEach(d => {
					if(key == ('_' + d.authGrpCd + '_' + d.authCd + '_' + d.menuCd)){
						d.deleteYn = 'N';
					}
				});

			}else if(mode == 'upd'){
				document.querySelector("[name='updateYnChk" + key + "']").checked = false;
				document.querySelector("[name='updateYnChk" + key + "']").classList.remove('ag-checked');
				this.data.gridDataList_02.forEach(d => {
					if(key == ('_' + d.authGrpCd + '_' + d.authCd + '_' + d.menuCd)){
						d.updateYn = 'N';
					}
				});

			}else if(mode == 'exc'){
				document.querySelector("[name='excelYnChk" + key + "']").checked = false;
				document.querySelector("[name='excelYnChk" + key + "']").classList.remove('ag-checked');
				this.data.gridDataList_02.forEach(d => {
					if(key == ('_' + d.authGrpCd + '_' + d.authCd + '_' + d.menuCd)){
						d.excelYn = 'N';
					}
				});

			}

		}
	},

	// grid01, grid02 데이터를 셋팅한다.
	setGridData: function(){

		// grid_01 데이터 셋팅
		this.data.gridDataList_01
			= this.data.gridDataList_01
				.filter(d => !this.data.gridDataList_02.find(x => x.menuCd === d.menuCd) && d.menuTypCd === 'M');
		this.data.gridOptions_01.api.setRowData(this.data.gridDataList_01);

		// grid_02 데이터 셋팅
		// 목차순서순으로 정렬
		//this.data.gridDataList_02.sort((a, b) => Number(a.screnDispOrd) - Number(b.screnDispOrd));
		this.data.gridOptions_02.api.setRowData(this.data.gridDataList_02);

		this.data.gridSelectedDataList_01 = [];
		this.data.gridSelectedDataList_02 = [];
	},

	// 오른쪽으로 이동버튼 클릭
	moveToRight: async function() {

		//신규 여부 확인
		const newYn = document.querySelector(`#${this.targetElId} [name='selectedAuthGrp']`).getAttribute("disabled") ? "N" : "Y";
		if('Y' != newYn){

			if(
					'' == document.querySelector(`#${this.targetElId} [name='searchGrpAuth']`).value ||
					'' == document.querySelector(`#${this.targetElId} [name='searchAuth']`).value
				){
					return await CMMN.alert('권한그룹 또는 권한명을 선택해주세요.');
				}

		}

		//console.log(this.data.gridSelectedDataList_01);

		this.data.gridSelectedDataList_01.forEach(d => this.data.gridDataList_02.push(d));

		this.data.gridOptions_02.api.setRowData(this.data.gridDataList_02);

		this.setGridData();

		return;

	},

	// 왼쪽으로 이동버튼 클릭
	moveToLeft: async function() {

		//왼쪽으로 이동 상위 메뉴가 같지 않으면 이동이 되어서는 안됨.
		const menu =  document.querySelector(`#${this.targetElId} [name='search2LvMenu']`).value;

		//신규 여부 확인
		const newYn = document.querySelector(`#${this.targetElId} [name='selectedAuthGrp']`).getAttribute("disabled") ? "N" : "Y";
		if('Y' != newYn){
			if(
				'' == document.querySelector(`#${this.targetElId} [name='searchGrpAuth']`).value ||
				'' == document.querySelector(`#${this.targetElId} [name='searchAuth']`).value
			  ){
					return await CMMN.alert('권한그룹 또는 권한명을 선택해주세요.');
			   }
		}

		//console.log(this.data.gridSelectedDataList_02);

		this.data.gridSelectedDataList_02.forEach(d => {
			if('' != menu && menu == d.upprMenuCd){
				this.data.gridDataList_01.push(d);
			}
			this.data.gridDataList_02 = this.data.gridDataList_02.filter(f => d.menuCd != f.menuCd);
		});
		this.data.gridDataList_01.sort((a, b) => a.upprMenuNm.localeCompare(b.upprMenuNm) || a.menuNm.localeCompare(b.menuNm));

		this.data.gridOptions_01.api.setRowData(this.data.gridDataList_01);

		this.setGridData();

		return;

	},

	//신규 버튼 이벤트
	new: async function() {

		document.querySelector(`#${this.targetElId} [name='selectedAuthGrp']`).value = '';

		// [왼쪽 검색 영역 처리]
		//document.querySelector(`#${this.targetElId} [name='search2LvMenu']`).value = "";
		//document.querySelector(`#${this.targetElId} [name='search3LvMenu']`).value = "";

		// [오른쪽 검색 영역 처리]
		document.querySelector(`#${this.targetElId} [name='searchGrpAuth']`).value = "";
		document.querySelector(`#${this.targetElId} [name='searchAuth']`).value = "";

		// [오른쪽 등록정보 disabled 및 값 처리]
		document.querySelector(`#${this.targetElId} [name='selectedAuthGrp']`).removeAttribute("disabled");
		document.querySelector(`#${this.targetElId} [name='selectedAuthNm']`).removeAttribute("disabled");
		document.querySelector(`#${this.targetElId} [name='selectedAuthCd']`).value = "";
		document.querySelector(`#${this.targetElId} [name='selectedAuthNm']`).value = "";

		// 그리드 최기화
		//this.data.gridSelectedDataList_01 = [];
		//this.data.gridDataList_01 = [];
		//this.data.gridDataList_01 = this.menuList.filter((el) => el.menuLev == '3').sort((a, b) => a.upprMenuNm.localeCompare(b.upprMenuNm) || a.menuNm.localeCompare(b.menuNm));

		this.data.gridSelectedDataList_02 = [];
		this.data.gridDataList_02 = [];

		this.setGridData();
	},

	//신규권한코드 설정
	searchNewAuthCd: async function(param) {

		if('' == param){
			document.querySelector(`#${this.targetElId} [name='selectedAuthCd']`).value = '';
		}else{

			//조회 파라미터 설정
			const params = {
				authGrpCd: param,
			}

			const response = await CMMN.api.post(`/api/sys/SysMng/getNewAuthCd`, { params });

			document.querySelector(`#${this.targetElId} [name='selectedAuthCd']`).value = response.data.authCd;
		}
	},

	//권한 저장
	save: async function() {

		//신규 여부
		const newYn = document.querySelector(`#${this.targetElId} [name='selectedAuthGrp']`).getAttribute("disabled") ? "N" : "Y";

		const authGrpCd = document.querySelector(`#${this.targetElId} [name='selectedAuthGrp']`).value;	//권한그룹코드
		const authCd = document.querySelector(`#${this.targetElId} [name='selectedAuthCd']`).value;		//권한코드
		const authNm = document.querySelector(`#${this.targetElId} [name='selectedAuthNm']`).value;		//권한명

		//저장 데이터 설정
		this.data.gridDataList_02.forEach(item => {
			item.newYn = newYn;
			item.authGrpCd = authGrpCd;
			item.authCd = authCd;
			item.authNm = authNm;
		});

		//console.log(this.data.gridDataList_02);
		//return await CMMN.alert('개발중입니다.');

		//validation
		if(
			'' == authGrpCd ||
			'' == authCd
		){
			if("Y" != newYn){
				return await CMMN.alert('권한그룹 또는 권한명이 없습니다.');
			}
		}

		if('' == authGrpCd){
			return await CMMN.alert('권한그룹을 선택해주세요.');
		}
		if('' == authCd){
			return await CMMN.alert('권한코드를 입력해주세요.');
		}
		if('' == authNm){
			return await CMMN.alert('권한명을 입력해주세요.');
		}

		if(this.data.gridDataList_02.length == 0){
			return await CMMN.alert('저장할 내용이 없습니다.');
		}

		if(!await CMMN.confirm('저장하시겠습니까?')) return;

		//return console.log(this.data.gridDataList_02);
		const params = this.data.gridDataList_02;
		//console.log('>>> params: ', params);
		const response = await CMMN.api.post(`/api/sys/SysMng/saveAuth`, { params });
		//console.log('>>> response: ', response);

		return await CMMN.alert(response.data.returnMsg);
	},
}