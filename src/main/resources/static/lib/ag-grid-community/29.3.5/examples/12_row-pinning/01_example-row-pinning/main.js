/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
  {
    field: 'athlete',
    cellRendererSelector: (params) => {
      if (params.node.rowPinned) {
        return {
          component: CustomPinnedRowRenderer,
          params: {
            style: { color: 'blue' },
          },
        };
      } else {
        // rows that are not pinned don't use any cell renderer
        return undefined;
      }
    },
  },
  {
    field: 'age',
    cellRendererSelector: (params) => {
      if (params.node.rowPinned) {
        return {
          component: CustomPinnedRowRenderer,
          params: {
            style: { 'font-style': 'italic' },
          },
        };
      } else {
        // rows that are not pinned don't use any cell renderer
        return undefined;
      }
    },
  },
  { field: 'country' },
  { field: 'year' },
  { field: 'date' },
  { field: 'sport' },
];

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  defaultColDef: {
    width: 200,
    sortable: true,
    filter: true,
    resizable: true,
  },
  columnDefs: columnDefs,
  rowData: null,
  getRowStyle: (params) => {
    if (params.node.rowPinned) {
      return { 'font-weight': 'bold' };
    }
  },
  // no rows to pin to start with
  pinnedTopRowData: createData(1, 'Top'),
  pinnedBottomRowData: createData(1, 'Bottom'),
};

function onPinnedRowTopCount() {
  var headerRowsToFloat = document.getElementById('top-row-count').value;
  var count = Number(headerRowsToFloat);
  var rows = createData(count, 'Top');
  gridOptions.api.setPinnedTopRowData(rows);
}

function onPinnedRowBottomCount() {
  var footerRowsToFloat = document.getElementById('bottom-row-count').value;
  var count = Number(footerRowsToFloat);
  var rows = createData(count, 'Bottom');
  gridOptions.api.setPinnedBottomRowData(rows);
}

function createData(count, prefix) {
  var result = [];
  for (var i = 0; i < count; i++) {
    result.push({
      athlete: prefix + ' Athlete ' + i,
      age: prefix + ' Age ' + i,
      country: prefix + ' Country ' + i,
      year: prefix + ' Year ' + i,
      date: prefix + ' Date ' + i,
      sport: prefix + ' Sport ' + i,
    });
  }
  return result;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
