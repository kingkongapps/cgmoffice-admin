/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
  { field: 'athlete', pinned: 'left' },
  { field: 'age', pinned: 'left' },
  {
    field: 'country',
    colSpan: (params) => {
      const country = params.data.country;
      if (country === 'Russia') {
        // have all Russia age columns width 2
        return 2;
      } else if (country === 'United States') {
        // have all United States column width 4
        return 4;
      } else {
        // all other rows should be just normal
        return 1;
      }
    },
  },
  { field: 'year' },
  { field: 'date' },
  { field: 'sport' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
  { field: 'total' },
];

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    width: 150,
    resizable: true,
  },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
