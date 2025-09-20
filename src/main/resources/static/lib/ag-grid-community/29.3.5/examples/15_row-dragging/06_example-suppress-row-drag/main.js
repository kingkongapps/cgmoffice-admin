/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: [
    { field: 'athlete', rowDrag: true },
    { field: 'country' },
    { field: 'year', width: 100 },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
  ],
  defaultColDef: {
    width: 170,
    sortable: true,
    filter: true,
  },
  rowDragManaged: true,
  animateRows: true,
};

function onBtSuppressRowDrag() {
  gridOptions.api.setSuppressRowDrag(true);
}

function onBtShowRowDrag() {
  gridOptions.api.setSuppressRowDrag(false);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
