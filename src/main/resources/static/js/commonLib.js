
/* eslint-disable */
window.APP_CONFIG = null;

window.CMMN = {}

CMMN.rscVer = Math.floor(Date.now() / 1000);
CMMN.user = null;
CMMN.mainPageCode = "SYS000001_M01";
CMMN.setAuthBtn = (targetElId) => {
	const menuCd = targetElId.substring(0, 9);
	const menu = CMMN.user.menuList.find(m => m.menuCd === menuCd);
	const selectYn = menu.selectYn;
	const insertYn = menu.insertYn;
	const updateYn = menu.updateYn;
	const deleteYn = menu.deleteYn;
	const excelYn = menu.excelYn;
	document.querySelectorAll(`[data-auth]`).forEach(el => {
		const tagName = el.tagName;
		const dataAuth = el.getAttribute(`data-auth`); // I:insert, S:select, U:update, D:delete, E:excel

		if((selectYn != 'Y' && dataAuth == 'S')
			|| (insertYn != 'Y' && dataAuth == 'I')
			|| (updateYn != 'Y' && dataAuth == 'U')
			|| (deleteYn != 'Y' && dataAuth == 'D')
			|| (excelYn != 'Y' && dataAuth == 'E')
			) {
			if("INPUT" ===  tagName) {
				el.disabled=true;
			} else if("BUTTON" ===  tagName) {
				el.disabled=true;
			} else if("SELECT" ===  tagName) {
				el.disabled=true;
			} else if("A" ===  tagName) {
				el.onclick = null;
				el.onchange = null;
			}else{
				el.disabled=false;
			}
		}else{
			el.disabled=false;
		}
	})
}
CMMN.chkAuthBtn = (targetElId, authType) => {
	const menuCd = targetElId.substring(0, 9);
	const menu = CMMN.user.menuList.find(m => m.menuCd === menuCd);
	const selectYn = menu.selectYn;
	const insertYn = menu.insertYn;
	const updateYn = menu.updateYn;
	const deleteYn = menu.deleteYn;
	const excelYn = menu.excelYn;

	// I:insert, S:select, U:update, D:delete, E:excel
	if((selectYn != 'Y' && authType == 'S')
				|| (insertYn != 'Y' && authType == 'I')
				|| (updateYn != 'Y' && authType == 'U')
				|| (deleteYn != 'Y' && authType == 'D')
				|| (excelYn != 'Y' && authType == 'E')
				) {
		return true;
	}
	return false;
}

CMMN.goToLoginPage = () => {
	CMMN.sessionStorage.removeItem('currPageCode');
	location.href = "/CMN000001_M01";
}

// input 필드의 입력값 길이가 maxlength 의 값을 초과할 경우 maxlength 값까지만 잘라서 input 값을 셋팅하는 함수
CMMN.maxLengthCheck = (obj) => {
	if (obj.value.length > obj.maxLength) {
		obj.value = obj.value.slice(0, obj.maxLength);
	}
}

CMMN.CMMN_CD = [];
// 전역에 공통코드를 셋팅한다.
CMMN.setAllCmmnCd = async () => {
	const response = await CMMN.api.get('/api/common/code/cmmnCdAll', { loadingbar: 'N' });
	// console.log('>>> getCmmnCd response: ', response);
	CMMN.CMMN_CD = response.data;
}
// 전역에 저장된 공통코드들을 재셋팅한다.
CMMN.resetCmmnCd = (grpCd, cmmnCdList) => {
	CMMN.CMMN_CD = CMMN.CMMN_CD.filter(code => code.grpCd !== grpCd);
	CMMN.CMMN_CD = CMMN.CMMN_CD.concat(cmmnCdList);
}
// 공통코드를 가지고 온다.
CMMN.getCmmnCd = (grpCd) => {
	return CMMN.CMMN_CD
		.filter(code => code.grpCd === grpCd && code.delYn === 'N')
		.sort((a, b) => a.sortNo - b.sortNo);
}
// 공통코드의 코드명을 가지고 온다.
CMMN.getCmmnCdNm = (grdCd, cd) => {
	const cmmnCd = CMMN.getCmmnCd(grdCd);
	if(cmmnCd) {
		const target = cmmnCd.find(c => c.cd == cd);
		if(target) {
			return target.cdNm;
		} else {
			return '';
		}
	} else {
		return '';
	}
}


// 로그인 실행
CMMN.login = (params) => {
	CMMN.sessionStorage.removeItem('jwt');
	CMMN.user = null;
	return new Promise((resolve) => {
		CMMN.api
			.post('/api/common/authenticate/signin', { params })
			.then((response) => {
				const jwt = response.headers['jwt'];
				console.log('>>> response: ', response);
				CMMN.sessionStorage.setItem('jwt', jwt);
				resolve(response)
			})
			.catch((error) => {
				console.error(error)
				reject(error)
			})
	})
}

CMMN.setUser = () => {
	return new Promise((resolve) => {
	CMMN.api
		.get('/api/common/user/info')
		.then((response) => {
			CMMN.user = response.data;
			resolve(response)
		})
		.catch((error) => {
			console.error(error)
			reject(error)
		})
	})
}

// 로그아웃 실행
CMMN.logout = async () => {
	if(! await CMMN.confirm('로그아웃 하시겠습니까?')) {
		return;
	}
	CMMN.user = null;
	await CMMN.api.get('/api/common/authenticate/signout');
	CMMN.sessionStorage.clear();
	CMMN.goToLoginPage();  // 로그인페이지 이동
}

