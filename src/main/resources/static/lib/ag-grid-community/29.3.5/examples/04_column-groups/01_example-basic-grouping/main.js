/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
  {
    headerName: 'Athlete Details',
    children: [
      {
        field: 'athlete',
        width: 180,
        filter: 'agTextColumnFilter',
      },
      {
        field: 'age',
        width: 90,
        filter: 'agNumberColumnFilter',
      },
      { headerName: 'Country', field: 'country', width: 140 },
    ],
  },
  {
    headerName: 'Sports Results',
    children: [
      { field: 'sport', width: 140 },
      {
        columnGroupShow: 'closed',
        field: 'total',
        width: 100,
        filter: 'agNumberColumnFilter',
      },
      {
        columnGroupShow: 'open',
        field: 'gold',
        width: 100,
        filter: 'agNumberColumnFilter',
      },
      {
        columnGroupShow: 'open',
        field: 'silver',
        width: 100,
        filter: 'agNumberColumnFilter',
      },
      {
        columnGroupShow: 'open',
        field: 'bronze',
        width: 100,
        filter: 'agNumberColumnFilter',
      },
    ],
  },
];

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  defaultColDef: {
    sortable: true,
    resizable: true,
    filter: true,
  },
  // debug: true,
  columnDefs: columnDefs,
  rowData: null,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
