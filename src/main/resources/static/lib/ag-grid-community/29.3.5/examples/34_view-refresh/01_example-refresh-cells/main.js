// placing in 13 rows, so there are exactly enough rows to fill the grid, makes
// the row animation look nice when you see all the rows
var data = [];
var topRowData = [];
var bottomRowData = [];

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: [
    { field: 'a', suppressCellFlash: true },
    { field: 'b' },
    { field: 'c' },
    { field: 'd' },
    { field: 'e' },
    { field: 'f' },
  ],
  defaultColDef: {
    flex: 1,
  },
  rowData: [],
  pinnedTopRowData: [],
  pinnedBottomRowData: [],
  enableCellChangeFlash: true,
  onGridReady: (params) => {
    // placing in 13 rows, so there are exactly enough rows to fill the grid, makes
    // the row animation look nice when you see all the rows
    data = createData(14);
    topRowData = createData(2);
    bottomRowData = createData(2);
    params.api.setRowData(data);
    params.api.setPinnedTopRowData(topRowData);
    params.api.setPinnedBottomRowData(bottomRowData);
  },
};

function createData(count) {
  var result = [];
  for (var i = 1; i <= count; i++) {
    result.push({
      a: (i * 863) % 100,
      b: (i * 811) % 100,
      c: (i * 743) % 100,
      d: (i * 677) % 100,
      e: (i * 619) % 100,
      f: (i * 571) % 100,
    });
  }
  return result;
}

function isForceRefreshSelected() {
  return document.querySelector('#forceRefresh').checked;
}

function isSuppressFlashSelected() {
  return document.querySelector('#suppressFlash').checked;
}

function scrambleAndRefreshAll() {
  scramble();
  var params = {
    force: isForceRefreshSelected(),
    suppressFlash: isSuppressFlashSelected(),
  };
  gridOptions.api.refreshCells(params);
}

function scrambleAndRefreshLeftToRight() {
  scramble();

  var api = gridOptions.api;
  ['a', 'b', 'c', 'd', 'e', 'f'].forEach(function (col, index) {
    var millis = index * 100;
    var params = {
      force: isForceRefreshSelected(),
      suppressFlash: isSuppressFlashSelected(),
      columns: [col],
    };
    callRefreshAfterMillis(params, millis, api);
  });
}

function scrambleAndRefreshTopToBottom() {
  scramble();

  var frame = 0;
  var i;
  var rowNode;

  var api = gridOptions.api;
  for (i = 0; i < api.getPinnedTopRowCount(); i++) {
    rowNode = api.getPinnedTopRow(i);
    refreshRow(rowNode, api);
  }

  for (i = 0; i < api.getDisplayedRowCount(); i++) {
    rowNode = api.getDisplayedRowAtIndex(i);
    refreshRow(rowNode, api);
  }

  for (i = 0; i < api.getPinnedBottomRowCount(); i++) {
    rowNode = api.getPinnedBottomRow(i);
    refreshRow(rowNode, api);
  }

  function refreshRow(rowNode, api) {
    var millis = frame++ * 100;
    var rowNodes = [rowNode]; // params needs an array
    var params = {
      force: isForceRefreshSelected(),
      suppressFlash: isSuppressFlashSelected(),
      rowNodes: rowNodes,
    };
    callRefreshAfterMillis(params, millis, api);
  }
}

function callRefreshAfterMillis(params, millis, gridApi) {
  setTimeout(function () {
    gridApi.refreshCells(params);
  }, millis);
}

function scramble() {
  data.forEach(scrambleItem);
  topRowData.forEach(scrambleItem);
  bottomRowData.forEach(scrambleItem);
}

function scrambleItem(item) {
  ['a', 'b', 'c', 'd', 'e', 'f'].forEach(function (colId) {
    // skip 50% of the cells so updates are random
    if (Math.random() > 0.5) {
      return;
    }
    item[colId] = Math.floor(Math.random() * 100);
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
});
