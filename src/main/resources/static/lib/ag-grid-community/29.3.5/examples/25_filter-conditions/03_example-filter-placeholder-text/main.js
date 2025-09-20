/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
  {
    field: 'athlete',
  },
  {
    field: 'country',
    filter: 'agTextColumnFilter',
    filterParams: {
      filterPlaceholder: 'Country...',
    },
  },
  {
    field: 'sport',
    filter: 'agTextColumnFilter',
    filterParams: {
      filterPlaceholder: (params) => {
        const { filterOptionKey, placeholder } = params;
        return `${filterOptionKey} - ${placeholder}`;
      },
    },
  },
  {
    field: 'total',
    filter: 'agNumberColumnFilter',
    filterParams: {
      filterPlaceholder: (params) => {
        const { filterOption } = params;
        return `${filterOption} total`;
      },
    },
  },
];

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  defaultColDef: {
    flex: 1,
    sortable: true,
    filter: true,
  },
  columnDefs: columnDefs,
  rowData: null,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