// api 호출공통 함수
CMMN.api = {
	get: (url, options = {}) => CMMN.api.callBase('get', url, options),
	post: (url, options = {}) => CMMN.api.callBase('post', url, options),
	put: (url, options = {}) => CMMN.api.callBase('put', url, options),
	patch: (url, options = {}) => CMMN.api.callBase('patch', url, options),
	delete: (url, options = {}) => CMMN.api.callBase('delete', url, options),
	callBase: (method, url, options) => {
		return new Promise((resolve) => {
			const { params = {} } = options;

			if(APP_CONFIG && APP_CONFIG.API_URL) {
				url = APP_CONFIG.API_URL + url;
			}

			options.headers = options.headers || {}
			const jwt = CMMN.sessionStorage.getItem('jwt')
			if (jwt) {
				options.headers['Authorization'] = `Bearer ${jwt}`
			}

			const pageConfig = options.pageConfig
			if (pageConfig) {
				const { page = '1', orders, limit = '10' } = pageConfig
				options.headers.pagingConfig = JSON.stringify({
					page,
					orders,
					limit,
				})
			}

			const callinfo = {
				method,
				url,
				params,
				options,
			}
			callinfo.type = 'json'

			const keys = Object.keys(params)
			for (let i = 0; i < keys.length; i++) {
				const type = CMMN.whatIsIt(params[keys[i]])
				if ('fileList' === type || 'file' === type) {
					if ('post' !== method) {
						CMMN.alert('파일 업데이트는 POST방식으로만 호출할 수 있습니다.')
						return
					} else {
						callinfo.type = 'form'
						break
					}
				}
			}

			resolve(callinfo)
		}).then((callinfo) => {
			if (callinfo.type === 'form') {
				return CMMN.api.callForm(callinfo)
			} else {
				return CMMN.api.callJson(callinfo)
			}
		})
	},
	callForm: ({ method, url, params, options }) => {
		return new Promise((resolve) => {
			if (options.loadingbar !== 'N') {
				CMMN.loadingbar(true)
			}
			const { responseType = 'json' } = options

			let headers = {
				'Content-Type': 'multipart/form-data',
				'Access-Control-Allow-Origin': '*',
			}

			headers = { ...headers, ...options.headers }

			const data = new FormData()

			Object.keys(params).forEach((key) => {
				const val = params[key]
				const valType = CMMN.whatIsIt(val)

				if ('file' == valType) {
					data.append(key, val)

					delete params[key]
				} else if ('fileList' == valType) {
					for (let i = 0; i < val.length; i++) {
						data.append(key, val[i])
					}
					delete params[key]
				} else {
					if ('array' == valType || 'object' == valType) {
						data.append(key, JSON.stringify(val))
					} else {
						data.append(key, val)
					}
				}
				data.append('jsonData', new Blob([JSON.stringify(params)], { type: 'application/json' }))
			})

			resolve({
				axios_options: { method, url, headers, data, responseType },
				options,
			})
		}).then((callinfo) => {
			return CMMN.api.callAxios(callinfo)
		})
	},
	callJson: ({ method, url, params, options }) => {
		return new Promise((resolve) => {
			if (options.loadingbar !== 'N') {
				CMMN.loadingbar(true)
			}
			const { responseType = 'json' } = options

			let headers = {
				'Content-Type': 'application/json;charset=UTF-8',
				'Access-Control-Allow-Origin': '*',
			}

			headers = { ...headers, ...options.headers }

			if (method === 'get') {
				let reqquery = ''

				Object.keys(params).forEach((key) => {
					let value = params[key]
					if (CMMN.isNotEmpty(value)) {
						if (CMMN.whatIsIt(value) === 'object' || CMMN.whatIsIt(value) === 'array') {
							value = encodeURIComponent(JSON.stringify(value))
						}
						reqquery += `&${key}=${value}`
					}
				})

				if (reqquery && url.indexOf('?') == -1) {
					reqquery = '?' + reqquery
				}
				url = url + reqquery

				const axios_options = { method, url, headers, responseType }

				resolve({ axios_options, options })
			} else {
				resolve({
					axios_options: { method, url, headers, data: params, responseType },
					options,
				})
			}
		}).then((callinfo) => {
			return CMMN.api.callAxios(callinfo)
		})
	},
	callAxios: ({ axios_options, options }) => {
		axios_options.headers.mode = 'axios'
		return new Promise((resolve, reject) => {
			axios(axios_options)
				.then((response) => {
				CMMN.loadingbar(false)
					const jwt = response.headers['jwt']
					if (jwt) {
						// 갱신된 jwt 를 셋팅한다.
						CMMN.sessionStorage.removeItem('jwt');
						CMMN.sessionStorage.setItem('jwt', jwt)
					}

					if (options.pageConfig) {
						options.pageConfig.pagingInfo = response.data.pagingInfo
					}
					resolve(response)
				})
				.catch((error) => {
					CMMN.loadingbar(false)

					const errMsg = error.response.data.responseMessage

					// 오류가 인증문제일 경우
					if(error.status == 401 || error.status == 403 ) {
						//로그인 페이지인 경우 그대로 알럿 띄우기
						if(location.pathname.toUpperCase() == "/CMN000001_M01"){
							if (errMsg) {
								CMMN.alert(errMsg)
							} else {
								CMMN.alert('서버오류')
							}
							return;
						//로그인 페이지가 아닌 경우에만 로그인 페이지로 이동
						} else {
							CMMN.goToLoginPage();  // 로그인페이지 이동
							return;
						}
					}

					if (errMsg) {
						CMMN.alert(errMsg)
					} else {
						CMMN.alert('서버오류')
					}
					reject(error);
				})
		})
	},
}

CMMN.getFilenameFromHeader = (contentDisposition) => {
	const filenameRegex = /filename\*?=(?:UTF-8'')?["']?([^;"]+)["']?/i
	const match = filenameRegex.exec(contentDisposition)
	return match ? decodeURIComponent(match[1]) : null
}

CMMN.downloadfile = (fileNo) => {
	return new Promise((resolve, reject) => {
		const options = { responseType: 'blob' }
		CMMN.api
			.get(`/api/common/file/download?fileNo=${fileNo}`, options)
			.then((response) => {
				CMMN.downloadFileProc(response)
				resolve()
			})
			.catch((err) => {
				reject(err)
			})
	})
}

//get 방식으로 파일 다운로드 시, 파라미터가 깨지는 현상이 있어서 post 방식으로 파일 다운로드 모듈 별도 추가
CMMN.downloadfilePost = (fileNo) => {
	return new Promise((resolve, reject) => {
		const params = { fileNo : fileNo }
		const options = { params, responseType: 'blob' }

		CMMN.api
			.post('/api/common/file/download', options)
			.then((response) => {
				CMMN.downloadFileProc(response)
				resolve()
			})
			.catch((err) => {
				reject(err)
			})
	})
}

CMMN.dnExcelTemplate = (code) => {
	return new Promise((resolve, reject) => {
		const options = { responseType: 'blob' }
		CMMN.api
			.get(`/api/common/file/dnExcelTemplate?code=${code}`, options)
			.then((response) => {
				CMMN.downloadFileProc(response)
				resolve()
			})
			.catch((err) => {
				reject(err)
			})
	});
}

CMMN.downloadFileProc = (response) => {
	// 헤더에서 파일명을 추출한다.
	const fileName = CMMN.getFilenameFromHeader(response.headers['content-disposition']);

	const link = document.createElement('a');
	link.href = window.URL.createObjectURL(new Blob([response.data]));
	link.setAttribute('download', fileName); // 다운로드 파일 이름
	document.body.appendChild(link);
	link.click();
	link.remove();
}

CMMN.modalStack = [];
CMMN.genModal = (el) => {
	return new bootstrap.Modal(
		el,
		{
			backdrop: 'static',
			keyboard: false, // ESC 키를 눌러도 닫히지 않도록 설정
		},
	);
}
CMMN.showModal = (modal) => {
	const connectedElement = modal._element;
	const elId = connectedElement.id;

	// 이전의 모든 모달의 zIndex 을 dim 의 zIndex 인 1050 보다 10 을 낮춘다.
	CMMN.modalStack.forEach(m => {
		document.getElementById(m).style.zIndex = 1045;
	})

	CMMN.modalStack.push(elId);
	modal.show();
}
CMMN.hideModal = (modal) => {
	CMMN.modalStack.pop();
	if(CMMN.modalStack.length > 0) {
		const lastModeId = CMMN.modalStack[CMMN.modalStack.length-1];
		document.getElementById(lastModeId).style.zIndex = 1055;
	}
	modal.hide();
}


// 팝업을 마우스드래그로 이동이 가능하게 한다.
CMMN.setModalDraggable = (modal) => {
	const connectedElement = modal._element;
	// console.log(connectedElement.id);

	const modalDialog = connectedElement.querySelector('.modal-dialog');
	const modalHeader = connectedElement.querySelector('.modal-header');

	if( modalDialog ) {
		let isDragging = false;
		let mouseOffset = { x: 0, y: 0 };
		let dialogOffset = { left: 0, right: 0 };
		modalHeader.addEventListener("mousedown", function (event) {
			isDragging = true;
			mouseOffset = { x: event.clientX, y: event.clientY };
			dialogOffset = {
				left: modalDialog.style.left === '' ? 0 : Number(modalDialog.style.left.replace('px', '')),
				right: modalDialog.style.top === '' ? 0 : Number(modalDialog.style.top.replace('px', ''))
			}
		});

		document.addEventListener("mouseup", function () {
			isDragging = false;
		});

		document.addEventListener("mousemove", function (event) {
			if (!isDragging) {
				return;
			}
			let newX = event.clientX - mouseOffset.x;
			let newY = event.clientY - mouseOffset.y;

			modalDialog.style.left = `${dialogOffset.left + newX}px`
			modalDialog.style.top = `${dialogOffset.right + newY}px`
		});

		// 모달이 사라질시 드래그로 변경된 위치를 다시 원래대로 되돌리는 로직
		modalDialog.closest('.modal.fade').addEventListener('hidden.bs.modal', () => {
			modalDialog.style.left = '';
			modalDialog.style.top = '';
		});
	}
}

