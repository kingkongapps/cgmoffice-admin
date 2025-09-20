/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
  { field: 'athlete', sortingOrder: ['asc', 'desc'] },
  { field: 'age', width: 90, sortingOrder: ['desc', 'asc'] },
  { field: 'country', sortingOrder: ['desc', null] },
  { field: 'year', width: 90, sortingOrder: ['asc'] },
  { field: 'date' },
  { field: 'sport' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
  { field: 'total' },
];

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  defaultColDef: {
    width: 170,
    sortable: true,
  },
  columnDefs: columnDefs,
  rowData: null,
  animateRows: true,
  sortingOrder: ['desc', 'asc', null],
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
