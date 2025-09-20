/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
  {
    headerName: 'Everything Resizes',
    children: [
      {
        field: 'athlete',
        headerClass: 'resizable-header',
      },
      { field: 'age', headerClass: 'resizable-header' },
      {
        field: 'country',
        headerClass: 'resizable-header',
      },
    ],
  },
  {
    headerName: 'Only Year Resizes',
    children: [
      { field: 'year', headerClass: 'resizable-header' },
      {
        field: 'date',
        resizable: false,
        headerClass: 'fixed-size-header',
      },
      {
        field: 'sport',
        resizable: false,
        headerClass: 'fixed-size-header',
      },
    ],
  },
  {
    headerName: 'Nothing Resizes',
    children: [
      {
        field: 'gold',
        resizable: false,
        headerClass: 'fixed-size-header',
      },
      {
        field: 'silver',
        resizable: false,
        headerClass: 'fixed-size-header',
      },
      {
        field: 'bronze',
        resizable: false,
        headerClass: 'fixed-size-header',
      },
      {
        field: 'total',
        resizable: false,
        headerClass: 'fixed-size-header',
      },
    ],
  },
];

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  defaultColDef: {
    width: 150,
    resizable: true,
  },
  columnDefs: columnDefs,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
