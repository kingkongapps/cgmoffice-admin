function rowSpan(params) {
  if (params.data.show) {
    return 4;
  } else {
    return 1;
  }
}

class ShowCellRenderer {
  init(params) {
    const cellBlank = !params.value;
    if (cellBlank) {
      return;
    }

    this.ui = document.createElement('div');
    this.ui.innerHTML =
      '<div class="show-name">' +
      params.value.name +
      '' +
      '</div>' +
      '<div class="show-presenter">' +
      params.value.presenter +
      '</div>';
  }

  getGui() {
    return this.ui;
  }

  refresh() {
    return false;
  }
}

/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
  { field: 'localTime' },
  {
    field: 'show',
    cellRenderer: ShowCellRenderer,
    rowSpan: rowSpan,
    cellClassRules: {
      'show-cell': 'value !== undefined',
    },
    width: 200,
  },
  { field: 'a' },
  { field: 'b' },
  { field: 'c' },
  { field: 'd' },
  { field: 'e' },
];

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    resizable: true,
    width: 170,
  },
  rowData: getData(),
  suppressRowTransform: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
});
