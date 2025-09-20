/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [{ field: 'make' }, { field: 'model' }, { field: 'price' }];

// specify the data
const rowDataA = [
  { id: '1', make: 'Toyota', model: 'Celica', price: 35000 },
  { id: '4', make: 'BMW', model: 'M50', price: 60000 },
  { id: '5', make: 'Aston Martin', model: 'DBX', price: 190000 },
];

const rowDataB = [
  { id: '1', make: 'Toyota', model: 'Celica', price: 35000 },
  { id: '2', make: 'Ford', model: 'Mondeo', price: 32000 },
  { id: '3', make: 'Porsche', model: 'Boxster', price: 72000 },
  { id: '4', make: 'BMW', model: 'M50', price: 60000 },
  { id: '5', make: 'Aston Martin', model: 'DBX', price: 190000 },
];

// let the grid know which columns and what data to use
/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: columnDefs,
  rowData: rowDataA,
  rowSelection: 'single',
  animateRows: true,
  getRowId: (params) => params.data.id,
};

function onRowDataA() {
  gridOptions.api.setRowData(rowDataA);
}

function onRowDataB() {
  gridOptions.api.setRowData(rowDataB);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
});
