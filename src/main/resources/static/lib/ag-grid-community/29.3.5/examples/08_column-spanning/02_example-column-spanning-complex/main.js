var cellClassRules = {
  'header-cell': 'data.section === "big-title"',
  'quarters-cell': 'data.section === "quarters"',
};

/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
  {
    headerName: 'Jan',
    field: 'jan',
    colSpan: (params) => {
      if (isHeaderRow(params)) {
        return 6;
      } else if (isQuarterRow(params)) {
        return 3;
      } else {
        return 1;
      }
    },
    cellClassRules: cellClassRules,
  },
  { headerName: 'Feb', field: 'feb' },
  { headerName: 'Mar', field: 'mar' },
  {
    headerName: 'Apr',
    field: 'apr',
    colSpan: (params) => {
      if (isQuarterRow(params)) {
        return 3;
      } else {
        return 1;
      }
    },
    cellClassRules: cellClassRules,
  },
  { headerName: 'May', field: 'may' },
  { headerName: 'Jun', field: 'jun' },
];

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  getRowHeight: (params) => {
    if (isHeaderRow(params)) {
      return 60;
    }
  },
  columnDefs: columnDefs,
  rowData: getData(),
  defaultColDef: {
    width: 100,
  },
  onGridReady: (params) => {
    params.api.sizeColumnsToFit();
  },
};

function isHeaderRow(params) {
  return params.data.section === 'big-title';
}

function isQuarterRow(params) {
  return params.data.section === 'quarters';
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
});
