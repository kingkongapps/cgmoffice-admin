/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: [
    { field: 'athlete' },
    { field: 'age' },
    { field: 'country' },
    { field: 'year' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  rowData: null,
  defaultColDef: {
    headerComponent: CustomHeader,
  },
};

function onBtUpperNames() {
  /** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
    { field: 'athlete' },
    { field: 'age' },
    { field: 'country' },
    { field: 'year' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ];
  columnDefs.forEach(function (c) {
    c.headerName = c.field.toUpperCase();
  });
  gridOptions.api.setColumnDefs(columnDefs);
}

function onBtLowerNames() {
  const columnDefs = [
    { field: 'athlete' },
    { field: 'age' },
    { field: 'country' },
    { field: 'year' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ];
  columnDefs.forEach(function (c) {
    c.headerName = c.field;
  });
  gridOptions.api.setColumnDefs(columnDefs);
}

function onBtFilterOn() {
  const columnDefs = [
    { field: 'athlete' },
    { field: 'age' },
    { field: 'country' },
    { field: 'year' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ];
  columnDefs.forEach(function (c) {
    c.filter = true;
  });
  gridOptions.api.setColumnDefs(columnDefs);
}

function onBtFilterOff() {
  const columnDefs = [
    { field: 'athlete' },
    { field: 'age' },
    { field: 'country' },
    { field: 'year' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ];
  columnDefs.forEach(function (c) {
    c.filter = false;
  });
  gridOptions.api.setColumnDefs(columnDefs);
}

function onBtResizeOn() {
  const columnDefs = [
    { field: 'athlete' },
    { field: 'age' },
    { field: 'country' },
    { field: 'year' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ];
  columnDefs.forEach(function (c) {
    c.resizable = true;
  });
  gridOptions.api.setColumnDefs(columnDefs);
}

function onBtResizeOff() {
  const columnDefs = [
    { field: 'athlete' },
    { field: 'age' },
    { field: 'country' },
    { field: 'year' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ];
  columnDefs.forEach(function (c) {
    c.resizable = false;
  });
  gridOptions.api.setColumnDefs(columnDefs);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
