const getMedalString = function ({ gold, silver, bronze }) {
  const goldStr = gold > 0 ? `Gold: ${gold} ` : '';
  const silverStr = silver > 0 ? `Silver: ${silver} ` : '';
  const bronzeStr = bronze > 0 ? `Bronze: ${bronze}` : '';
  return goldStr + silverStr + bronzeStr;
};

const MedalRenderer = function (params) {
  return getMedalString(params.value);
};

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: [
    // simple column, easy to understand
    { field: 'name' },
    // the grid works with embedded fields
    { headerName: 'Age', field: 'person.age' },
    // or use value getter, all works with quick filter
    { headerName: 'Country', valueGetter: 'data.person.country' },
    // or use the object value, so value passed around is an object
    {
      headerName: 'Results',
      field: 'medals',
      cellRenderer: MedalRenderer,
      // this is needed to avoid toString=[object,object] result with objects
      getQuickFilterText: (params) => {
        return getMedalString(params.value);
      },
    },
    {
      headerName: 'Hidden',
      field: 'hidden',
      hide: true,
    },
  ],
  defaultColDef: {
    flex: 1,
    editable: true,
  },
  rowData: getData(),
  cacheQuickFilter: true,
};

var excludeHiddenColumns = false;

function onExcludeHiddenColumnsToggled() {
  excludeHiddenColumns = !excludeHiddenColumns;
  gridOptions.api.setExcludeHiddenColumnsFromQuickFilter(excludeHiddenColumns);
  document.querySelector('#excludeHiddenColumns').innerHTML = `${
    excludeHiddenColumns ? 'Include' : 'Exclude'
  } Hidden Columns`;
}

function onFilterTextBoxChanged() {
  gridOptions.api.setQuickFilter(
    document.getElementById('filter-text-box').value
  );
}

function onPrintQuickFilterTexts() {
  gridOptions.api.forEachNode(function (rowNode, index) {
    console.log(
      'Row ' +
        index +
        ' quick filter text is ' +
        rowNode.quickFilterAggregateText
    );
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
});
