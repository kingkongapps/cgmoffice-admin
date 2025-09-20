window.addEventListener('CMN000001_M01', () => {
	CMN000001_M01.init();
})

const CMN000001_M01 = {
	targetElId: 'CMN000001_M01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

	},
	data: {
	},
	changeCss: async function(){
		const el_memId = document.getElementById('memId');
		const memId = el_memId.value;

		const cmmnCss = "styles_CMMN.css";
		const shCss = "styles_P07.css";

		const cmmnIco = "/static/ico/favicon.ico";
		const shIco = "/static/ico/shFavicon.ico";

		if(memId == "shadmin") {
			document.querySelector('head').children.forEach(item =>{
				if(String(item.href).includes(cmmnCss)){
					item.href = item.href.replace(cmmnCss, shCss);
				}
			});

			document.querySelector('head').children.forEach(item =>{
				if(String(item.href).includes(cmmnIco)){
					item.href = item.href.replace(cmmnIco, shIco);
				}
			});
		} else {
			document.querySelector('head').children.forEach(item =>{
				if(String(item.href).includes(shCss)){
					item.href = item.href.replace(shCss, cmmnCss);
				}
			});

			document.querySelector('head').children.forEach(item =>{
				if(String(item.href).includes(shIco)){
					item.href = item.href.replace(shIco, cmmnIco);
				}
			});
		}
	},
	login: async function(){
		const el_memId = document.getElementById('memId');
		const el_passwd = document.getElementById('passwd');
		const memId = el_memId.value;
		const passwd = el_passwd.value;
		const viewId = location.pathname.toUpperCase();

		if(!memId) {
			await CMMN.alert('아이디를 입력해주세요.');
			el_memId.focus();
			return;
		}
		if(!passwd) {
			await CMMN.alert('비밀번호를 입력해주세요.');
			el_passwd.focus();
			return;
		}

		const params = { memId, passwd, viewId };

		const response = await CMMN.login(params);

		console.log('>>> login response : ', response);

		location.href = "/";
	},
}

