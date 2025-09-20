function setStyle(element, propertyObject) {
  for (var property in propertyObject) {
    element.style[property] = propertyObject[property];
  }
}
class CustomPinnedRowRenderer {
  init(params) {
    this.eGui = document.createElement('div');
    setStyle(this.eGui, params.style);
    this.eGui.innerHTML = params.value;
  }

  getGui() {
    return this.eGui;
  }

  refresh() {
    return false;
  }
}
