class GenderRenderer {
  init(params) {
    this.eGui = document.createElement('span');
    var img = params.value === 'male' ? 'male.png' : 'female.png';
    this.eGui.innerHTML = `<img src="../../example-assets/genders/${img}"/> ${params.value}`;
  }

  getGui() {
    return this.eGui;
  }

  refresh(params) {
    return false;
  }
}
