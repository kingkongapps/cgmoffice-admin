
window.addEventListener('SYS003001_M01', () => {
	//console.log(CMMN);
	//SYS003001_M01.init();
})

const SYS003001_M01 = {
	targetElId: 'SYS003001_M01',

	init: function() {

	},

	// 화면 UI 설정
	changePassword: async function() {

		const pwCur = document.querySelector(`#${this.targetElId} [name='pwCur']`);
		const pwNew = document.querySelector(`#${this.targetElId} [name='pwNew']`);
		const pwCof = document.querySelector(`#${this.targetElId} [name='pwCof']`);

		//validation
		//빈값 확인
		if('' == pwCur.value){
			await CMMN.alert('현재 비밀번호를 입력해주세요.');
			pwCur.focus();
			return;
		}
		if('' == pwNew.value){
			await CMMN.alert('신규 비밀번호를 입력해주세요.');
			pwNew.focus();
			return;
		}
		if('' == pwCof.value){
			await CMMN.alert('비밀번호 확인을 입력해주세요.');
			pwCof.focus();
			return;
		}

		//글자수 확인
		if(8 > pwNew.value.length || 15 < pwNew.value.length){
			await CMMN.alert('비밀번호는 8자 이상 15자 이내로 입력해주세요.');
			pwNew.focus();
			return;
		}

		//영문, 숫자, 특수문자 중 2가지 혼합 확인
		const num = pwNew.value.search(/[0-9]/g);
		const eng = pwNew.value.search(/[a-z]/ig);
		const spe = pwNew.value.search(/[`~!@@#$%^&*|₩₩₩'₩";:₩/?]/gi);

		if( (num < 0 && eng < 0) || (eng < 0 && spe < 0) || (spe < 0 && num < 0) ){
			await CMMN.alert("영문, 숫자, 특수문자 중 2가지 이상을 혼합하여 입력해주세요.");
			pwNew.focus();
			return;
		}

		//연속된 숫자, 문자 확인
		if(this.pwContinue(pwNew.value)){
			await CMMN.alert("연속된 숫자, 문자를 사용할 수 없습니다.");
			pwNew.focus();
			return;
		}

		//반복된 숫자, 문자 확인
		if(this.pwSame(pwNew.value)){
			await CMMN.alert("반복된 숫자, 문자를 사용할 수 없습니다.");
			pwNew.focus();
			return;
		}

		//신규 비밀번호와 비밀번호 확인이 같은지 확인
		if(pwNew.value !== pwCof.value){
			await CMMN.alert("입력한 비밀번호가 일치하지 않습니다.");
			pwCof.focus();
			return;
		}

		if(!await CMMN.confirm('저장하시겠습니까?')){
			return;
		}else{
			const params = {
				  pwCur: pwCur.value
				, pwNew: pwNew.value
				, pwCof: pwCof.value
			};

			const response = await CMMN.api.post(`/api/sys/PasswdChg/updPasswd`, { params });
			console.log('response >>> ', response);

			await CMMN.alert(response.data.returnMsg);

			if('E' == response.data.returnCd){
				pwCur.focus();
			}

			if('S' == response.data.returnCd){
				pwCur.value = '';
				pwNew.value = '';
				pwCof.value = '';
			}
		}

	},

	//공백방지
	noSpaceForm: function(e) {

		if(e.keyCode == '32'){
			e.returnValue = false;
		}
	},

	//연속된 숫자, 문자 확인
	pwContinue: function(pw){
		var cnt = 0; 
		var cnt2 = 0; 
		var tmp = ""; 
		var tmp2 = ""; 
		var tmp3 = ""; 
		  
		for(i=0; i<pw.length; i++){  
			tmp = pw.charAt(i);  
			tmp2 = pw.charAt(i+1);  
			tmp3 = pw.charAt(i+2);    

			if(tmp.charCodeAt(0) - tmp2.charCodeAt(0) == 1 && tmp2.charCodeAt(0) - tmp3.charCodeAt(0) == 1){   
				cnt = cnt + 1;  
			}  

			if(tmp.charCodeAt(0) - tmp2.charCodeAt(0) == -1 && tmp2.charCodeAt(0) - tmp3.charCodeAt(0) == -1){   
				cnt2 = cnt2 + 1;  
			} 
		} 

		if(cnt > 0 || cnt2 > 0){  
			return true;
		}else{
			return false;
		}
	},

	//반복된 숫자, 문자 확인
	pwSame: function(pw){
		var tmp = ""; 
		var cnt = 0; 

		for(i=0; i<pw.length; i++){  
			tmp = pw.charAt(i);  
			if(tmp == pw.charAt(i+1) && tmp == pw.charAt(i+2)){
				   cnt = cnt + 1;  
			} 
		} 
		if(cnt > 0){  
			return true; 
		}else{  
			return false; 
		}
	},
}