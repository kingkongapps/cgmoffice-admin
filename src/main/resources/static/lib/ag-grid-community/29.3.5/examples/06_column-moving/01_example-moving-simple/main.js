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
  defaultColDef: {
    width: 150,
  },
  suppressDragLeaveHidesColumns: true,
};

function onMedalsFirst() {
  gridOptions.columnApi.moveColumns(['gold', 'silver', 'bronze', 'total'], 0);
}

function onMedalsLast() {
  gridOptions.columnApi.moveColumns(['gold', 'silver', 'bronze', 'total'], 6);
}

function onCountryFirst() {
  gridOptions.columnApi.moveColumn('country', 0);
}

function onSwapFirstTwo() {
  gridOptions.columnApi.moveColumnByIndex(0, 1);
}

function onPrintColumns() {
  const cols = gridOptions.columnApi.getAllGridColumns();
  const colToNameFunc = (col, index) => index + ' = ' + col.getId();
  const colNames = cols.map(colToNameFunc).join(', ');
  console.log('columns are: ' + colNames);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
