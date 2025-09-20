
window.addEventListener('SYS001001_P01', () => {
	SYS001001_P01.init();
})

const SYS001001_P01 = {
	targetElId: 'SYS001001_P01',
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
		isNew: false,
	},
	// 화면 UI 설정
	configUI: function() {
		// 각 입력단의 값이 변경될때마다 data.params 의 해당 데이터를 실시간 변경하도록 설정
		document.querySelectorAll(`#${this.targetElId} [data-field]`).forEach(el => {
			el.addEventListener('change', (event) => {
				const target = event.target
				const dataField = target.getAttribute('data-field');
				const dataType = target.getAttribute('data-type');
				if(dataType !== 'date') {
					this.data.params[dataField] = target.value;
				}
			})
		});
	},
	// 팝업을 연다.
	open: function(params, callbacks) {
		this.data.params = params;
		this.data.callbacks = callbacks || [];

		this.data.isNew = params.cd ? false : true;

		document.querySelector(`#${this.targetElId} [name='title']`)
			.innerText = this.data.isNew ? '회사등록' : '회사수정/상세';
		document.querySelector(`#${this.targetElId} [name='cancel']`)
			.innerText = this.data.isNew ? '취소' : '닫기';
		document.querySelector(`#${this.targetElId} [name='save']`)
			.innerText = this.data.isNew ? '저장' : '수정';

		// 각 입력단의 활성/비활성화를 셋팅한다.
		this.setInputDisabled();

		// 팝업의 내용을 셋팅한다.
		this.setPopUiData(this.data.params);

		// 팝업을 보여준다.
		CMMN.showModal(this.data.modal);
	},
	// 팝업의 내용을 셋팅한다.
	setPopUiData: function(data) {
		document.querySelectorAll(`#${this.targetElId} [data-field]`).forEach(el => {
			const dataField = el.getAttribute('data-field');

			if(dataField === 'useYn' && this.data.isNew) {
				el.value = 'N';
				data[dataField] = el.value;
			} else {
				el.value = data[dataField] || '';
			}
		});
	},
	// 각 입력단의 활성/비활성화를 셋팅한다.
	setInputDisabled: function(isAll) {
		if(isAll) {
			document.querySelectorAll(`#${this.targetElId} [data-field]`).forEach(el => {
				el.disabled = true;
			});
		} else {
			document.querySelectorAll(`#${this.targetElId} [data-field]`).forEach(el => {
				el.disabled = false;
			});
			document.querySelector(`#${this.targetElId} [data-field='cd']`)
				.disabled = this.data.isNew ? false : true;
		}
	},
	close: function() {
		CMMN.hideModal(this.data.modal);
	},
	save: async function() {

		if(!this.data.params.cd) {
			await CMMN.alert('회사코드는 필수입니다.');
			document.querySelector(`#${this.targetElId} [data-field='cd']`).focus();
			return;
		}
		if(!this.data.params.cdNm) {
			await CMMN.alert('회사명은 필수입니다.');
			document.querySelector(`#${this.targetElId} [data-field='cdNm']`).focus();
			return;
		}
		if(!this.data.params.sortNo) {
			await CMMN.alert('정렬순서는 필수입니다.');
			document.querySelector(`#${this.targetElId} [data-field='sortNo']`).focus();
			return;
		}

		const params = this.data.params;
		// console.log('>>> params: ', params);

		// 만약 신규등록의 경우 신규로 입력한 코드가 이미 존재하는지를 먼저 파악한다.
		if(this.data.isNew){
			const { data: cnt } = await CMMN.api.post('/api/common/code/chkCmmnCd', { params });
			// console.log('>>> cnt: ', cnt);
			if(cnt >= 1) {
				CMMN.alert('입력하신 회사코드는 이미 존재합니다.');
				return;
			}
		}

		const confirmMsg = `입력한 내용을 ${this.data.isNew ? '등록' : '수정'} 하시겠습니까?`;
		if(!await CMMN.confirm(confirmMsg)) {
			return;
		}
		await CMMN.api.post('/api/common/code/saveCmmnCd', { params });

		this.close();  // 팝업을 닫는다.

		if(this.data.callbacks[0]) {
			this.data.callbacks[0]();
		}
	},
}