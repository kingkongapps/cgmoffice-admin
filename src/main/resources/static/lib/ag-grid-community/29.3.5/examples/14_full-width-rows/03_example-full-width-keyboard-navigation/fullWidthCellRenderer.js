class FullWidthCellRenderer {
  init(params) {
    this.eGui = document.createElement('div');
    this.eGui.classList.add('full-width-panel');
    this.eGui.innerHTML = `
            <button><img width="15" height="10" src="../../example-assets/flags/${params.data.code}.png"></button>
            <input value="${params.data.name}"/>
            <a href="https://www.google.com/search?q=${params.data.language}" target="_blank">${params.data.language}</a>
        `;
  }

  getGui() {
    return this.eGui;
  }

  refresh(params) {
    return false;
  }
}
