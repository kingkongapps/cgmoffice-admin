/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  // define grid columns
  columnDefs: [
    { field: 'name' },
    // Using dot notation to access nested property
    { field: 'medals.gold', headerName: 'Gold' },
    // Show default header name
    { field: 'person.age' },
  ],
  rowData: getData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
});
