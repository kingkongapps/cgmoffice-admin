/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  defaultColDef: {
    width: 80,
    sortable: true,
    filter: true,
    resizable: true,
  },
  rowSelection: 'multiple',
  suppressRowClickSelection: true,
  rowClassRules: {
    'red-row': 'data.color == "Red"',
    'green-row': 'data.color == "Green"',
    'blue-row': 'data.color == "Blue"',
  },
  rowData: getData(),
  rowDragManaged: true,
  columnDefs: [
    {
      valueGetter: "'Drag'",
      dndSource: true,
      dndSourceOnRowDrag: onRowDrag,
      checkboxSelection: true,
    },
    { field: 'id' },
    { field: 'color' },
    { field: 'value1' },
    { field: 'value2' },
  ],
  animateRows: true,
};

function onDragOver(event) {
  var dragSupported = event.dataTransfer.types.length;

  if (dragSupported) {
    event.dataTransfer.dropEffect = 'move';
  }

  event.preventDefault();
}

function onDrop(event) {
  event.preventDefault();
  var jsonData = event.dataTransfer.getData('application/json');

  var eJsonRow = document.createElement('div');
  eJsonRow.classList.add('json-row');
  eJsonRow.innerText = jsonData;

  var eJsonDisplay = document.querySelector('#eJsonDisplay');
  eJsonDisplay.appendChild(eJsonRow);
}

function onRowDrag(params) {
  // create the data that we want to drag
  var rowNode = params.rowNode;
  var e = params.dragEvent;
  var jsonObject = {
    grid: 'GRID_001',
    operation: 'Drag on Column',
    rowId: rowNode.data.id,
    selected: rowNode.isSelected(),
  };
  var jsonData = JSON.stringify(jsonObject);

  e.dataTransfer.setData('application/json', jsonData);
  e.dataTransfer.setData('text/plain', jsonData);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
});
