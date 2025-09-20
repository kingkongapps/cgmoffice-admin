var athleteRowDragTextCallback = function (params, dragItemCount) {
  // keep double equals here because data can be a string or number
  return `${dragItemCount} athlete(s) selected`;
};

var rowDragTextCallback = function (params) {
  // keep double equals here because data can be a string or number
  if (params.rowNode.data.year == '2012') {
    return params.defaultTextValue + ' (London Olympics)';
  }
  return params.defaultTextValue;
};

/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
  {
    field: 'athlete',
    rowDrag: true,
    rowDragText: athleteRowDragTextCallback,
  },
  { field: 'country', rowDrag: true },
  { field: 'year', width: 100 },
  { field: 'date' },
  { field: 'sport' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
];

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  defaultColDef: {
    width: 170,
    sortable: true,
    filter: true,
  },
  rowDragManaged: true,
  columnDefs: columnDefs,
  animateRows: true,
  rowDragText: rowDragTextCallback,
  rowDragMultiRow: true,
  rowSelection: 'multiple',
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
