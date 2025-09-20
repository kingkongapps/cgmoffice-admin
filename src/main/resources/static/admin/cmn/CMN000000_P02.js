
window.addEventListener('CMN000000_P02', () => {
	CMN000000_P02.init();
})

const CMN000000_P02 = {
	targetElId: 'CMN000000_P02',
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
		
		// grid 설정 옵션
		gridOptions: {
			columnDefs: [  // grid 컬럼 정의
				{ 
					headerName: '파일명', 
					field: 'fileNm',
				},
				{ 
					headerName: '생성일시', 
					field: 'crtDtmChar', 
					minWidth: 90,
					maxWidth: 200,
				},
				{ 
				    headerName: '상세확인', 
				    field: 'action', 
				    cellRenderer: function(params) {
				        return `
								<button 
									class="btn btn-sm btn-secondary" 
									style="margin-bottom: 2px;" 
									data-id="${params.data.id}"
								>
									상세확인
								</button>
							`;
				    },
				    minWidth: 100,
				    maxWidth: 100,
				},
			],
			defaultColDef: {  // 기본 컬럼정의
				flex: 1,  // 컬럼이동이 가능하게 한다.
				minWidth: 100,  // 각 컬럼당 최소넓이
				resizable: true,  // 컬럼사이즈 조정가능 여부
				sortable: true,  // 정렬가능 여부
			},
			rowSelection: 'single',
		},
		// grid 에서 클릭한 row의 데이터
		gridClickedData: {},
		dataList: [],
	},
	// 화면 UI 설정
	configUI: function() {
		
	},
	// grid 초기화
	gridInit: function() {
		// row 클릭이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions.onCellClicked = this.gridOnCellClicked.bind(this);
		// row 더블클릭이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions.onRowDoubleClicked = this.gridOnRowDoubleClicked.bind(this);
		// grid 초기화
		new agGrid.Grid(
			document.querySelector(`#${this.targetElId} [name='table-content']`),
			this.data.gridOptions
		);
		this.data.gridOptions.api.setRowData([]);
	},
	// grid 셀 클릭 이벤트 발생
	gridOnCellClicked: function(event) {
		// console.log('>>> event.colDef.field: ', event.colDef.field);
		
		// 객체를 깊은복사를 진행한다.
		this.data.gridClickedData = JSON.parse(JSON.stringify(event.data));
		
		if(event.colDef.field === 'action') {
			this.CMN_P03_open();
		}
	},
	gridOnRowDoubleClicked: function(event) {
		console.log('더블클릭한 행:', event.data);
		// 객체를 깊은복사를 진행한다.
		this.data.gridClickedData = JSON.parse(JSON.stringify(event.data));
		this.confirm();
	},
	// 팝업을 연다.
	open: function(params, callbacks) {
		this.data.params = params;
		this.data.callbacks = callbacks || [];
		
		this.data.dataList = [];
		this.data.gridClickedData = {};

		document.querySelector(`#${this.targetElId} [name='fileNm']`).value = '';
		this.data.gridOptions.api.setRowData([]);
		// 팝업을 보여준다.
		CMMN.showModal(this.data.modal); 
	},
	close: function() {
		CMMN.hideModal(this.data.modal);  
	},
	search: async function() {
		const fileNm = document.querySelector(`#${this.targetElId} [name='fileNm']`).value;
		const params = {
			fileNm
		}
		const response = await CMMN.api.post('/api/cnt/prdtClusPdfMng/getList', { params });
		
		// fileNm 이 동일한경우 가장 최근의 것만 추출
		this.data.dataList = response.data.list.reduce((prev, curr) => {
			const existing = prev.find(item => item.fileNm === curr.fileNm);
			if (!existing) {
				prev.push(curr);
			} else if (curr.crtDtmChar > existing.crtDtmChar) {
				// 더 큰 crtDtmChar가 있으면 교체
				const idx = prev.indexOf(existing);
				prev[idx] = curr;
			}
			return prev;
		}, []);
		// fileNm 으로 정렬
		this.data.dataList.sort((a, b) => a.fileNm.localeCompare(b.fileNm));
		
		// grid 에 데이터를 표시한다.
		this.data.gridOptions.api.setRowData(this.data.dataList);
	},
	CMN_P03_open: function() {
		CMN000000_P03.open(
			this.data.gridClickedData,
			[]
		);
	},
	confirm: async function() {
		if(Object.keys(this.data.gridClickedData).length == 0) {
			await CMMN.alert('선택된 상품이 없습니다.');
			return;
		}
		
		if(this.data.callbacks[0]) {
			this.data.callbacks[0](
				this.data.gridClickedData
			);
		}
		this.close();
	},
}