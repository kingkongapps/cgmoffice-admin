const rowData = createData(100, 'body');
const pinnedTopRowData = createData(3, 'pinned');
const pinnedBottomRowData = createData(3, 'pinned');

function getColumnDefs() {
  /** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [];
  alphabet().forEach(function (letter) {
    const colDef = {
      headerName: letter,
      field: letter,
      width: 150,
    };
    if (letter === 'A') {
      colDef.pinned = 'left';
    }
    if (letter === 'Z') {
      colDef.pinned = 'right';
    }
    columnDefs.push(colDef);
  });
  return columnDefs;
}

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: getColumnDefs(),
  rowData: rowData,
  pinnedTopRowData: pinnedTopRowData,
  pinnedBottomRowData: pinnedBottomRowData,
  isFullWidthRow: (params) => {
    // in this example, we check the fullWidth attribute that we set
    // while creating the data. what check you do to decide if you
    // want a row full width is up to you, as long as you return a boolean
    // for this method.
    return params.rowNode.data.fullWidth;
  },
  // see AG Grid docs cellRenderer for details on how to build cellRenderers
  // this is a simple function cellRenderer, returns plain HTML, not a component
  fullWidthCellRenderer: FullWidthCellRenderer,
  getRowHeight: (params) => {
    // you can have normal rows and full width rows any height that you want
    const isBodyRow = params.node.rowPinned === undefined;
    const isFullWidth = params.node.data.fullWidth;
    if (isBodyRow && isFullWidth) {
      return 75;
    }
  },
};

function alphabet() {
  return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
}

function createData(count, prefix) {
  const rowData = [];
  for (let i = 0; i < count; i++) {
    const item = {};
    // mark every third row as full width. how you mark the row is up to you,
    // in this example the example code (not the grid code) looks at the
    // fullWidth attribute in the isFullWidthRow() callback. how you determine
    // if a row is full width or not is totally up to you.
    item.fullWidth = i % 3 === 2;
    // put in a column for each letter of the alphabet
    alphabet().forEach(function (letter) {
      item[letter] = prefix + ' (' + letter + ',' + i + ')';
    });
    rowData.push(item);
  }
  return rowData;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
});
