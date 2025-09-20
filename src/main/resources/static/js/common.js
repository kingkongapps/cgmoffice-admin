
const INDEX_PAGE = {
	init: async function() {

		// 사용자정보를 셋팅한다.
		await CMMN.setUser();

		// 모든 공통코드를 셋팅한다.
		const response = await CMMN.api.get('/api/common/code/cmmnCdAll');
		CMMN.CMMN_CD = response.data;

		const el_cmmnUserNm = document.getElementById("cmmnUserNm");
		if(el_cmmnUserNm) {
			el_cmmnUserNm.innerText = CMMN.user.memNm;
		}

		// sidebar 셋팅
		COMMON_SIDEBAR.setSideMenu();

		// 공통용팝업 추가
		CMMN.include("CMN000000_P01"); // 이미지파일 미리보기용 공통팝업
		CMMN.include("CMN000000_P02"); // 약관파일선택 공통팝업
		CMMN.include("CMN000000_P03"); // 약관파일선택 상세보기 공통팝업
		CMMN.include("CMN000000_P04"); // 주계약검색 공통팝업
		CMMN.include("CMN000000_P05"); // 상품상세수정 공통팝업
		CMMN.include("CMN000000_P06"); // PDF보기 공통팝업
		// CMMN.include("CMN000000_P07"); // PDF비교 공통팝업

		const currPageCode = CMMN.sessionStorage.getItem('currPageCode');
		if(currPageCode) {
			CMMN.goTo(currPageCode);
			CMMN.sessionStorage.removeItem('currPageCode');
		} else {
			CMMN.goTo(CMMN.mainPageCode);
		}
	}
}


const COMMON_SIDEBAR = {
	setSideMenu: function() {
		this.renderMenu();
		this.setMenuToggle();
	},
	renderMenu: function() {
		// 브라우져 주소창 url의 마지막 '/' 뒤의 경로를 가지고 온다.
		const fullPath = window.location.pathname;
		const lastUriSegment = fullPath.substring(fullPath.lastIndexOf('/') + 1);

		const menuData = CMMN.user.menuList;

		document.getElementById("sideMenuDiv").innerHTML = menuData
			.filter(d => Number(d.menuLev) == 1)
			.sort((a, b) => a.sortNo - b.sortNo)
			.reduce((prev01, curr01) => {
				return prev01 += `
					${
						curr01.menuTypCd === "M" // 타입이 메뉴일 경우.
						? `
						<a
							class="nav-link ${ lastUriSegment === curr01.menuCd ? 'active' : '' }"
							style="cursor: pointer;"
							href="javascript:void(0)"
							data-munulev="1"
							data-munulev01cd="${ curr01.menuCd }"
							onclick="CMMN.goTo('${ curr01.menuCd }_M01')"
						>

							<span>
		                    	&nbsp;&nbsp;&nbsp;&nbsp; ${ curr01.menuNm }
							</span>
		                </a>
						`
						: `
						<div
							class="sb-sidenav-menu-heading"
							style="font-size: var(--bs-nav-link-font-size);"
						>

							<span>
								${ curr01.menuNm }
							</span>
						</div>
						${
							menuData
							.filter(d => Number(d.menuLev) == 2 && d.upprMenuCd == curr01.menuCd)
							.sort((a, b) => a.sortNo - b.sortNo)
							.reduce((prev02, curr02) => {
								return prev02 += `
									${
										curr02.menuTypCd === "M" // 타입이 메뉴일 경우.
										? `
										<a
											class="nav-link"
											style="cursor: pointer;"
											href="javascript:void(0)"
											onclick="CMMN.goTo('${ curr02.menuCd }_M01')"
											data-munulev="2"
											data-munulev01cd="${ curr01.menuCd }"
											data-munulev02cd="${ curr02.menuCd }"
										>
										    &nbsp;&nbsp;&nbsp;&nbsp; ${ curr02.menuNm }
										</a>
										`
										: `
										<a
											class="nav-link collapsed"
											style="cursor: pointer;"
											href="javascript:void(0)"
											data-bs-toggle="collapse"
											data-bs-target="#collapse_${ curr02.menuCd }"
											aria-expanded="false"
											aria-controls="collapseLayouts"
											data-munulev="2"
											data-munulev01cd="${ curr01.menuCd }"
											data-munulev02cd="${ curr02.menuCd }"
										>
										    &nbsp;&nbsp;&nbsp;&nbsp; ${ curr02.menuNm }
										    <div class="sb-sidenav-collapse-arrow"><i class="fas fa-angle-down"></i></div>
										</a>
										<div
											class="collapse nav-collapse"
											id="collapse_${ curr02.menuCd }"
											aria-labelledby="headingOne"
											data-bs-parent="#sidenavAccordion"
										>
											<nav class="sb-sidenav-menu-nested nav">
											${
												menuData
												.filter(d => Number(d.menuLev) == 3 && d.upprMenuCd == curr02.menuCd)
												.sort((a, b) => a.sortNo - b.sortNo)
												.reduce((prev03, curr03) => {
													return prev03 += `
													<a
														class="nav-link"
														href="javascript:void(0)"
														style="cursor: pointer;"
														onclick="CMMN.goTo('${ curr03.menuCd }_M01')"
														data-munulev="3"
														data-munulev01cd="${ curr01.menuCd }"
														data-munulev02cd="${ curr02.menuCd }"
														data-munulev03cd="${ curr03.menuCd }"
													>
														 &nbsp;&nbsp;&nbsp;&nbsp; ${ curr03.menuNm }
													</a>
													`;
												}, '')
											}
											</nav>
										</div>
										`
									}
								`;
								//-----------------------------
							}, '')
						}
						`
					}
				`;
			}, "");
	},
	setMenuToggle: function() {
		// sidebar 메뉴가 좁은 상태에서 바닥이 dim 되어있는 상태일 경우, 바닥을 클릭하면 sidebar 메뉴를 닫도록 구현
		document.getElementById('layoutSidenav_content').addEventListener('click', () => {
			this.close();
		});

		// Toggle the side navigation
		const sidebarToggle = document.body.querySelector('#sidebarToggle');
		if (sidebarToggle) {
		    // Uncomment Below to persist sidebar toggle between refreshes
		    // if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
		    //     document.body.classList.toggle('sb-sidenav-toggled');
		    // }
		    sidebarToggle.addEventListener('click', event => {
		        event.preventDefault();
		        document.body.classList.toggle('sb-sidenav-toggled');
		        localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
		    });
		}
	},
	close: function() {
		const el = document.querySelector('#layoutSidenav_content');
		const beforeStyle = window.getComputedStyle(el, '::before');
		const sbSidenavToggled = document.body.classList.contains('sb-sidenav-toggled');
		if(sbSidenavToggled && beforeStyle.display === "block") {
			document.body.querySelector('#sidebarToggle').click();
		}
	},
}