
window.addEventListener('CMN000000_P06', () => {
	CMN000000_P06.init();
})

const CMN000000_P06 = {
	targetElId: 'CMN000000_P06',
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
	},
	configUI: function() {

	},
	// 팝업을 연다.
	open: function(params, callbacks) {
		this.data.params = params;
		this.data.callbacks = callbacks || [];

		document.querySelector(`#${this.targetElId} iframe[name='simul-preview']`).src = params.src;

		// 팝업을 보여준다.
		CMMN.showModal(this.data.modal);
	},
	close: function() {
		CMMN.hideModal(this.data.modal);
	},
}