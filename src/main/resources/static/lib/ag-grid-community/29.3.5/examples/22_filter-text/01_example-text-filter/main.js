function contains(target, lookingFor) {
  return target && target.indexOf(lookingFor) >= 0;
}

var athleteFilterParams = {
  filterOptions: ['contains', 'notContains'],
  textFormatter: (r) => {
    if (r == null) return null;

    return r
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/æ/g, 'ae')
      .replace(/ç/g, 'c')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/ñ/g, 'n')
      .replace(/[òóôõö]/g, 'o')
      .replace(/œ/g, 'oe')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ýÿ]/g, 'y');
  },
  debounceMs: 200,
  maxNumConditions: 1,
};

var countryFilterParams = {
  filterOptions: ['contains'],
  textMatcher: ({ value, filterText }) => {
    var aliases = {
      usa: 'united states',
      holland: 'netherlands',
      niall: 'ireland',
      sean: 'south africa',
      alberto: 'mexico',
      john: 'australia',
      xi: 'china',
    };

    var literalMatch = contains(value, filterText || '');

    return !!literalMatch || !!contains(value, aliases[filterText || '']);
  },
  trimInput: true,
  debounceMs: 1000,
};

/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
  {
    field: 'athlete',
    filterParams: athleteFilterParams,
  },
  {
    field: 'country',
    filter: 'agTextColumnFilter',
    filterParams: countryFilterParams,
  },
  {
    field: 'sport',
    filter: 'agTextColumnFilter',
    filterParams: {
      caseSensitive: true,
      defaultOption: 'startsWith',
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
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
