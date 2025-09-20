class MoodRenderer {
  init(params) {
    this.eGui = document.createElement('span');
    if (params.value !== '' || params.value !== undefined) {
      const imgForMood =
        params.value === 'Happy'
          ? '../../example-assets/smileys/happy.png'
          : '../../example-assets/smileys/sad.png';
      this.eGui.innerHTML = `<img width="20px" src="${imgForMood}" />`;
    }
  }

  getGui() {
    return this.eGui;
  }

  refresh(params) {
    return false;
  }
}
