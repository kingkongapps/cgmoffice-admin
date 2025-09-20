
window.addEventListener('CMN000000_P03', () => {
	CMN000000_P03.init();
})

const CMN000000_P03 = {
	targetElId: 'CMN000000_P03',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();

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
		data: {
			fileNo: '',
			previewList: [],
		},
	},
	// 화면 UI 설정
	configUI: function() {

	},
	// 팝업을 연다.
	open: async function(param, callbacks) {
		this.data.params = param;
		this.data.callbacks = callbacks || [];
		this.data.data = { fileNo: '', previewList: [] };

		document.querySelector(`#${this.targetElId} [name='pdf-preview']`).innerHTML  = '';
		document.querySelector(`#${this.targetElId} [name='fileNm']`).innerText = `${param.fileNm}`;

		const params = {
			fileNo : `${param.fileNo}`,
		};

		const response = await CMMN.api.post('/api/cnt/prdtClusPdfMng/getPdfInfo', { params });

		// console.log('>>> response: ', response);

		this.data.data = response.data;

		const previewListSize = this.data.data.previewList.length;
		document.querySelector(`#${this.targetElId} [name='pdf-preview']`).innerHTML
			= this.data.data.previewList.reduce((prev, curr) => {

				const sort = curr.sort;
				if(sort % 4 == 0) {
					prev += `
						<div class="row">
					`;
				}
				prev += `
							<div class="col-md-3 mb-3">
								<div class="card">
									<div
										class="card-body p-1"
										style="cursor: pointer;"
										onclick="CMN000000_P03.viewPreviewPdf(${curr.sort})"
									>
										<img src="data:image/png;base64,${curr.previewBase64}" style="width: 100%;"/>
									</div>
									<div class="card-footer" style="text-align: center;">
										<label style="font-size: 13px;">Page ${curr.sort + 1}</label>
									</div>
								</div>
							</div>
				`;
				// 4번째 요소이거나, 마지막 요소일 경우
				if( (sort % 4 == 3) || (previewListSize == (sort + 1)) ){
					prev += `
						</div>
						`;
				}
				return prev;
			}, '');

		// 팝업을 보여준다.
		CMMN.showModal(this.data.modal);
	},
	close: function() {
		CMMN.hideModal(this.data.modal);
	},
	// 특정 PDF의 미리보기
	viewPreviewPdf: async function(sort) {
		const params = {
			fileNo : `${this.data.data.fileNo}`,
			sort : `${sort}`,
		};

		const { data } = await CMMN.api.post(`/api/cnt/prdtClusPdfMng/preview`, { params });

		const base64 = data;
		const page = sort + 1;

		// 미리보기 공통팝업을 이용해서 오픈
		CMN000000_P01.open(
			{ base64, page },
			[]
		)
	},
	download: function() {
		CMMN.downloadfilePost(this.data.data.fileNo);
	},
}