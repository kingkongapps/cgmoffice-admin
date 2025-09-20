/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
  { field: 'athlete' },
  {
    field: 'age',
    maxWidth: 120,
    filter: 'agNumberColumnFilter',
    filterParams: {
      includeBlanksInEquals: false,
      includeBlanksInLessThan: false,
      includeBlanksInGreaterThan: false,
      includeBlanksInRange: false,
    },
  },
  {
    headerName: 'Description',
    valueGetter: '"Age is " + data.age',
    minWidth: 340,
  },
];

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
};

function changeNull(toChange, value) {
  switch (toChange) {
    case 'equals':
      columnDefs[1].filterParams.includeBlanksInEquals = value;
      break;
    case 'lessThan':
      columnDefs[1].filterParams.includeBlanksInLessThan = value;
      break;
    case 'greaterThan':
      columnDefs[1].filterParams.includeBlanksInGreaterThan = value;
      break;
    case 'inRange':
      columnDefs[1].filterParams.includeBlanksInRange = value;
      break;
  }

  var filterModel = gridOptions.api.getFilterModel();

  gridOptions.api.setColumnDefs(columnDefs);
  gridOptions.api.destroyFilter('age');
  gridOptions.api.setFilterModel(filterModel);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);

  gridOptions.api.setRowData([
    {
      athlete: 'Alberto Gutierrez',
      age: 36,
    },
    {
      athlete: 'Niall Crosby',
      age: 40,
    },
    {
      athlete: 'Sean Landsman',
      age: null,
    },
    {
      athlete: 'Robert Clarke',
      age: undefined,
    },
  ]);
});
