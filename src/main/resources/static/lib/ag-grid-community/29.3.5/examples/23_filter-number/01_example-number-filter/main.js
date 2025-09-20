var numberValueFormatter = function (params) {
  return params.value.toFixed(2);
};

var saleFilterParams = {
  allowedCharPattern: '\\d\\-\\,\\$',
  numberParser: (text) => {
    return text == null
      ? null
      : parseFloat(text.replace(',', '.').replace('$', ''));
  },
};

var saleValueFormatter = function (params) {
  var formatted = params.value.toFixed(2).replace('.', ',');

  if (formatted.indexOf('-') === 0) {
    return '-$' + formatted.slice(1);
  }

  return '$' + formatted;
};

/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
  {
    field: 'sale',
    headerName: 'Sale ($)',
    filter: 'agNumberColumnFilter',
    floatingFilter: true,
    valueFormatter: numberValueFormatter,
  },
  {
    field: 'sale',
    headerName: 'Sale',
    filter: 'agNumberColumnFilter',
    floatingFilter: true,
    filterParams: saleFilterParams,
    valueFormatter: saleValueFormatter,
  },
];

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 150,
  },
  rowData: getData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
});
