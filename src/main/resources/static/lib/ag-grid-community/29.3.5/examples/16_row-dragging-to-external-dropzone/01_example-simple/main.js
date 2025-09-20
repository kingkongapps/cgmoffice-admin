var rowIdSequence = 100;

/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
  { field: 'id', rowDrag: true },
  { field: 'color' },
  { field: 'value1' },
  { field: 'value2' },
];

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
  },
  rowClassRules: {
    'red-row': 'data.color == "Red"',
    'green-row': 'data.color == "Green"',
    'blue-row': 'data.color == "Blue"',
  },
  rowData: createRowData(),
  rowDragManaged: true,
  columnDefs: columnDefs,
  animateRows: true,
  onGridReady: (params) => {
    addDropZones(params);
    addCheckboxListener(params);
  },
};

function addCheckboxListener(params) {
  var checkbox = document.querySelector('input[type=checkbox]');

  checkbox.addEventListener('change', function () {
    params.api.setSuppressMoveWhenRowDragging(checkbox.checked);
  });
}

function createRowData() {
  var data = [];
  [
    'Red',
    'Green',
    'Blue',
    'Red',
    'Green',
    'Blue',
    'Red',
    'Green',
    'Blue',
  ].forEach(function (color) {
    var newDataItem = {
      id: rowIdSequence++,
      color: color,
      value1: Math.floor(Math.random() * 100),
      value2: Math.floor(Math.random() * 100),
    };
    data.push(newDataItem);
  });
  return data;
}

function createTile(data) {
  var el = document.createElement('div');

  el.classList.add('tile');
  el.classList.add(data.color.toLowerCase());
  el.innerHTML =
    '<div class="id">' +
    data.id +
    '</div>' +
    '<div class="value">' +
    data.value1 +
    '</div>' +
    '<div class="value">' +
    data.value2 +
    '</div>';

  return el;
}

function addDropZones(params) {
  var tileContainer = document.querySelector('.tile-container');
  var dropZone = {
    getContainer: () => {
      return tileContainer;
    },
    onDragStop: (params) => {
      var tile = createTile(params.node.data);
      tileContainer.appendChild(tile);
    },
  };

  params.api.addRowDropZone(dropZone);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');

  new agGrid.Grid(gridDiv, gridOptions);
});
