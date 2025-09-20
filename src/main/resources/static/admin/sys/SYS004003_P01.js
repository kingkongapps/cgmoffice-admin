
window.addEventListener('SYS004003_P01', () => {
	SYS004003_P01.init();
})

const SYS004003_P01 = {
	targetElId: 'SYS004003_P01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();

		// 팝업 인스턴스를 생성한다.
		this.data.modal = CMMN.genModal(
			document.getElementById(this.targetElId)
		);
	},
	data: {
		modal: null,
		params: {},
		callbacks: [],
		isNew: false,
		old_prdtChgYmd: null,
	},
	// 화면 UI 설정
	configUI: function() {

	},
	// 팝업을 연다.
	open: function(params, callbacks) {
		this.data.params = params;
		this.data.callbacks = callbacks || [];

		console.log(params);

		//팝업내용 셋팅
		this.setPopUiData(this.data.params);

		// 팝업을 보여준다.
		CMMN.showModal(this.data.modal);
	},
	// 팝업 내용 셋팅
	setPopUiData: function(data) {

		//데이터 셋팅
		document.querySelectorAll(`#${this.targetElId} [data-field]`).forEach(el => {
			const dataField = el.getAttribute('data-field');

			if(dataField === 'delYn' && this.data.isNew) {
				el.value = 'N';
			} else {
				el.value = data[dataField] || '';
			}
		});

	},
	//닫기, 취소버튼
	close: function() {
		CMMN.hideModal(this.data.modal);
	},

}





















