/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: [
    { field: 'rowHeight' },
    { field: 'athlete' },
    { field: 'age', width: 80 },
    { field: 'country' },
    { field: 'year', width: 90 },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  defaultColDef: {
    width: 150,
    sortable: true,
    resizable: true,
    filter: true,
  },
  // call back function, to tell the grid what height each row should be
  getRowHeight: getRowHeight,
};

function getRowHeight(params) {
  return params.data.rowHeight;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  var differentHeights = [40, 80, 120, 200];
  sampledata.forEach(function (dataItem, index) {
    dataItem.rowHeight = differentHeights[index % 4];
  });
  gridOptions.api.setRowData(sampledata);
});