CMMN.alert = (msg, title) => {
	const app_dialog = document.getElementById('app_dialog');

	if (!app_dialog) {
		alert(msg)
	} else {
		return new Promise((resolve) => {
			const modalElement = document.getElementById('app_dialog');
			const modal = CMMN.genModal(modalElement);
			const app_dialog_title = document.getElementById('app_dialog_title');
			const app_dialog_msg = document.getElementById('app_dialog_msg');
			const app_dialog_cancel = document.getElementById('app_dialog_cancel');
			const app_dialog_close = document.getElementById('app_dialog_close');
			const app_dialog_confirm_ok = document.getElementById('app_dialog_confirm_ok');

			app_dialog_cancel.style.display = 'none';

			app_dialog_msg.innerHTML = msg.replace(/\n/g, '<br>');
			app_dialog_title.innerText = title || '알림';

			const cleanup = () => {
				app_dialog_confirm_ok.removeEventListener('click', onOk);
				app_dialog_close.removeEventListener('click', onCancel);
			};

			const onOk = () => {
				cleanup();
				CMMN.hideModal(modal);
				resolve(true);
			};

			const onCancel = () => {
				cleanup();
				CMMN.hideModal(modal);
				resolve(true);
			};

			app_dialog_confirm_ok.addEventListener('click', onOk);
			app_dialog_close.addEventListener('click', onCancel);

			CMMN.setModalDraggable(modal);
			CMMN.showModal(modal);
		})
	}
}

CMMN.confirm = (msg, title) => {
	const app_dialog = document.getElementById('app_dialog');

	if (!app_dialog) {
		confirm(msg)
	} else {
		return new Promise((resolve) => {
			const modalElement = document.getElementById('app_dialog');
			const modal = CMMN.genModal(modalElement);
			const app_dialog_title = document.getElementById('app_dialog_title');
			const app_dialog_msg = document.getElementById('app_dialog_msg');
			const app_dialog_cancel = document.getElementById('app_dialog_cancel');
			const app_dialog_close = document.getElementById('app_dialog_close');
			const app_dialog_confirm_ok = document.getElementById('app_dialog_confirm_ok');

			app_dialog_cancel.style.display = '';

			app_dialog_msg.innerHTML = msg.replace(/\n/g, '<br>');
			app_dialog_title.innerText = title || '확인';

			const cleanup = () => {
				app_dialog_confirm_ok.removeEventListener('click', onOk);
				app_dialog_cancel.removeEventListener('click', onCancel);
				app_dialog_close.removeEventListener('click', onCancel);
			};
			const onOk = () => {
				cleanup();
				CMMN.hideModal(modal);
				resolve(true);
			};

			const onCancel = () => {
				cleanup();
				CMMN.hideModal(modal);
				resolve(false);
			};

			app_dialog_confirm_ok.addEventListener('click', onOk);
			app_dialog_cancel.addEventListener('click', onCancel);
			app_dialog_close.addEventListener('click', onCancel);

			CMMN.setModalDraggable(modal);
			CMMN.showModal(modal);
		})
	}
}

CMMN.JSONstringify = (json) => {
	if (typeof json != 'string') {
		json = JSON.stringify(json, undefined, '')
	}
	let arr = []
	json = json.replace(
		/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
		(match) => match,
	)
	arr.unshift(json)
	return arr
}

/**
 * 해당객체의 타입명을 반환해주는 함수
 *
 * @param obj
 * @returns 타입명 반환
 */
CMMN.whatIsIt = (obj) => {
	if (obj === null) {
		return 'null'
	} else if (obj === undefined) {
		return 'undefined'
	} else if (obj.type && obj.type.indexOf('application') > -1) {
		return 'file'
	} else if (typeof obj === 'string') {
		return 'string'
	} else if (typeof obj === 'number') {
		return 'number'
	} else if (typeof obj === 'function') {
		return 'function'
	} else if (obj.constructor === [].constructor) {
		return 'array'
	} else if (obj.constructor === {}.constructor) {
		return 'object'
	} else if (obj.constructor === FileList) {
		return 'fileList'
	} else if (obj.constructor === File) {
		return 'file'
	} else {
		return 'nothing'
	}
}

CMMN.isEmpty = (obj) => {
	const objtyp = CMMN.whatIsIt(obj)
	if (objtyp === 'null') return true
	else if (objtyp === 'undefined') return true
	else if (objtyp === 'string' && obj.trim() == '') return true
	else if (objtyp === 'array' && obj.length == 0) return true
	else if (objtyp === 'object' && !Object.keys(obj).length === !Object.keys(JSON.parse('{}')).length) return true
	return false
}

CMMN.isNotEmpty = (obj) => {
	return !CMMN.isEmpty(obj)
}

/**
 * 로딩바 on/off 함수
 *
 * @param isOn
 */
CMMN.loadingbar = (isOn) => {
	const loader = document.getElementById('coreloader')
	if (loader) {
		if (isOn) {
			document.getElementById('coreloader').classList.remove('d-none');
		} else {
			document.getElementById('coreloader').classList.add('d-none');
		}
	}
}

CMMN.scriptStoreMap = {};

CMMN.include = async (pageCd, params = {}) => {
	CMMN.goTo(pageCd, params, {}, 'Y');
}

