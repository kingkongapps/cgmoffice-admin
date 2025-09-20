
window.addEventListener('CMN000000_P05', () => {
	CMN000000_P05.init();
})

const CMN000000_P05 = {
	targetElId: 'CMN000000_P05',
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
		isNew: false,
		old_prdtChgYmd: null,

		// grid 설정 옵션
		gridOptions: {
			columnDefs: [  // grid 컬럼 정의
				{
					headerName: '변경일',
					valueGetter: 'data.prdtChgYmd ? moment(data.prdtChgYmd, "YYYYMMDD").format("YYYY.MM.DD") : ""',
					field: 'prdtChgYmd',
					maxWidth: 120,
				},
				{
					headerName: '항목',
					valueGetter: 'CMMN.getCmmnCdNm("CLUS_ITM_CLCD", data.clusItmClcd)',
					field: 'clusItmClcd',
					maxWidth: 120,
				},
				{ headerName: '약관항목명', field: 'nprdtNm', },
				{
					headerName: '약관항목파일',
					field: 'fileNm',
					maxWidth: 120,
				},
				{
					headerName: '보종코드',
					field: 'inskndCd',
					maxWidth: 110,
				},
			],
			defaultColDef: {  // 기본 컬럼정의
				flex: 1,  // 컬럼이동이 가능하게 한다.
				minWidth: 100,  // 각 컬럼당 최소넓이
				resizable: true,  // 컬럼사이즈 조정가능 여부
			},
		},
		// grid 에서 클릭한 row의 데이터
		gridClickedData: {},  // grid 에서 클릭한 row의 데이터
	},
	// 화면 UI 설정
	configUI: function() {
		const dataFieldChange = async (target) => {
			// const target = event.target
			const dataField = target.getAttribute('data-field');
			this.data.params[dataField] = target.value;

			if(dataField === 'mnspccCfcd'  // 변경대상이 주계약/특약구분
				|| dataField === 'clusItmClcd' // 변경대상이 약관항목분류
				|| dataField === 'cmpnyCode'  // 변경대상이 회사코드
			) {
				const mnspccCfcd = this.data.params['mnspccCfcd']; // 주계약/특약구분
				const cmpnyCode = this.data.params['cmpnyCode']; // 회사코드

				// 약관항목분류 코드
				const clusItmClcd = mnspccCfcd === '1' ? 'C'  // 주계약일 경우
									: mnspccCfcd === '2' ? 'T'  // 특약일 경우
				    				: dataField === 'mnspccCfcd' ? ''  // 변경된 field 가 주계약특약구분 인데, 기타인 경우
									: this.data.params['clusItmClcd'] || '';
				this.data.params['clusItmClcd'] = clusItmClcd;

				// 약관항목분류 입력단 화면제어
				this.setUiClusItmClcdInput(this.data.params);

				const rquSelYn = document.querySelector(`#${this.targetElId} [name='rquSelYn']`).value;

				// 표지일 경우만 '페이징하단 높이지정'입력섹터가 보이게 한다.
				// 추가적으로 표지일 경우에는 [상품구분, 필수선택여부, 판매시작일자, 판매중지(종료)일자, 보종코드(보험사)]를 보이지 않게 한다.
				if(clusItmClcd == 'M' || clusItmClcd == 'P' || clusItmClcd == 'S' || clusItmClcd == 'F') {
					if(clusItmClcd == 'M'){
						//페이징하단 높이지정
						document.querySelector(`#${this.targetElId} [data-field='pageFld']`).closest('.row').style.display = '';
					} else {
						//페이징하단 높이지정
						document.querySelector(`#${this.targetElId} [data-field='pageFld']`).closest('.row').style.display = 'none';
					}
					//상품구분
					document.querySelector(`#${this.targetElId} [data-field='prdtCfcd']`).closest('div').style.display = 'none';
					//필수선택여부
					document.querySelector(`#${this.targetElId} [data-field='rquSelYn']`).closest('div').style.display = 'none';
					//판매시작일자
					document.querySelector(`#${this.targetElId} [data-field='pmBeginYmd']`).closest('div').style.display = 'none';
					//판매중지(종료)일자
					document.querySelector(`#${this.targetElId} [data-field='pmStopYmd']`).closest('div').style.display = 'none';
					//보종코드(보험사)
					document.querySelector(`#${this.targetElId} [data-field='inskndCd']`).closest('div').style.display = 'none';
				} else {
					//페이징하단 높이지정
					document.querySelector(`#${this.targetElId} [data-field='pageFld']`).closest('.row').style.display = 'none';
					//상품구분
					document.querySelector(`#${this.targetElId} [data-field='prdtCfcd']`).closest('div').style.display = '';
					//필수선택여부
					document.querySelector(`#${this.targetElId} [data-field='rquSelYn']`).closest('div').style.display = '';
					//판매시작일자
					document.querySelector(`#${this.targetElId} [data-field='pmBeginYmd']`).closest('div').style.display = '';
					//판매중지(종료)일자
					document.querySelector(`#${this.targetElId} [data-field='pmStopYmd']`).closest('div').style.display = '';
					//보종코드(보험사)
					document.querySelector(`#${this.targetElId} [data-field='inskndCd']`).closest('div').style.display = '';

					//주계약인 경우에는 [필수선택여부] 필드 숨기기 및 [상품구분] 필드 보이기
					if(mnspccCfcd == '1'){
						//필수선택여부
						document.querySelector(`#${this.targetElId} [data-field='rquSelYn']`).closest('div').style.display = 'none';
						//상품구분
						document.querySelector(`#${this.targetElId} [data-field='prdtCfcd']`).closest('div').style.display = '';
					//특약인 경우에는 [상품구분] 필드 숨기기 및 [필수선택여부] 필드 보이기
					} else if(mnspccCfcd == '2'){
						//필수선택여부
						document.querySelector(`#${this.targetElId} [data-field='rquSelYn']`).closest('div').style.display = '';
						//상품구분
						document.querySelector(`#${this.targetElId} [data-field='prdtCfcd']`).closest('div').style.display = 'none';
					//기타인 경우에는 [필수선택여부] 필드 숨기기 및 [상품구분] 필드 숨기기
					} else if(mnspccCfcd == '3'){
						//필수선택여부
						document.querySelector(`#${this.targetElId} [data-field='rquSelYn']`).closest('div').style.display = 'none';
						//상품구분
						document.querySelector(`#${this.targetElId} [data-field='prdtCfcd']`).closest('div').style.display = 'none';

						if(clusItmClcd == 'S' || clusItmClcd == 'F') {
							//필수선택여부
							document.querySelector(`#${this.targetElId} [data-field='rquSelYn']`).closest('div').style.display = '';
							//페이징하단 높이지정
							document.querySelector(`#${this.targetElId} [data-field='pageFld']`).closest('.row').style.display = 'none';
						}
					}
				}

				if(this.data.isNew) {
					if(mnspccCfcd && cmpnyCode && clusItmClcd) {
						const prdtCdPrefix = `${cmpnyCode}${clusItmClcd}`;
						// 상품코드앞자리를 셋팅한다.
						document.querySelector(`#${this.targetElId} [name='prefixPrdtCd']`).value = prdtCdPrefix;
						const encodedPrefix = encodeURIComponent(prdtCdPrefix);
						const { data: suffixPrdtCd } = await CMMN.api.get(`/api/cnt/prdtMng/getMaxCode?rquSelYn=${rquSelYn}&prdtCdPrefix=${encodedPrefix}`);
						document.querySelector(`#${this.targetElId} [name='suffixPrdtCd']`).value = suffixPrdtCd;
					} else {
						document.querySelector(`#${this.targetElId} [name='prefixPrdtCd']`).value = '';
						document.querySelector(`#${this.targetElId} [name='suffixPrdtCd']`).value = '';
					}
				}
			}
		}

		// 각 입력단의 값이 변경될때마다 data.params 의 해당 데이터를 실시간 변경하도록 설정
		document.querySelectorAll(`#${this.targetElId} [data-field]`).forEach(el => {
			el.addEventListener('change', () => {
				dataFieldChange(el);
			})
		});
		// 상품구분 공통코드를 추출 및 dropdown 적용.
		const prdtCfcd = CMMN.getCmmnCd('PRDT_CFCD');
		document.querySelector(`#${this.targetElId} [data-field='prdtCfcd']`).innerHTML
			= prdtCfcd
				.sort((a, b) => a.cdNm.localeCompare(b.cdNm))
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.cd}">${curr.cdNm}</option>` );
				}, '<option value="">= 선택 =</option>');

		// 보험사 공통코드를 추출 및 dropdown 적용.
		const cmpnyCode = CMMN.getCmmnCd('CMPNY_CODE');
		document.querySelector(`#${this.targetElId} [data-field='cmpnyCode']`).innerHTML
			= cmpnyCode
				.sort((a, b) => a.cdNm.localeCompare(b.cdNm))
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.cd}">${curr.cdNm}</option>` );
				}, '<option value="">= 선택 =</option>');
		$(`#${this.targetElId} [data-field='cmpnyCode']`).select2({
		    theme: "bootstrap-5",
		    width: $( this ).data( 'width' ) ? $( this ).data( 'width' ) : $( this ).hasClass( 'w-100' ) ? '100%' : 'style',
		    placeholder: $( this ).data( 'placeholder' ),
			dropdownParent: $(`#${this.targetElId}`),
		})
		.on('change', () => {
			const el = document.querySelector(`#${this.targetElId} [data-field='cmpnyCode']`);
			dataFieldChange(el);
		});

		// 주특약구분코드 공통코드를 추출 및 dropdown 적용.
		const mnspccCfcd = CMMN.getCmmnCd('MNSPCC_CFCD');
		document.querySelector(`#${this.targetElId} [data-field='mnspccCfcd']`).innerHTML
			= mnspccCfcd
				.sort((a, b) => a.cd.localeCompare(b.cd))
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.cd}">${curr.cdNm}</option>` );
				}, '<option value="">= 선택 =</option>');

		// 약관항목분류 공통코드를 추출 및 dropdown 적용.
		const clusItmClcd = CMMN.getCmmnCd('CLUS_ITM_CLCD');
		document.querySelector(`#${this.targetElId} [data-field='clusItmClcd']`).innerHTML
			= clusItmClcd
				.filter(d => d.cd !== 'C' && d.cd !== 'T') // 주계약, 특약을 제외
				.sort((a, b) => a.cdNm.localeCompare(b.cdNm))
				.reduce((prev, curr) => {
					return ( prev += `<option value="${curr.cd}">${curr.cdNm}</option>` );
				}, '<option value="">= 선택 =</option>');

		// 판매시작일자
		$(`#${this.targetElId} [data-field='pmBeginYmd']`).datepicker({
			format: 'yyyy.mm.dd',      // 날짜 형식
			autoclose: true,           // 선택 시 자동 닫기
			todayHighlight: true,      // 오늘 날짜 강조
			language: 'ko',             // 한글 지원
			startDate: new Date("1000-01-01"),
			endDate: new Date("9999-12-31"),
		})
		.on("changeDate", (e) => { // 날자의 값이 변경될때마다 data.params 의 해당 데이터를 실시간 변경하도록 설정
		    const selectedDate = e.format();
		    this.data.params['pmBeginYmd'] = selectedDate.replaceAll('.','');
		});

		// 판매중지일자
		$(`#${this.targetElId} [data-field='pmStopYmd']`).datepicker({
			format: 'yyyy.mm.dd',      // 날짜 형식
			autoclose: true,           // 선택 시 자동 닫기
			todayHighlight: true,      // 오늘 날짜 강조
			language: 'ko',             // 한글 지원
			startDate: new Date("1000-01-01"),
			endDate: new Date("9999-12-31"),
		})
		.on("changeDate", (e) => { // 날자의 값이 변경될때마다 data.params 의 해당 데이터를 실시간 변경하도록 설정
		    const selectedDate = e.format();
		    this.data.params['pmStopYmd'] = selectedDate.replaceAll('.','');
		});

		// 약관정보변경일자
		$(`#${this.targetElId} [data-field='prdtChgYmd']`).datepicker({
			format: 'yyyy.mm.dd',      // 날짜 형식
			autoclose: true,           // 선택 시 자동 닫기
			todayHighlight: true,      // 오늘 날짜 강조
			language: 'ko',             // 한글 지원
			startDate: new Date("1000-01-01"),
			endDate: new Date("9999-12-31"),
		})
		.on("changeDate", (e) => { // 날자의 값이 변경될때마다 data.params 의 해당 데이터를 실시간 변경하도록 설정
		    const selectedDate = e.format();
		    this.data.params['prdtChgYmd'] = selectedDate.replaceAll('.','');
		});
	},
	// '필수선택여부' 변경시
	changeRquSelYn: async function(obj) {
		const rquSelYn = obj.value;
		const prdtCdPrefix = document.querySelector(`#${this.targetElId} [name='prefixPrdtCd']`).value;
		if(prdtCdPrefix) {
			const encodedPrefix = encodeURIComponent(prdtCdPrefix);
			const { data: suffixPrdtCd } = await CMMN.api.get(`/api/cnt/prdtMng/getMaxCode?rquSelYn=${rquSelYn}&prdtCdPrefix=${encodedPrefix}`);
			document.querySelector(`#${this.targetElId} [name='suffixPrdtCd']`).value = suffixPrdtCd;
		}
	},
	// grid 초기화
	gridInit: function() {
		// row 클릭이벤트 발생시 리스너함수를 적용.
		this.data.gridOptions.onCellClicked = this.gridOnCellClicked.bind(this);
		// grid 초기화
		new agGrid.Grid(
			document.querySelector(`#${this.targetElId} [data-field='prdInfoChgLst']`),
			this.data.gridOptions
		);
		this.data.gridOptions.api.setRowData([]);
	},
	// grid 셀 클릭 이벤트 발생
	gridOnCellClicked: function(event) {
		// 객체를 깊은복사를 진행한다.
		this.data.gridClickedData = JSON.parse(JSON.stringify(event.data));
		this.data.gridClickedData.rowIndex = event.rowIndex;

		// console.log('>>> selectedData: ', this.data.selectedData);
		this.setPopUiData(this.data.gridClickedData);
	},
	// 팝업을 연다.
	open: function(params, callbacks) {
		this.data.params = params;
		this.data.callbacks = callbacks || [];

		// 저장시 '약관정보변경일자'의 변경여부 체크 및 상품종료일자 셋팅을 위해
		this.data.old_prdtChgYmd = params.prdtChgYmd;

		// 상품코드가 존재하지 않으면 신규입력
		this.data.isNew = params.prdtCd ? false : true;

		// 약관정보변경일자'의 datepicker 시작일자를 기존의 '변경일자'로 셋팅한다.
		if(params.prdtChgYmd) {
			$(`#${this.targetElId} [data-field='prdtChgYmd']`)
				.datepicker(
					'setStartDate',
					moment(params.prdtChgYmd, "YYYYMMDD").format("YYYY.MM.DD")
				);
		}

		// 표지일 경우만 '페이징하단 높이지정'입력섹터가 보이게 한다.
		if(this.data.params.clusItmClcd == 'M') {
			this.data.params.pageFld = this.data.params.pageFld || '35'; // PDF 기본하단간격 지정
			document.querySelector(`#${this.targetElId} [data-field='pageFld']`).closest('.row').style.display = '';
		} else {
			document.querySelector(`#${this.targetElId} [data-field='pageFld']`).closest('.row').style.display = 'none';
		}

		// console.log('>>> CMN000000_P05 open params: ', this.data.params);


		if(this.data.isNew) {
			params.rquSelYn = 'N';

			// '약관정보변경일자' 는 신규등록의 경우에는 보이지 않는다.
			document.querySelector(`#${this.targetElId} [data-field='prdtChgYmd']`)
				.closest('.row')
				.style.display = 'none';
			// '약관변경이력' grid 는 신규등록의 경우에는 보이지 않는다.
			document.querySelector(`#${this.targetElId} [data-field='prdInfoChgLst']`)
				.closest('.row')
				.style.display = 'none';

			document.querySelector(`#${this.targetElId} [name='prefixPrdtCd']`)
				.style.display = '';
			document.querySelector(`#${this.targetElId} [name='suffixPrdtCd']`)
				.style.display = '';
			document.querySelector(`#${this.targetElId} [name='prdtCd']`)
				.style.display = 'none';

			document.querySelector(`#${this.targetElId} [name='title']`).innerText = '약관항목등록 - 신규등록';
			document.querySelector(`#${this.targetElId} [name='save']`).innerText = '저장';

			document.querySelector(`#${this.targetElId} [name='suffixPrdtCd']`).disabled = false;
			document.querySelector(`#${this.targetElId} [name='rquSelYn']`).disabled = false;
		} else {
			document.querySelector(`#${this.targetElId} [data-field='prdtChgYmd']`)
				.closest('.row')
				.style.display = '';
			document.querySelector(`#${this.targetElId} [data-field='prdInfoChgLst']`)
				.closest('.row')
				.style.display = '';

			document.querySelector(`#${this.targetElId} [name='prefixPrdtCd']`)
				.style.display = 'none';
			document.querySelector(`#${this.targetElId} [name='suffixPrdtCd']`)
				.style.display = 'none';
			document.querySelector(`#${this.targetElId} [name='prdtCd']`)
				.style.display = '';

			document.querySelector(`#${this.targetElId} [name='title']`).innerText = '약관항목등록 - 수정/상세';
			document.querySelector(`#${this.targetElId} [name='save']`).innerText = '수정';

			document.querySelector(`#${this.targetElId} [name='suffixPrdtCd']`).disabled = true;
			document.querySelector(`#${this.targetElId} [name='rquSelYn']`).disabled = true;
		}

		// 각 입력단의 활성/비활성화를 셋팅한다.
		this.setInputDisabled(false);

		// 팝업의 내용을 셋팅한다.
		this.setPopUiData(this.data.params);

		// 약관항목분류 입력단 화면제어
		this.setUiClusItmClcdInput(this.data.params);

		// 약관파일 삭제버튼, 다운로드버튼 표시여부 설정
		this.setFileDelDnBtn();

		// 팝업을 보여준다.
		CMMN.showModal(this.data.modal);

		if(this.data.isNew) {
			// 슈퍼관리자그룹이 아닐경우...
			if(CMMN.user.authGrpCd !== '100') {
				const comCode = CMMN.user.comCode;
				const comName = CMMN.user.comName;
				$(`#${this.targetElId} [data-field='cmpnyCode']`).val(comCode).trigger('change');
				document.querySelector(`#${this.targetElId} [data-field='cmpnyCode']`).disabled = true;
			}
		}
	},
	// 팝업의 내용을 셋팅한다.
	setPopUiData: function(data) {

		const prdtCd = data.prdtCd;
		// console.log('>>> prdtCd: ', prdtCd);
		if(prdtCd) {
			document.querySelector(`#${this.targetElId} [name='prdtCd']`).value = prdtCd;

			document.querySelector(`#${this.targetElId} [name='prefixPrdtCd']`).value = prdtCd.substring(0, 4);
			document.querySelector(`#${this.targetElId} [name='suffixPrdtCd']`).value = prdtCd.substring(4);
		} else {
			document.querySelector(`#${this.targetElId} [name='prefixPrdtCd']`).value = '';
			document.querySelector(`#${this.targetElId} [name='suffixPrdtCd']`).value = '';
			document.querySelector(`#${this.targetElId} [name='prdtCd']`).value = '';
			document.querySelector(`#${this.targetElId} [name='rquSelYn']`).value = 'Y';
		}

		document.querySelectorAll(`#${this.targetElId} [data-field]`).forEach(el => {
			const dataField = el.getAttribute('data-field');
			const dataType = el.getAttribute('data-type');

			// element의 데이터타입이 date 일경우
			if(dataType === 'date') {
				const date = data[dataField] ? moment(data[dataField], "YYYYMMDD").format("YYYY.MM.DD") : null;
				// '약관정보변경일자'의 경우는 datepicker 의 값의 setStartDate 설정도 변경해 준다.
				if(dataField === "prdtChgYmd") {
					$(el).datepicker('setStartDate', date);
				}
				$(el).datepicker('setDate', date);
			}
			// element의 데이터타입이 grid 일경우
			else if(dataType === 'grid') {
				const value = data[dataField];
				if(value) {
					this.data.gridOptions.api.setRowData(value);
				}
			}
			// element의 필드명이 '약관항목분류'의 경우
			else if(dataField === 'clusItmClcd') {
				const prdtCd = data['prdtCd'];
				if(prdtCd) {
					// 상품코드에서 '약관항목분류'를 추출한다.
					const clusItmClcd = prdtCd
											.substring(prdtCd.length - 5)
											.substring(0, 1)
											;
					data[dataField] = clusItmClcd;
					if( clusItmClcd !== 'C'  // 주계약이 아닐경우
							&& clusItmClcd !== 'T' // 특약이 아닐경우
					) {
						el.value = clusItmClcd;
					} else {
						el.value = '';
					}
				}
			}
			// element의 필드명이 '회사코드일'의 경우
			else if(dataField === 'cmpnyCode') {
				$(el).val(data[dataField]).trigger('change');
			}
			else {
				el.value = data[dataField] || '';
			}
		});

		const saveEl = document.querySelector(`#${this.targetElId} [name='save']`);
		if(data.rowIndex && data.rowIndex != 0) {
			saveEl.style .display = 'none';
			this.setInputDisabled(true);
		} else {
			saveEl.style .display = '';
			this.setInputDisabled(false);
		}
	},
	// 약관항목분류 입력단 화면제어
	setUiClusItmClcdInput: function(params) {

		const clusItmClcd = params.clusItmClcd;
		const mnspccCfcd = params.mnspccCfcd;

		if(!mnspccCfcd || mnspccCfcd == '1' || mnspccCfcd == '2') {
			document.querySelector(`#${this.targetElId} [data-field='clusItmClcd']`).value = '';
			document.querySelector(`#${this.targetElId} [data-field='clusItmClcd']`)
				.closest('div')
				.style
				.display = 'none';
			/*
			document.querySelector(`#${this.targetElId} [name='nprdtNmLabel']`).innerText
				= `${
						mnspccCfcd == '1' ? '주계약'
						: mnspccCfcd == '2' ?'특약'
						: ''
					}상품명`;
			*/

			// 주계약
			if(mnspccCfcd == '1'){
				//주계약 일 때, 필수선택여부 항목 숨기기
				document.querySelector(`#${this.targetElId} [data-field='rquSelYn']`).value = 'N';
				document.querySelector(`#${this.targetElId} [data-field='rquSelYn']`)
					.closest('div')
					.style
					.display = 'none';
				//주계약 일 때, 상품구분 항목 보이기
				document.querySelector(`#${this.targetElId} [data-field='prdtCfcd']`)
					.closest('div')
					.style
					.display = '';
			// 특약
			} else if (mnspccCfcd == '2'){
				//특약 일 때, 필수선택여부 항목 보이기
				document.querySelector(`#${this.targetElId} [data-field='rquSelYn']`)
					.closest('div')
					.style
					.display = '';
				//특약 일 때, 상품구분 항목 숨기기
				document.querySelector(`#${this.targetElId} [data-field='prdtCfcd']`)
					.closest('div')
					.style
					.display = 'none';
			}
		} else {
			document.querySelector(`#${this.targetElId} [data-field='clusItmClcd']`)
				.closest('div')
				.style
				.display = '';
			/*
			document.querySelector(`#${this.targetElId} [name='nprdtNmLabel']`).innerText = '기타약관명';
			*/
			//기타 일 때, 필수선택여부 항목 보이기
			document.querySelector(`#${this.targetElId} [data-field='rquSelYn']`).value = 'N';
			document.querySelector(`#${this.targetElId} [data-field='rquSelYn']`)
				.closest('div')
				.style
				.display = '';

			if(clusItmClcd == 'M' || clusItmClcd == 'P' || clusItmClcd == 'S' || clusItmClcd == 'F') {
				//기타 일 때, 약관항목분류가 표지나 목차인경우 상품구분 항목 숨기기
				document.querySelector(`#${this.targetElId} [data-field='prdtCfcd']`)
					.closest('div')
					.style
					.display = 'none';
				//필수선택여부 항목 숨기기
				document.querySelector(`#${this.targetElId} [data-field='rquSelYn']`).value = 'N';
				document.querySelector(`#${this.targetElId} [data-field='rquSelYn']`)
					.closest('div')
					.style
					.display = 'none';
			} else {
				//기타 일 때, 상품구분 항목 숨기기
				document.querySelector(`#${this.targetElId} [data-field='prdtCfcd']`)
					.closest('div')
					.style
					.display = 'none';
			}
		}
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
			document.querySelector(`#${this.targetElId} [data-field='rquSelYn']`)
				.disabled = this.data.isNew ? false : true;
			document.querySelector(`#${this.targetElId} [data-field='cmpnyCode']`)
				.disabled = this.data.isNew ? false : true;
			document.querySelector(`#${this.targetElId} [data-field='pmBeginYmd']`)
				.disabled = this.data.isNew ? false : true;
			document.querySelector(`#${this.targetElId} [data-field='mnspccCfcd']`)
				.disabled = this.data.isNew ? false : true;
			document.querySelector(`#${this.targetElId} [data-field='clusItmClcd']`)
				.disabled = this.data.isNew ? false : true;
			document.querySelector(`#${this.targetElId} [name='suffixPrdtCd']`)
				.disabled = this.data.isNew ? false : true;
		}
		// 약관파일란은 무조건 disabled;
		document.querySelector(`#${this.targetElId} [data-field='fileNm']`)
			.disabled = true;

	},
	// 약관파일 삭제버튼, 다운로드버튼 표시여부 설정
	setFileDelDnBtn: function() {
		const delFileBtn = document.querySelector(`#${this.targetElId} [name='delFileBtn']`);
		const dnFileBtn = document.querySelector(`#${this.targetElId} [name='dnFileBtn']`);
		if(this.data.params.fileNo) {
			delFileBtn.style.display = '';
			dnFileBtn.style.display = '';
		} else {
			delFileBtn.style.display = 'none';
			dnFileBtn.style.display = 'none';
		}
	},
	close: function() {
		CMMN.hideModal(this.data.modal);
	},
	save: async function() {

		if(!this.data.params.nprdtNm) {
			await CMMN.alert('상품명은 필수입니다.');
			document.querySelector(`#${this.targetElId} [data-field='nprdtNm']`).focus();
			return;
		}
		if(!this.data.params.cmpnyCode) {
			await CMMN.alert('회사코드는 필수입니다.');
			document.querySelector(`#${this.targetElId} [data-field='cmpnyCode']`).focus();
			return;
		}
		if(!this.data.params.mnspccCfcd) {
			await CMMN.alert('주계약특약구분은 필수입니다.');
			document.querySelector(`#${this.targetElId} [data-field='mnspccCfcd']`).focus();
			return;
		}
		if(this.data.params.mnspccCfcd == '3' && !this.data.params.clusItmClcd) {
			await CMMN.alert('약관항목분류는 필수입니다.');
			document.querySelector(`#${this.targetElId} [data-field='clusItmClcd']`).focus();
			return;
		}
		if(!this.data.params.prdtCfcd && document.querySelector(`#${this.targetElId} [data-field='prdtCfcd']`).closest('div').style.display == "") {
			await CMMN.alert('상품구분은 필수입니다.');
			document.querySelector(`#${this.targetElId} [data-field='prdtCfcd']`).focus();
			return;
		}

		// 상품코드 앞자리 입력란
		const el_prefixPrdtCd = document.querySelector(`#${this.targetElId} [name='prefixPrdtCd']`);

		// 상품코드 뒷자리 입력란
		const el_suffixPrdtCd = document.querySelector(`#${this.targetElId} [name='suffixPrdtCd']`);

		const rquSelYn = document.querySelector(`#${this.targetElId} [name='rquSelYn']`).value;

		if(el_suffixPrdtCd.value.length !== 4) {
			await CMMN.alert('상품코드 뒷자리(숫자 4자리)를 입력해주세요.');
			el_suffixPrdtCd.focus();
			return;
		}

		//상품약관코드 채번규칙에 의해서 [필수(종속)]인데 9000번대 채번이 아닌 경우 (9001번 부터 9999번 까지)
		if(rquSelYn == "Y" && el_suffixPrdtCd.value <= 9000) {
			await CMMN.alert('[필수(종속)]상품인 경우 상품약관코드 채번은 9000번 대로 입력하셔야 합니다.');
			el_suffixPrdtCd.focus();
			return;
		}

		//상품약관코드 채번규칙에 의해서 [선택(독립)]인데 0~8000번대 채번이 아닌 경우 (1번 부터 8999번 까지)
		if(rquSelYn == "N" && !(el_suffixPrdtCd.value >= 1 && el_suffixPrdtCd.value <= 8999)) {
			await CMMN.alert('[선택(독립)]상품인 경우 상품약관코드 채번은 0~8000번 대로 입력하셔야 합니다.');
			el_suffixPrdtCd.focus();
			return;
		}

		this.data.params.prdtCd = `${el_prefixPrdtCd.value}${el_suffixPrdtCd.value}`;
		if(!this.data.params.pmBeginYmd && document.querySelector(`#${this.targetElId} [data-field='pmBeginYmd']`).closest('div').style.display == "") {
			await CMMN.alert('판매시작일자는 필수입니다.');
			document.querySelector(`#${this.targetElId} [data-field='pmBeginYmd']`).focus();
			return;
		}
		// 신규등록이 아니면서, '약관정보변경일자'를 입력하지 않은경우.
		if(!this.data.isNew && !this.data.params.prdtChgYmd && document.querySelector(`#${this.targetElId} [data-field='prdtChgYmd']`).closest('div').style.display == "") {
			await CMMN.alert('약관정보변경일자는 필수입니다.');
			document.querySelector(`#${this.targetElId} [data-field='prdtChgYmd']`).focus();
			return;
		}

		this.data.params.newYn = this.data.isNew ? 'Y' : 'N';

		// 신규등록이 아니면서, '약관정보변경일자'의 변경이 일어난 경우 변경이력을 추가하도록 한다.
		if(!this.data.isNew
			&& this.data.old_prdtChgYmd !== this.data.params.prdtChgYmd
		) {
			this.data.params.addChangLogYn = 'Y'; // 변경이력 추가여부
		} else {
			this.data.params.addChangLogYn = 'N'; // 변경이력 추가여부
		}

		// 신규입력의 경우...
		if(this.data.isNew){
			// '약관정보변경일자'는 '판매개시일자'로 셋팅한다.
			this.data.params.prdtChgYmd = this.data.params.pmBeginYmd.split(".").join("");
			// '약관정보종료일자'는 '99991231'로 입력한다.
			this.data.params.prdtEndYmd = '99991231';
		} else {
			// '판매중지(종료일자)'의 "."오류로 "." 제거
			this.data.params.pmStopYmd = this.data.params.pmStopYmd.split(".").join("");
			// '약관정보변경일자'의 "."오류로 "." 제거
			this.data.params.prdtChgYmd = this.data.params.prdtChgYmd.split(".").join("");
			// '약관정보종료일자' 셋팅 ["."오류로 "." 제거 로직 추가]
			this.data.params.prdtEndYmd = this.data.old_prdtChgYmd.split(".").join("");
		}

		const params = this.data.params;
		// console.log('>>> params: ', params);

		// 만약 신규등록의 경우 신규로 입력한 코드가 이미 존재하는지를 먼저 파악한다.
		if(this.data.isNew){
			const { data: cnt } = await CMMN.api.post('/api/cnt/prdtMng/chkExist', { params });
			// console.log('>>> cnt: ', cnt);
			if(cnt >= 1) {
				CMMN.alert('입력하신 상품코드는 이미 존재합니다.');
				return;
			}
		}

		const confirmMsg = `입력한 내용을 ${this.data.isNew ? '등록' : '수정'} 하시겠습니까?`;
		if(!await CMMN.confirm(confirmMsg)) {
			return;
		}
		await CMMN.api.post('/api/cnt/prdtMng/saveInfo', { params });

		this.close();  // 팝업을 닫는다.

		if(this.data.callbacks[0]) {
			this.data.callbacks[0]();
		}
	},
	// 약관파일선택 공통팝업 열기
	CMN_P02_open: function() {
		CMN000000_P02.open(
			{},
			[ this.CMN_P02_callback.bind(this) ]
		)
	},
	CMN_P02_callback: function(params) {
		// console.log('>>> CMN_P02_callback params: ', params);
		this.data.params.fileNo = params.fileNo;
		this.data.params.fileNm = params.fileNm;
		document.querySelector(`#${this.targetElId} [data-field='fileNo']`).value = params.fileNo;
		document.querySelector(`#${this.targetElId} [data-field='fileNm']`).value = params.fileNm;

		// 약관파일 삭제버튼, 다운로드버튼 표시여부 설정
		this.setFileDelDnBtn();
	},
	upPdf: async function() {
		const el_pdfFile = document.querySelector(`#${this.targetElId} [name='pdf-file']`);
		const pdfUpFiles = el_pdfFile.files;
		if (pdfUpFiles.length == 0) return;

		if(!await CMMN.confirm('파일을 업로드 하시겠습니까?')) {
			return;
		}

		const params = { pdfUpFiles };
		const { data: dataList } = await CMMN.api.post('/api/cnt/prdtClusPdfMng/upPdf', { params });
		el_pdfFile.value = '';  // pdf파일 첨부input 을 초기화 한다.

		const data = dataList[0];
		this.data.params.fileNo = data.fileNo;
		this.data.params.fileNm = data.fileNm;
		document.querySelector(`#${this.targetElId} [data-field='fileNo']`).value = data.fileNo;
		document.querySelector(`#${this.targetElId} [data-field='fileNm']`).value = data.fileNm;

		// 약관파일 삭제버튼, 다운로드버튼 표시여부 설정
		this.setFileDelDnBtn();
	},
	delPdf: function() {
		this.data.params.fileNo = '';
		this.data.params.fileNm = '';
		document.querySelector(`#${this.targetElId} [data-field='fileNo']`).value = '';
		document.querySelector(`#${this.targetElId} [data-field='fileNm']`).value = '';

		// 약관파일 삭제버튼, 다운로드버튼 표시여부 설정
		this.setFileDelDnBtn();
	},
	dnPdf: function() {
		CMMN.downloadfilePost(this.data.params.fileNo);
	},
}