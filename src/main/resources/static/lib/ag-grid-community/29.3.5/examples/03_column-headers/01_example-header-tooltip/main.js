/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
  { field: 'athlete', headerTooltip: "The athlete's name" },
  { field: 'age', headerTooltip: "The athlete's age" },
  { field: 'country' },
  { field: 'year' },
  { field: 'date', headerTooltip: 'The date of the Olympics' },
  { field: 'sport', headerTooltip: 'The sport the medal was for' },
  { field: 'gold', headerTooltip: 'How many gold medals' },
  { field: 'silver', headerTooltip: 'How many silver medals' },
  { field: 'bronze', headerTooltip: 'How many bronze medals' },
  { field: 'total', headerTooltip: 'The total number of medals' },
];

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    width: 150,
  },
  tooltipShowDelay: 500,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