CMMN.goTo = async (pageCd, params = {}, options = {}, includeYn = 'N') => {

	if(!CMMN.user) {
		CMMN.goToLoginPage();
	}

	if (options.loadingbar !== 'N') {
		// CMMN.loadingbar(true);
	}

	let reqquery = ''
	Object.getOwnPropertyNames(params).forEach((key) => {
		let value = params[key]
		if (CMMN.isNotEmpty(value)) {
			if (CMMN.whatIsIt(value) === 'object' || CMMN.whatIsIt(value) === 'array') {
				value = encodeURIComponent(JSON.stringify(value))
			}
			reqquery += `&${key}=${value}`
		}
	})

	const url = '/' + pageCd;
	if (reqquery.length >= 1 && url.indexOf('?') == -1) {
		reqquery = '?' + reqquery.substring(1)
	}

	const response = await CMMN.api.get(url + reqquery, { loadingbar: 'N' });

	if(!CMMN.isEmpty(reqquery)){
		CMMN.sessionStorage.setItem('reqquery', reqquery.replace('?', ''));
	} else {
		CMMN.sessionStorage.setItem('reqquery', '');
	}

	// dom 의 내용을 교체한다.
	if(includeYn === 'Y') {
		// include 영역 추가

		// 공통팝업의 경우
		if(pageCd.indexOf('CMN000000') > -1) {
			const layoutIncludeCmn = document.getElementById("layoutIncludeCmn");
			if(layoutIncludeCmn) {
				layoutIncludeCmn.insertAdjacentHTML('beforeend', response.data);
			}
		}
		else {
			const layoutInclude = document.getElementById("layoutInclude");
			if(layoutInclude) {
				layoutInclude.insertAdjacentHTML('beforeend', response.data);
			}
		}

	} else {
		const layoutContent = document.getElementById("layoutContent");
		if(layoutContent) {
			layoutContent.innerHTML = response.data;
		}
		// include 영역 초기화
		const layoutInclude = document.getElementById("layoutInclude");
		if(layoutInclude) {
			layoutInclude.innerHTML = '';
		}
		CMMN.sessionStorage.setItem('currPageCode', pageCd);
	}

	const menuCode = pageCd.substring(0,9);

	setTimeout(() => {
		// 교체된 DOM 렌더링 다음 틱을 실행. 이 시점에는 layoutContent 내부 DOM이 렌더링 완료됨

		const el_pagecd = document.querySelector(`#${pageCd} [name='pageCd']`);
		if(el_pagecd) {
			el_pagecd.innerText = pageCd;
		}

		if(CMMN.user && CMMN.user.menuList && includeYn !== 'Y') {
			const menuList = CMMN.user.menuList;
			const currMenu = menuList.find(m => m.menuCd === menuCode);

			const el_browserTitle = document.getElementById('browser_title');
			if(el_browserTitle) {
				if(currMenu) {
					el_browserTitle.innerText = `맞춤약관시스템 | ${currMenu.menuNm}`;
				} else {
					el_browserTitle.innerText = `맞춤약관시스템`;
				}
			}

			const el_menunm = document.querySelector(`#${pageCd} [name='menunm']`);
			if(pageCd === CMMN.mainPageCode) {
				if(el_menunm) {
					el_menunm.innerText = `메인페이지`;
				}
			} else {
				if(el_menunm && currMenu) {
					el_menunm.innerText = `${currMenu.menuNm}`;
				}
			}

			const el_breadcrumbOl = document.getElementById('breadcrumb_ol');
			if(el_breadcrumbOl && currMenu) {
				if(currMenu.menuLev == 1){
					el_breadcrumbOl.innerHTML = `
						<li class="breadcrumb-item" style="cursor: pointer;">
							<div onclick="CMMN.goTo(CMMN.mainPageCode)">
								<i class="fa-solid fa-house"></i>
							</div>
						</li>
						<li class="breadcrumb-item active">${currMenu.menuNm}</li>
					`;
				} else if(currMenu.menuLev == 2){
					const menuLev01 = menuList.find(m => m.menuLev == 1 && m.menuCd === currMenu.upprMenuCd);
					el_breadcrumbOl.innerHTML = `
						<li class="breadcrumb-item" style="cursor: pointer;">
							<div onclick="CMMN.goTo(CMMN.mainPageCode)">
								<i class="fa-solid fa-house"></i>
							</div>
						</li>
						<li class="breadcrumb-item">${menuLev01.menuNm}</li>
						<li class="breadcrumb-item active">${currMenu.menuNm}</li>
					`;
				} else if(currMenu.menuLev == 3){
					const menuLev02 = menuList.find(m => m.menuLev == 2 && m.menuCd === currMenu.upprMenuCd);
					const menuLev01 = menuList.find(m => m.menuLev == 1 && m.menuCd === menuLev02.upprMenuCd);
					el_breadcrumbOl.innerHTML = `
						<li class="breadcrumb-item" style="cursor: pointer;">
							<div onclick="CMMN.goTo(CMMN.mainPageCode)">
								<i class="fa-solid fa-house"></i>
							</div>
						</li>
						<li class="breadcrumb-item">${menuLev01.menuNm}</li>
						<li class="breadcrumb-item">${menuLev02.menuNm}</li>
						<li class="breadcrumb-item active">${currMenu.menuNm}</li>
					`;
				}
			}

			// 사이드메뉴의 active 클래스를 조정한다.
			document.querySelectorAll('[data-munulev]').forEach(el => el.classList.remove('active'));
			document.querySelectorAll(`[data-munulev='3']`).forEach(el03 => {
				if(el03.getAttribute('data-munulev03cd') === menuCode) {
					el03.classList.add('active');
					const data_munulev02 = el03.getAttribute('data-munulev02cd');
					const el02 = document.querySelector(`[data-munulev='2'][data-munulev02cd=${data_munulev02}]`);
					if(el02) {
						el02.classList.add('active');
					}
					const data_munulev01 = el03.getAttribute('data-munulev01cd');
					const el01 = document.querySelector(`[data-munulev='1'][data-munulev01cd=${data_munulev01}]`);
					if(el01) {
						el01.classList.add('active');
					}
					const el_collapse = document.querySelector(`[id='collapse_${data_munulev02}']`);
					if(el_collapse) {
						el_collapse.classList.add('show');
					}
				}
			});
			document.querySelectorAll(`[data-munulev='2']`).forEach(el02 => {
					if(el02.getAttribute('data-munulev02cd') === menuCode) {
						el02.classList.add('active');
						const data_munulev01 = el02.getAttribute('data-munulev01cd');
						const el01 = document.querySelector(`[data-munulev='1'][data-munulev01cd=${data_munulev01}]`);
						if(el01) {
							el01.classList.add('active');
						}
					}
				});
			document.querySelectorAll(`[data-munulev='1']`).forEach(el01 => {
				if(el01.getAttribute('data-munulev01cd') === menuCode) {
					el01.classList.add('active');
				}
			});

			// active 된 메뉴가 없다면 모든 collapse show 가 된 것을 닫는다.
			if(document.querySelectorAll('.nav-link.active').length == 0) {
				document.querySelectorAll('.nav-collapse').forEach(el => el.classList.remove('show'));
				document.querySelectorAll('.nav-link').forEach(el => {
					el.classList.add('collapsed');
					el.setAttribute('aria-expanded', 'false');
				});
			}
		}

		if(COMMON_SIDEBAR){
			COMMON_SIDEBAR.close();
		}
	}, 0);


	// 이미 해당페이지의 script 가 로딩되어있으면 skip
	if(CMMN.scriptStoreMap[pageCd]){
		setTimeout(() => {
			// 교체된 DOM 렌더링 다음 틱을 실행. 이 시점에는 layoutContent 내부 DOM이 렌더링 완료됨
			// 이미 기존에 페이지를 한번 호출해서 관련 script 들을 붙였으면...
			// 왜냐하면... DOM 이 로딩된 후 DOM 조장 스크립트도 있을 수 있기때문...
			window.dispatchEvent(new CustomEvent(pageCd, {}));
		}, 0);
		return;
	}

	CMMN.scriptStoreMap[pageCd] = true;

	/**
	 * javascript 를 동적으로 로딩
	 */
	// 임시 DOM 요소에 먼저 붙이고
	const tempEl = document.createElement('div');
	tempEl.innerHTML = response.data;

	// 스크립트만 추출해서 별도 실행
	const scripts = tempEl.querySelectorAll('script');
	let scriptCnt = 0;
	const dispatchEvt = () => {
		scriptCnt++;
		if(scriptCnt === scripts.length){
			window.dispatchEvent(new CustomEvent(pageCd, {}));
		}
	}
	scripts.forEach(script => {
		const newScript = document.createElement('script');
		if (script.src) {  // src가 있으면 외부 스크립트
			// 기존에 해당 script src 가 존재하면 또 append 하는 것을 방지한다.
			script.src = `${script.src}?rscVer=${CMMN.rscVer}`;
			if(
				[...document.getElementsByTagName('head')[0].querySelectorAll('script')]
				.filter(sc => sc.src === script.src)
				.length === 0
			) {
				newScript.src = script.src;
				document.getElementsByTagName('head')[0].appendChild(newScript);
				newScript.onload = () => dispatchEvt();
			} else {
				dispatchEvt();
			}
		} else {
			newScript.textContent = script.textContent;
			document.getElementsByTagName('head')[0].appendChild(newScript);
			newScript.onload = () => dispatchEvt();
		}
	});

	/**
	 * 스타일시트를 동적으로 로딩
	 */
	const links = tempEl.querySelectorAll('link');
	links.forEach(link => {
		const newLink = document.createElement('link');
		if (link.href) {  // href가 있으면 외부 css
			// 기존에 해당 css href 가 존재하면 또 append 하는 것을 방지한다.
			link.href = `${link.href}?rscVer=${CMMN.rscVer}`;
			if(
				[...document.getElementsByTagName('head')[0].querySelectorAll('link')]
				.filter(lk => lk.href === link.href)
				.length === 0
			) {
				newLink.href = link.href;
				document.getElementsByTagName('head')[0].appendChild(newLink);
			}
		} else {
			newLink.textContent = link.textContent;
			document.getElementsByTagName('head')[0].appendChild(newLink);
		}
	});

}

CMMN.genUUID = () => {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0
		const v = c === 'x' ? r : (r & 0x3) | 0x8
		return v.toString(16)
	})
}

CMMN.getToday = () => {
	const today = new Date()
	const year = today.getFullYear()
	const month = String(today.getMonth() + 1).lpad(2, '0')
	const date = String(today.getDate()).lpad(2, '0')
	return year + month + date
}

CMMN.sessionStorage = {
	setItem: (key, val) => {
		if (CMMN.whatIsIt(val) === 'object' || CMMN.whatIsIt(val) === 'array') {
			sessionStorage.setItem(key, JSON.stringify(val))
			return CMMN.sessionStorage
		} else {
			sessionStorage.setItem(key, val)
			return CMMN.sessionStorage
		}
	},
	getItem: (key) => {
		const rslt = sessionStorage.getItem(key)
		try {
			return JSON.parse(rslt)
		} catch (error) {
			return rslt
		}
	},
	removeItem: (key) => {
		sessionStorage.removeItem(key)
		return CMMN.sessionStorage
	},
	clear: () => sessionStorage.clear(),
}

