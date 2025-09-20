window.addEventListener('FLE001002_M01', () => {
	FLE001002_M01.init();
})

const FLE001002_M01 = {
	targetElId: 'FLE001002_M01',
	init: function() {
		console.log(`>>> ${this.targetElId}`);

		// 화면 UI 설정
		this.configUI();
	},
	data: {

	},
	// 화면 UI 설정
	configUI: function() {
		// tag UI 별 권한제어  (I:insert, S:select, U:update, D:delete, E:excel)
		CMMN.setAuthBtn(this.targetElId)
	},
	// pdf 비교하기 전에 width 값을 미리 세팅
	resetWidth: function() {
		const container01Width = document.querySelector(`#${this.targetElId} [name='pdfContainer01']`).clientWidth;
		const container02Width = document.querySelector(`#${this.targetElId} [name='pdfContainer02']`).clientWidth;

		// 공통 기준 width를 더 작은 쪽으로 통일
		const commonWidth = Math.min(container01Width, container02Width);

		this.data.container01Width = commonWidth;
		this.data.container02Width = commonWidth;
	},
	setFile01: async function() {
		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

		this.cleanPdfResult();

		const el_pdfFile01 = document.querySelector(`#${this.targetElId} [name='pdf-file01']`);
		this.data.pdf1 = el_pdfFile01.files[0];
		if (!this.data.pdf1) {
			document.querySelector(`#${this.targetElId} [name='fileNm01']`).value = '';
			return;
		}

		const fileNm = this.data.pdf1.name;
		const ext = fileNm.toLowerCase().substring(fileNm.lastIndexOf('.') + 1, fileNm.length)
		if(ext !== 'pdf') {
			await CMMN.alert('PDF파일만 선택이 가능합니다.');
			return;
		}

		document.querySelector(`#${this.targetElId} [name='fileNm01']`).value = fileNm;
	},
	setFile02: async function() {
		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

		this.cleanPdfResult();

		const el_pdfFile02 = document.querySelector(`#${this.targetElId} [name='pdf-file02']`);
		this.data.pdf2 = el_pdfFile02.files[0];
		if (!this.data.pdf2) {
			document.querySelector(`#${this.targetElId} [name='fileNm02']`).value = '';
			return;
		}

		const fileNm = this.data.pdf2.name;
		const ext = fileNm.toLowerCase().substring(fileNm.lastIndexOf('.') + 1, fileNm.length)
		if(ext !== 'pdf') {
			await CMMN.alert('PDF파일만 선택이 가능합니다.');
			return;
		}

		document.querySelector(`#${this.targetElId} [name='fileNm02']`).value = fileNm;
	},
	cleanPdfResult: function() {
		document.querySelector(`#${this.targetElId} [name='pdfContainer01']`).innerHTML = '';
		document.querySelector(`#${this.targetElId} [name='pdfContainer02']`).innerHTML = '';
		document.querySelector(`#${this.targetElId} [name='pdfContainerDiff']`).innerHTML = '';
	},
	// pdf파일을 비교해서 보여준다.
	comparePDFs: async function() {
		// 함수별 권한제어 (I:insert, S:select, U:update, D:delete, E:excel)
		if(CMMN.chkAuthBtn(this.targetElId, "S")) return;

		if(!this.data.pdf1 || !this.data.pdf2) {
			await CMMN.alert('비교할파일 두개를 선택해 주세요.');
			return;
		}

		try{
			this.cleanPdfResult();
			this.resetWidth();

			CMMN.loadingbar(true);

			const container01 = document.querySelector(`#${this.targetElId} [name='pdfContainer01']`);
			const container02 = document.querySelector(`#${this.targetElId} [name='pdfContainer02']`);
			const containerDiff = document.querySelector(`#${this.targetElId} [name='pdfContainerDiff']`);

			await this.renderPdfToCanvas(this.data.pdf1, container01, this.data.container01Width);
			await this.renderPdfToCanvas(this.data.pdf2, container02, this.data.container02Width);

			const container01_canvas_list = [...container01.querySelectorAll('canvas')];
			const container02_canvas_list = [...container02.querySelectorAll('canvas')];

			const size01 = container01_canvas_list.length;
			const size02 = container02_canvas_list.length;

			//비교하고자 하는 두 PDF 파일에 1번째 파일의 분량이 2번째 파일 분량보다 많을 경우 그 다음에 대해서는 canvas_list 값이 NULL로 오류 발생하여 수정
			const diffSize = size01 <= size02 ? size01 : size02;

			for (let i = 0; i < diffSize; i++) {
				const canvas1 = container01_canvas_list[i];
				const canvas2 = container02_canvas_list[i];

				// 기준 width/height (큰 쪽 기준 확대 방식)
				const targetWidth = Math.max(canvas1.width, canvas2.width);
				const targetHeight = Math.max(canvas1.height, canvas2.height);

				// 보정된 canvas1
				const fixedCanvas1 = document.createElement("canvas");
				fixedCanvas1.width = targetWidth;
				fixedCanvas1.height = targetHeight;
				fixedCanvas1.getContext("2d").drawImage(canvas1, 0, 0);

				// 보정된 canvas2
				const fixedCanvas2 = document.createElement("canvas");
				fixedCanvas2.width = targetWidth;
				fixedCanvas2.height = targetHeight;
				fixedCanvas2.getContext("2d").drawImage(canvas2, 0, 0);

				const imgData1 = this.getImageData(fixedCanvas1);
				const imgData2 = this.getImageData(fixedCanvas2);

				const diffCanvas = document.createElement("canvas");
				diffCanvas.width = targetWidth;
				diffCanvas.height = targetHeight;

				this.highlightDifferences(imgData1, imgData2, diffCanvas);

				// 표시 사이즈 조절 (window 화면 배율에 맞게)
				diffCanvas.style.width = this.data.width;
				diffCanvas.style.height = this.data.height;

				containerDiff.appendChild(diffCanvas);
			}
		} catch(error) {
			console.error(error);
		}
		CMMN.loadingbar(false);
	},
	// container 에 pdffile 의 모든 페이지를 canvas 로 변환해서 표시한다.
	renderPdfToCanvas: async function(pdffile, container, width) {
		const arrayBuffer = await pdffile.arrayBuffer();
		const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, disableFontFace: true, useSystemFonts: true, isEvalSupported : false }).promise;

		for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
			const page = await pdf.getPage(pageNumber);

			// 기본 viewport로 크기 계산
			const unscaledViewport = page.getViewport({ scale: 1 });
			const realScale = width / unscaledViewport.width;
			//const viewport = page.getViewport({ scale });
			//console.log("realScale : " + realScale);
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			//const DPI = 150;
			//const scale = DPI / 72.0;  // PDF 기본은 72DPI
			const scale = realScale * 1; // 실제 해상도 렌더링 확대
			const viewport = page.getViewport({ scale });

			canvas.width = viewport.width;
			canvas.height = viewport.height;

			// 필터 적용
			ctx.imageSmoothingEnabled = false; // 부드럽게 처리하지 않음 (픽셀 기준 차이 감소)
			//ctx.filter = "blur(0.5px)";

			// 실제 PDF 렌더링
			await page.render({
				canvasContext: ctx,
				viewport: viewport
			}).promise;

			// 화면에도 동일하게
			canvas.style.width = Math.trunc(width) + "px";
			canvas.style.height = Math.trunc(viewport.height / viewport.width * width) + "px";

			this.data.width = canvas.style.width;
			this.data.height = canvas.style.height;

			container.appendChild(canvas);
		}
	},
	// canvas 에서 이미지데이터를 추출한다.
	getImageData: function(canvas) {
		const ctx = canvas.getContext("2d");
		ctx.imageSmoothingEnabled = false; // 안티앨리어싱 제거
		return ctx.getImageData(0, 0, canvas.width, canvas.height);
	},
	// outputCanvas 에 이미지차이를 표시해서 나타낸다.
	highlightDifferences: function(img1, img2, outputCanvas, diffColor = { r: 255, g: 0, b: 0 }, threshold = 50) {
		const ctx = outputCanvas.getContext("2d");
		const width = img1.width;
		const height = img1.height;
		const output = ctx.createImageData(width, height);

		const length = Math.min(img1.data.length, img2.data.length);
		//const diffDataSize = pixelCount * 4;
		let cnt = 0;
		for (let i = 0; i < length; i += 4) {
			const r1 = img1.data[i],     r2 = img2.data[i];
			const g1 = img1.data[i + 1], g2 = img2.data[i + 1];
			const b1 = img1.data[i + 2], b2 = img2.data[i + 2];

			const isDifferent =
				Math.abs(r1 - r2) > threshold ||
				Math.abs(g1 - g2) > threshold ||
				Math.abs(b1 - b2) > threshold;

			if (isDifferent) {
				output.data[i]     = diffColor.r;
				output.data[i + 1] = diffColor.g;
				output.data[i + 2] = diffColor.b;
				output.data[i + 3] = 255;
				cnt++;
			} else {
				output.data[i]     = img1.data[i];
				output.data[i + 1] = img1.data[i + 1];
				output.data[i + 2] = img1.data[i + 2];
				output.data[i + 3] = img1.data[i + 3];
			}
		}
		console.log("차이 픽셀 수 : " + cnt);
		ctx.putImageData(output, 0, 0);
	},
}