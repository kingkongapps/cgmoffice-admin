var rowClassRules = {
  'red-row': 'data.color == "Red"',
  'green-row': 'data.color == "Green"',
  'blue-row': 'data.color == "Blue"',
};

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  defaultColDef: {
    width: 80,
    sortable: true,
    filter: true,
    resizable: true,
  },
  rowClassRules: rowClassRules,
  rowData: getData(),
  rowDragManaged: true,
  columnDefs: [
    { cellRenderer: DragSourceRenderer, minWidth: 100 },
    { field: 'id' },
    { field: 'color' },
    { field: 'value1' },
    { field: 'value2' },
  ],
  animateRows: true,
};

function onDragOver(event) {
  var types = event.dataTransfer.types;

  var dragSupported = types.length;

  if (dragSupported) {
    event.dataTransfer.dropEffect = 'move';
  }

  event.preventDefault();
}

function onDrop(event) {
  event.preventDefault();

  var textData = event.dataTransfer.getData('text/plain');
  var eJsonRow = document.createElement('div');
  eJsonRow.classList.add('json-row');
  eJsonRow.innerText = textData;

  var eJsonDisplay = document.querySelector('#eJsonDisplay');
  eJsonDisplay.appendChild(eJsonRow);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
});