CMMN.localStorage = {
	setItem: (key, val) => {
		if (CMMN.whatIsIt(val) === 'object' || CMMN.whatIsIt(val) === 'array') {
			localStorage.setItem(key, JSON.stringify(val))
			return CMMN.localStorage
		} else {
			localStorage.setItem(key, val)
			return CMMN.localStorage
		}
	},
	getItem: (key) => {
		const rslt = localStorage.getItem(key)
		try {
			return JSON.parse(rslt)
		} catch (error) {
			return rslt
		}
	},
	removeItem: (key) => {
		localStorage.removeItem(key)
		return CMMN.localStorage
	},
	clear: () => localStorage.clear(),
}

CMMN.setCookie = (cname, cvalue, expireSeconds) => {
	let expires = ''
	if (CMMN.isNotEmpty(expireSeconds)) {
		const d = new Date()
		d.setTime(d.getTime() + expireSeconds * 1000)
		expires = 'expires=' + d.toUTCString() + ';'
	}
	document.cookie = cname + '=' + cvalue + ';' + expires + 'path=/'
}

CMMN.getCookie = (cname) => {
	let name = cname + '='
	let decodedCookie = decodeURIComponent(document.cookie)
	let ca = decodedCookie.split(';')
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i]
		while (c.charAt(0) == ' ') {
			c = c.substring(1)
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length)
		}
	}
	return ''
}

CMMN.onlyEngNum = (element, maxLength) => {
	const rslt = element.value.replace(/[^a-zA-Z0-9]/g, ''); // 영어 대소문자 + 숫자만 허용
	if (maxLength && maxLength > 0) {
		element.value = rslt.substring(0, maxLength);
	} else {
		element.value = rslt;
	}
};

CMMN.onlyEngNumToUppercase = (element, maxLength) => {
	const rslt = element.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(); // 영어 대소문자 + 숫자만 허용
	if (maxLength && maxLength > 0) {
		element.value = rslt.substring(0, maxLength);
	} else {
		element.value = rslt;
	}
};

CMMN.onlyFloat = (element, maxLength, decimalPlaces) => {
	let rslt = element.value
		.replace(/[^0-9.]/g, '')           // 숫자와 점만 허용
		.replace(/(\..*?)\..*/g, '$1')     // 점(.)이 2개 이상 나오지 않도록 처리
		.replace(/^0+(\d)/, '$1');         // 앞자리 0 제거 (선택 사항)

	// 소수점 자리수 제한 적용
	if (decimalPlaces != null && decimalPlaces >= 0) {
		const regex = new RegExp(`^(\\d+)(\\.\\d{0,${decimalPlaces}})?`);
		const match = rslt.match(regex);
		rslt = match ? match[0] : '';
	}

	// 전체 길이 제한 적용
	if (maxLength && maxLength > 0) {
		element.value = rslt.substring(0, maxLength);
	} else {
		element.value = rslt;
	}
};

CMMN.onlyNumber = (element, maxLength) => {
	const rslt = element.value.replace(/[^0-9]/g, '').replace(/(\..*)\./g, '$1');
	if(maxLength && maxLength > 0) {
		element.value = rslt.substring(0, maxLength);
	} else {
		element.value = rslt;
	}
}

CMMN.onlyNumForm = (element, maxLength) => {
	const rslt = element.value
			.replace(/[^0-9]/g, '')
			.replace(/(\..*)\./g, '$1')
			.numformat()
	if(maxLength && maxLength > 0) {
		element.value = rslt.substring(0, maxLength);
	} else {
		element.value = rslt;
	}
}


CMMN.onlyDateFormat = (element) => {
	// 숫자와 마침표(.)만 허용
	let raw = element.value;
	let filtered = raw.replace(/[^0-9.]/g, ''); // 숫자와 . 외 제거

	// 숫자만 추출
	let val = filtered.replace(/\./g, '');

	// 8자리까지만
	if (val.length > 8) val = val.substring(0, 8);

	// 자동 포맷팅: YYYY.MM.DD
	if (val.length >= 5) {
	  filtered = val.substring(0, 4) + '.' + val.substring(4, 6) + (val.length >= 6 ? '.' + val.substring(6) : '');
	} else if (val.length >= 4) {
	  filtered = val.substring(0, 4) + '.' + val.substring(4);
	} else {
	  filtered = val;
	}

	// 입력값 반영
	element.value = filtered;

	// YYYY.MM.DD 형식이면 datepicker 적용
	if (/^\d{4}\.\d{2}\.\d{2}$/.test(filtered)) {
	  $(element).datepicker('setDate', filtered);
	}
};

CMMN.objectClear = (obj) => {
	const keys = Object.keys(obj)
	for (const key of keys) {
		delete obj[key]
	}
}

CMMN.pagingTo = () => {};
CMMN.setPagination = (select_query, paginator, func) => {
	if(paginator.totalCount == 0) {
		document.querySelector(select_query).innerHTML = '';
		return;
	};

	CMMN.pagingTo = func;
	document.querySelector(select_query).innerHTML = `
		${
			paginator.hasPrePage ? `
				<li class="datatable-pagination-list-item" style="width: 40px;">
					<a
						data-auth="S"
						class="datatable-pagination-list-item-link"
						style="cursor: pointer;text-align-last: center;"
						onclick="CMMN.pagingTo(1)"
					>‹‹</a>
				</li>
			` : `
				<li class="datatable-pagination-list-item" style="width: 40px;">
					<a
						data-auth="S"
						class="datatable-pagination-list-item-link"
						style="text-align-last: center;"
					>‹‹</a>
				</li>
			`
		}
		${
			paginator.hasPrePage ? `
				<li class="datatable-pagination-list-item" style="width: 40px;">
					<a
						data-auth="S"
						class="datatable-pagination-list-item-link"
						style="cursor: pointer;text-align-last: center;"
						onclick="CMMN.pagingTo(${paginator.prePage})"
					>‹</a>
				</li>
			` : `
				<li class="datatable-pagination-list-item" style="width: 40px;">
					<a
						data-auth="S"
						class="datatable-pagination-list-item-link"
						style="text-align-last: center;"
					>‹</a>
				</li>
			`
		}
		${
			paginator.pageSlider.reduce((prev, curr) => {

				if(paginator.page == curr){
					return (
						prev += `
							<li
								class="datatable-pagination-list-item"
							>
								<a
									data-auth="S"
									class="datatable-pagination-list-item-link"
									style="font-weight: 900;color: darkgreen;"
								>
										${curr}
								</a>
							</li>
						`
					);
				} else {
					return (
						prev += `
							<li
								class="datatable-pagination-list-item"
							>
								<a
									data-auth="S"
									class="datatable-pagination-list-item-link"
									onclick="CMMN.pagingTo(${curr})"
									style="cursor: pointer;"
								>
										${curr}
								</a>
							</li>
						`
					);
				}
			},'')
		}
		${
			paginator.hasNextPage ? `
				<li class="datatable-pagination-list-item" style="width: 40px;">
					<a
						data-auth="S"
						class="datatable-pagination-list-item-link"
						style="cursor: pointer;text-align-last: center;"
						onclick="CMMN.pagingTo(${paginator.nextPage})"
					>›</a>
				</li>
			` : `
				<li class="datatable-pagination-list-item" style="width: 40px;">
					<a
						data-auth="S"
						class="datatable-pagination-list-item-link"
						style="text-align-last: center;"
					>›</a>
				</li>
			`
		}
		${
			paginator.hasNextPage ? `
				<li class="datatable-pagination-list-item" style="width: 40px;">
					<a
						data-auth="S"
						class="datatable-pagination-list-item-link"
						style="cursor: pointer;text-align-last: center;"
						onclick="CMMN.pagingTo(${paginator.totalPages})"
					>››</a>
				</li>
			` : `
				<li class="datatable-pagination-list-item" style="width: 40px;">
					<a
						data-auth="S"
						class="datatable-pagination-list-item-link"
						style="text-align-last: center;"
					>››</a>
				</li>
			`
		}
	`;
}

//천단위 구분기호
CMMN.priceToString = (val, reg) => {
	if(CMMN.isEmpty(reg)) reg = ',';
	return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, reg);
},

