/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: [
    { field: 'latinText', width: 350, wrapText: true },
    { field: 'athlete' },
    { field: 'country' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  rowHeight: 120,
  defaultColDef: {
    width: 170,
    sortable: true,
    editable: true,
    resizable: true,
    filter: true,
  },
};
var latinText =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  sampledata.forEach(function (dataItem) {
    dataItem.latinText = latinText;
  });

  // now set the data into the grid
  gridOptions.api.setRowData(sampledata);
});
