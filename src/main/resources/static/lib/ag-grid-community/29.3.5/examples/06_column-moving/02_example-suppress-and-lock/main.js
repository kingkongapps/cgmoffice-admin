/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: [
    {
      field: 'athlete',
      suppressMovable: true,
      cellClass: 'suppress-movable-col',
    },
    { field: 'age', lockPosition: 'left', cellClass: 'locked-col' },
    { field: 'country' },
    { field: 'year' },
    { field: 'total', lockPosition: 'right', cellClass: 'locked-col' },
  ],
  defaultColDef: {
    flex: 1,
    lockPinned: true, // Dont allow pinning for this example
  },
  suppressDragLeaveHidesColumns: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