//차트 색상 설정
CMMN.getChartColor = () => {
	const comCode = CMMN.user.comCode;

	switch (comCode) {
		case 'P07':
			return "#0072bc";
		case 'CMMN':
		default:
			return "#005294";
	}

};

//공통 초기화 함수
CMMN.init = async () => {
	//CmmnProperties 정보 가져오기 [필요한 정보만]
	const CmmnPropertiesDto = await CMMN.api.post(`/api/common/authenticate/getCmmnProperties`);

	CMMN.getCmmnProperties = CmmnPropertiesDto.data;

	//현재 서버명 가져우기 [로컬 : local, 개발 : dev]
	CMMN.getActive = CMMN.getCmmnProperties.active;
};

//공통 초기화 함수 실행
CMMN.init();

////////////////////////////////////////////////////////////////////////
//			prototype 형 공통함수			 //

//숫자 타입에서 쓸 수 있도록 format() 함수 추가
Number.prototype.numformat = function () {
	if (this == 0) return 0

	const reg = /(^[+-]?\d+)(\d{3})/
	let n = this + ''

	while (reg.test(n)) n = n.replace(reg, '$1' + ',' + '$2')

	return n
}

// 문자열 타입에서 쓸 수 있도록 format() 함수 추가
String.prototype.numformat = function () {
	const num = parseFloat(this)
	if (isNaN(num)) return '0'

	return num.numformat()
}

String.prototype.isContainFromStrArry = function (strArry) {
	for (var i = 0; i < strArry.length; i++) {
		if (this.indexOf(strArry[i]) != -1) {
			return true
		}
	}
	return false
}

/**
 * 문자열이 대상 문자열과 동일한 값인지의 여부를 반환한다.
 *
 * @param tagetStr -
 *						비교대상 문자열
 * @return 동일값 여부
 */
String.prototype.eq = function (tagetStr) {
	return tagetStr != null && typeof tagetStr != 'undefined' && this == tagetStr
}

/**
 * 문자열의 byte 길이를 반환한다.
 *
 * @return 문자열의 byte 길이
 */
String.prototype.getByte = function () {
	var cnt = 0
	for (var i = 0; i < this.length; i++) {
		if (this.charCodeAt(i) > 127) {
			cnt += 2
		} else {
			cnt++
		}
	}
	return cnt
}

/**
 * 문자열이 지정한 최소길이 이상인지의 여부를 반환한다.
 *
 * @param minLen -
 *						최소길이
 * @return 최소길이 이상인지의 여부
 */
String.prototype.isMin = function (minLen) {
	return this.length >= minLen
}

/**
 * 문자열이 지정한 최대길이 이하인지의 여부를 반환한다.
 *
 * @param maxLen -
 *						최대길이
 * @return 최대길이 이하인지의 여부
 */
String.prototype.isMax = function (maxLen) {
	return this.length <= maxLen
}

/**
 * 문자열이 지정한 최소바이트수 이상인지의 여부를 반환한다.
 *
 * @param minByte -
 *						최소바이트수
 * @return 최소바이트수 이상인지의 여부
 */
String.prototype.isMinByte = function (minByte) {
	return this.getByte() >= minByte
}

/**
 * 문자열이 지정한 최대바이트수 이하인지의 여부를 반환한다.
 *
 * @param maxByte -
 *						최대바이트수
 * @return 최대바이트수 이하인지의 여부
 */
String.prototype.isMaxByte = function (maxByte) {
	return this.getByte() <= maxByte
}

/**
 * 문자열이 영문인경우 대문자로 치환한다.
 *
 * @return 대문자로 치환된 문자열
 */
String.prototype.upper = function () {
	return this.toUpperCase()
}

/**
 * 문자열이 영문인경우 소문자로 치환한다.
 *
 * @return 소문자로 치환된 문자열
 */
String.prototype.lower = function () {
	return this.toLowerCase()
}

/**
 * 문자열 좌우 공백을 제거한다.
 *
 * @return 좌우 공백 제거된 문자열
 */
String.prototype.trim = function () {
	return this.replace(/^\s+/g, '').replace(/\s+$/g, '')
}

/**
 * 문자열 좌 공백을 제거한다.
 *
 * @return 좌 공백 제거된 문자열
 */
String.prototype.ltrim = function () {
	return this.replace(/(^\s*)/, '')
}

/**
 * 문자열 우 공백을 제거한다.
 *
 * @return 우 공백 제거된 문자열
 */
String.prototype.rtrim = function () {
	return this.replace(/(\s*$)/, '')
}

/**
 * 문자열에서 모든 교체할 문자열을 대체 문자열로 치환한다.
 *
 * @param pattnStr -
 *						찾을 문자열
 * @param chngStr -
 *						대체 문자열
 * @return 치환된 문자열
 */
String.prototype.replaceAll = function (pattnStr, chngStr) {
	var retsult = ''
	var trimStr = this.replace(/(^\s*)|(\s*$)/g, '')

	if (trimStr && pattnStr != chngStr) {
		retsult = trimStr
		while (retsult.indexOf(pattnStr) > -1) {
			retsult = retsult.replace(pattnStr, chngStr)
		}
	}
	return retsult
}

/**
 * 문자열을 거꾸로 치환한다.
 *
 * @return 거꾸로 치환된 문자열
 */
String.prototype.reverse = function () {
	var result = ''

	for (var i = this.length - 1; i > -1; i--) {
		result += this.substring(i, i + 1)
	}
	return result
}

/**
 * 지정한 길이만큼 원본 문자열 왼쪽에 패딩문자열을 채운다.
 *
 * @param len -
 *						채울 길이
 * @param padStr -
 *						채울 문자열
 * @return 채워진 문자열
 */
String.prototype.lpad = function (len, padStr) {
	var result = ''
	var loop = Number(len) - this.length
	for (var i = 0; i < loop; i++) {
		result += padStr.toString()
	}
	return result + this
}

/**
 * 지정한 길이만큼 원본 문자열 오른쪽에 패딩문자열을 채운다.
 *
 * @param len -
 *						채울 길이
 * @param padStr -
 *						채울 문자열
 * @return 채워진 문자열
 */
String.prototype.rpad = function (len, padStr) {
	var result = ''
	var loop = Number(len) - this.length
	for (var i = 0; i < loop; i++) {
		result += padStr.toString()
	}
	return this + result
}

/**
 * 문자열이 공백이나 널인지의 여부를 반환한다.
 *
 * @return 공백이나 널인지의 여부
 */
String.prototype.isBlank = function () {
	var str = this.trim()
	for (var i = 0; i < str.length; i++) {
		if (str.charAt(i) != '\t' && str.charAt(i) != '\n' && str.charAt(i) != '\r') {
			return false
		}
	}
	return true
}

/**
 * 문자열에서 대상 문자를 제거한다.
 *
 * @param str -
 *						제거할 대상문자
 * @return
 */
String.prototype.remove = function (str) {
	if (str.isBlank()) return this
	return this.replaceAll(str, '')
}

/**
 * 문자열이 영어만으로 구성되어 있는지의 여부를 반환한다.
 *
 * @param exceptChar -
 *						추가 허용할 문자
 * @return 영어만으로 구성되어 있는지의 여부
 */
String.prototype.isEng = function (exceptStr) {
	var tmpstrary = exceptStr.split('')
	var tmpstr = this
	for (var i = 0; i < tmpstrary.length; i++) {
		tmpstr = tmpstr.remove(tmpstrary[i])
	}
	return /^[a-zA-Z]+$/.test(tmpstr) ? true : false
}

/**
 * 문자열이 숫자와 영어만으로 구성되어 있는지의 여부를 반환한다.
 *
 * @param exceptChar -
 *						추가 허용할 문자
 * @return 숫자와 영어만으로 구성되어 있는지의 여부
 */
String.prototype.isEngNum = function (exceptStr) {
	var tmpstrary = exceptStr.split('')
	var tmpstr = this
	for (var i = 0; i < tmpstrary.length; i++) {
		tmpstr = tmpstr.remove(tmpstrary[i])
	}
	return /^[0-9a-zA-Z]+$/.test(tmpstr) ? true : false
}

/**
 * 문자열이 숫자인지 여부를 반환한다.
 *
 * @return 숫자인지의 여부
 */
String.prototype.isNum = function () {
	return /^[0-9]+$/.test(this) ? true : false
}

/**
 * 문자열이 한글만으로 구성되어 있는지의 여부를 반환한다.
 *
 * @param exceptChar -
 *						추가 허용할 문자
 * @return 한글만으로 구성되어 있는지의 여부
 */
String.prototype.isKor = function (exceptStr) {
	var tmpstrary = exceptStr.split('')
	var tmpstr = this
	for (var i = 0; i < tmpstrary.length; i++) {
		tmpstr = tmpstr.remove(tmpstrary[i])
	}
	return /^[가-힣]+$/.test(tmpstr) ? true : false
}

/**
 * 문자열이 숫자와 한글만으로 구성되어 있는지의 여부를 반환한다.
 *
 * @param exceptChar -
 *						추가 허용할 문자
 * @return 숫자와 한글만으로 구성되어 있는지의 여부
 */
String.prototype.isKorNum = function (exceptStr) {
	var tmpstrary = exceptStr.split('')
	var tmpstr = this
	for (var i = 0; i < tmpstrary.length; i++) {
		tmpstr = tmpstr.remove(tmpstrary[i])
	}
	return /^[0-9가-힣]+$/.test(tmpstr) ? true : false
}

/**
 * 문자열이 영문과 한글만으로 구성되어 있는지의 여부를 반환한다.
 *
 * @param exceptChar -
 *						추가 허용할 문자
 * @return 영문과 한글만으로 구성되어 있는지의 여부
 */
String.prototype.isEngKor = function (exceptChar) {
	return /^[a-zA-Z가-힣]+$/.test(this.remove(exceptChar)) ? true : false
}

/**
 * 이메일 주소의 유효성 여부를 반환한다.
 *
 * @return 유효성 여부
 */
String.prototype.isEmail = function () {
	return /\w+([-+.]\w+)*@\w+([-.]\w+)*\.[a-zA-Z]{2,4}$/.test(this.trim())
}

/**
 * 전화번호의 유효성 여부를 반환한다.
 *
 * @param dlm -
 *						구분자(default : '-')
 * @return 유효성 여부
 */
String.prototype.isPhone = function (dlm) {
	var arg = dlm != null && typeof dlm != 'undefined' && dlm.neq('') ? dlm : '-'
	return eval(
		'(/(02|0[3-9]{1}[0-9]{1})' + arg + '[1-9]{1}[0-9]{2,3}' + arg + '[0-9]{4}$/).test(this)',
	)
}

/**
 * 휴대폰번호 유효성 여부를 반환한다.
 *
 * @param dlm -
 *						구분자(default : '-')
 * @return 유효성 여부
 */
String.prototype.isMobile = function (dlm) {
	var arg = dlm != null && typeof dlm != 'undefined' && dlm.neq('') ? dlm : '-'
	return eval('(/01[016789]' + arg + '[1-9]{1}[0-9]{2,3}' + arg + '[0-9]{4}$/).test(this)')
}

/**
 * 날짜의 유효성 여부를 반환한다.
 *
 * @return 유효성 여부
 */
String.prototype.isDate = function () {
	var result = false
	if (this.length == 8 && this.isNum()) {
		var y = Number(this.substring(0, 4))
		var m = Number(this.substring(4, 6))
		var d = Number(this.substring(6, 8))
		var inDate = new Date(y, m - 1, d)
		result =
			Number(inDate.getFullYear()) == y &&
			Number(inDate.getMonth() + 1) == m &&
			Number(inDate.getDate()) == d
	}
	return result
}

/**
 * 날짜형식으로 변환
 * 예) 20210901 -> 2021-09-01
 */
String.prototype.toDateformat = function (delimiter) {
	delimiter = delimiter || '-';

	if (this.length == 8) {
		var y = this.substring(0, 4)
		var m = this.substring(4, 6)
		var d = this.substring(6, 8)
		return y + delimiter + m + delimiter + d
	}
	return ''
}

/**
 * 정해진 길이가 넘어갈 결우 말줄임처리를 한다.
 *
 * @param len - 말줄임 기준 길이
 * @return 말줄임처리된 결과
 */
String.prototype.abbreviate = function (len) {
	//	if(len <= 3){
	//		throw new Error("parameter 'len' is less than 3!!!")
	//	}
	if (this.length <= len) {
		return this
	}
	return this.substr(0, len) + '...'
}

/**
 * 파일의 확장자를 구하여 반환한다.
 *
 * @return 확장자
 */
String.prototype.ext = function () {
	return this.indexOf('.') < 0 ? '' : this.substring(this.lastIndexOf('.') + 1, this.length)
}

/**
 * 해당 클래스명이 있는지 확인
 */
HTMLElement.prototype.hasClass = function (cls) {
	var i
	var classes = this.className.replaceAll('\t', ' ').split(' ')
	for (i = 0; i < classes.length; i++) {
		if (classes[i] == cls) {
			return true
		}
	}
	return false
}

/**
 * 해당클래스명을 추가
 */
HTMLElement.prototype.addClass = function (add) {
	if (!this.hasClass(add)) {
		this.className = (this.className + ' ' + add).trim()
	}
}

/**
 * 해당클래스명을 삭제
 */
HTMLElement.prototype.removeClass = function (remove) {
	var newClassName = ''
	var i
	var classes = this.className.replace(/\s{2,}/g, ' ').split(' ')
	for (i = 0; i < classes.length; i++) {
		if (classes[i] !== remove) {
			newClassName += classes[i] + ' '
		}
	}
	this.className = newClassName.trim()
}

HTMLElement.prototype.remove = function () {
	if (this.parentNode !== null) {
		this.parentNode.removeChild(this)
	}
}

Array.prototype.removeElementByIdx = function (idx) {
	this.splice(idx, 1)
}

Array.prototype.addElementByIdx = function (idx, el) {
	this.splice(idx, 0, el)
}

Array.prototype.getElementFirstIdx = function (key, value) {
	for (var idx = 0; idx < this.length; idx++) {
		if (this[idx][key] === value) {
			return idx
		}
	}
	return null
}

Array.prototype.getElementFirst = function (key, value) {
	for (var idx = 0; idx < this.length; idx++) {
		if (this[idx][key] === value) {
			return this[idx]
		}
	}
	return null
}

Array.prototype.getMax = function (key) {
	return this.reduce(function (previous, current) {
		return previous[key] > current[key] ? previous : current
	})
}

Array.prototype.getMin = function (key) {
	return this.reduce(function (previous, current) {
		return previous[key] > current[key] ? current : previous
	})
}

Array.prototype.getElementList = function (key, value) {
	var tmprslt = []
	for (var idx = 0; idx < this.length; idx++) {
		if (this[idx][key] === value) {
			tmprslt.push(this[idx])
		}
	}
	return tmprslt
}

Array.prototype.removeElement = function (el) {
	for (var idx = this.length - 1; idx >= 0; idx--) {
		if (this[idx] === el) {
			this.splice(idx, 1)
		}
	}
}

Array.prototype.addArray = function (idx, arry) {
	for (var i = 0; i < arry.length; i++) {
		this.splice(idx + i, 0, arry[i])
	}
}

Array.prototype.setOrderNumbering = function (key) {
	for (var i = 0; i < this.length; i++) {
		eval('this[i].' + key + "= (i + 1 + '')")
	}
}

/**
 * ie에서 배열의 includes 함수가 지원이 안되는 관계로 재정의
 *
 * var arr = ['a', 'b', 'c'];
 * arr.includes('a'); // true
 * arr.includes('d'); // false
 * arr.includes('b', 1); // true
 * arr.includes('b', 2); // false
 */
Array.prototype.includes = function (searchElement, fromIndex) {
	if (this == null) {
		throw new TypeError('"this" is null or not defined')
	}

	// 1. Let O be ? ToObject(this value).
	var o = Object(this)

	// 2. Let len be ? ToLength(? Get(O, "length")).
	var len = o.length >>> 0

	// 3. If len is 0, return false.
	if (len === 0) {
		return false
	}

	// 4. Let n be ? ToInteger(fromIndex).
	// (If fromIndex is undefined, this step produces the value 0.)
	var n = fromIndex | 0

	// 5. If n ≥ 0, then
	// a. Let k be n.
	// 6. Else n < 0,
	// a. Let k be len + n.
	// b. If k < 0, let k be 0.
	var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0)

	function sameValueZero(x, y) {
		return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y))
	}

	// 7. Repeat, while k < len
	while (k < len) {
		// a. Let elementK be the result of ? Get(O, ! ToString(k)).
		// b. If SameValueZero(searchElement, elementK) is true, return true.
		if (sameValueZero(o[k], searchElement)) {
			return true
		}
		// c. Increase k by 1.
		k++
	}

	// 8. Return false
	return false
}

/**
 * 날자형식의 문자열(yyyy-mm-dd) 를 Date 오브젝트로 변환해주는 함수
 */
String.prototype.toDate = function () {
	var tmp_year = Number(this.substr(0, 4))
	var tmp_month = Number(this.substr(4, 2)) - 1
	var tmp_day = Number(this.substr(6, 2))

	return new Date(tmp_year, tmp_month, tmp_day)
}

Date.prototype.calcDate = function (i) {
	var tmp_year = this.getFullYear()
	var tmp_month = this.getMonth()
	var tmp_day = this.getDate()

	var tmp_date = new Date(tmp_year, tmp_month, tmp_day)
	return new Date(tmp_date.setDate(tmp_date.getDate() + i))
}

Date.prototype.calcMonth = function (i) {
	var tmp_year = this.getFullYear()
	var tmp_month = this.getMonth()
	var tmp_day = this.getDate()

	var tmp_date = new Date(tmp_year, tmp_month, tmp_day)
	return new Date(tmp_date.setMonth(tmp_date.getMonth() + i))
}

Date.prototype.calcYear = function (i) {
	var tmp_year = this.getFullYear()
	var tmp_month = this.getMonth()
	var tmp_day = this.getDate()

	var tmp_date = new Date(tmp_year, tmp_month, tmp_day)
	return new Date(tmp_date.setFullYear(tmp_date.getFullYear() + i))
}

/**
 * var _today = new Date(); // 예제 기준 시간 : 2000-01-01 13:12:12
 * console.log(_today.format('yyyy-MM-dd'));	=> 2000-01-01
 * console.log(_today.format('HH:mm:ss'));	=> 13:12:12
 * console.log(_today.format('yyyy-MM-dd(KS) HH:mm:ss'));	=> 2000-01-01(토) 13:12:12
 * console.log(_today.format('yyyy-MM-dd a/p hh:mm:ss'));	=> 2000-01-01 오후 01:12:12
 */
Date.prototype.format = function (f) {
	if (!this.valueOf()) return ' '

	var weekKorName = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
	var weekKorShortName = ['일', '월', '화', '수', '목', '금', '토']
	var weekEngName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
	var weekEngShortName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
	var d = this

	return f.replace(/(yyyy|yy|MM|dd|KS|KL|ES|EL|HH|hh|mm|ss|a\/p)/gi, function ($1) {
		switch ($1) {
			case 'yyyy':
				return d.getFullYear() // 년 (4자리)
			case 'yy':
				return (d.getFullYear() % 1000).zf(2) // 년 (2자리)
			case 'MM':
				return (d.getMonth() + 1).zf(2) // 월 (2자리)
			case 'dd':
				return d.getDate().zf(2) // 일 (2자리)
			case 'KS':
				return weekKorShortName[d.getDay()] // 요일 (짧은 한글)
			case 'KL':
				return weekKorName[d.getDay()] // 요일 (긴 한글)
			case 'ES':
				return weekEngShortName[d.getDay()] // 요일 (짧은 영어)
			case 'EL':
				return weekEngName[d.getDay()] // 요일 (긴 영어)
			case 'HH':
				return d.getHours().zf(2) // 시간 (24시간 기준, 2자리)
			case 'hh':
				return ((h = d.getHours() % 12) ? h : 12).zf(2) // 시간 (12시간 기준, 2자리)
			case 'mm':
				return d.getMinutes().zf(2) // 분 (2자리)
			case 'ss':
				return d.getSeconds().zf(2) // 초 (2자리)
			case 'a/p':
				return d.getHours() < 12 ? '오전' : '오후' // 오전/오후 구분
			default:
				return $1
		}
	})
}

String.prototype.string = function (len) {
	var s = '',
		i = 0
	while (i++ < len) {
		s += this
	}
	return s
}
String.prototype.zf = function (len) {
	return '0'.string(len - this.length) + this
}
Number.prototype.zf = function (len) {
	return this.toString().zf(len)
}

/**
 * IE등을 위한 startsWith Polyfill
 */
if (!String.prototype.startsWith) {
	String.prototype.startsWith = function (search, pos) {
		return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search
	}
}

/**
 * IE등을 위한 entries Polyfill
 */
if (!Object.entries) {
	Object.entries = function (obj) {
		var ownProps = Object.keys(obj),
			i = ownProps.length,
			resArray = new Array(i) // preallocate the Array
		while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]]

		return resArray
	}
}

HTMLElement.prototype.slideToggle = function (duration, callback) {
	if (this.clientHeight === 0) {
		_s(this, duration, callback, true)
	} else {
		_s(this, duration, callback)
	}
}

HTMLElement.prototype.slideUp = function (duration, callback) {
	_s(this, duration, callback)
}

HTMLElement.prototype.slideDown = function (duration, callback) {
	_s(this, duration, callback, true)
}

function _s(el, duration, callback, isDown) {
	if (typeof duration === 'undefined') duration = 400
	if (typeof isDown === 'undefined') isDown = false

	el.style.overflow = 'hidden'
	if (isDown) el.style.display = 'block'

	var elStyles = window.getComputedStyle(el)

	var elHeight = parseFloat(elStyles.getPropertyValue('height'))
	var elPaddingTop = parseFloat(elStyles.getPropertyValue('padding-top'))
	var elPaddingBottom = parseFloat(elStyles.getPropertyValue('padding-bottom'))
	var elMarginTop = parseFloat(elStyles.getPropertyValue('margin-top'))
	var elMarginBottom = parseFloat(elStyles.getPropertyValue('margin-bottom'))

	var stepHeight = elHeight / duration
	var stepPaddingTop = elPaddingTop / duration
	var stepPaddingBottom = elPaddingBottom / duration
	var stepMarginTop = elMarginTop / duration
	var stepMarginBottom = elMarginBottom / duration

	var start

	function step(timestamp) {
		if (start === undefined) start = timestamp

		var elapsed = timestamp - start

		if (isDown) {
			el.style.height = stepHeight * elapsed + 'px'
			el.style.paddingTop = stepPaddingTop * elapsed + 'px'
			el.style.paddingBottom = stepPaddingBottom * elapsed + 'px'
			el.style.marginTop = stepMarginTop * elapsed + 'px'
			el.style.marginBottom = stepMarginBottom * elapsed + 'px'
		} else {
			el.style.height = elHeight - stepHeight * elapsed + 'px'
			el.style.paddingTop = elPaddingTop - stepPaddingTop * elapsed + 'px'
			el.style.paddingBottom = elPaddingBottom - stepPaddingBottom * elapsed + 'px'
			el.style.marginTop = elMarginTop - stepMarginTop * elapsed + 'px'
			el.style.marginBottom = elMarginBottom - stepMarginBottom * elapsed + 'px'
		}

		if (elapsed >= duration) {
			el.style.height = ''
			el.style.paddingTop = ''
			el.style.paddingBottom = ''
			el.style.marginTop = ''
			el.style.marginBottom = ''
			el.style.overflow = ''
			if (!isDown) el.style.display = 'none'
			if (typeof callback === 'function') callback()
		} else {
			window.requestAnimationFrame(step)
		}
	}

	window.requestAnimationFrame(step)
}
