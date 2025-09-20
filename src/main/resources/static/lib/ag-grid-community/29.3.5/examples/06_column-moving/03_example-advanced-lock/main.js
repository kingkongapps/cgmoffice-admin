/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
  {
    lockPosition: 'left',
    valueGetter: 'node.rowIndex',
    cellClass: 'locked-col',
    width: 60,
    suppressNavigable: true,
  },
  {
    lockPosition: 'left',
    cellRenderer: ControlsCellRenderer,
    cellClass: 'locked-col',
    width: 120,
    suppressNavigable: true,
  },
  { field: 'athlete' },
  { field: 'age' },
  { field: 'country' },
  { field: 'year' },
  { field: 'date' },
  { field: 'sport' },
  { field: 'gold' },
  { field: 'silver' },
  { field: 'bronze' },
  { field: 'total' },
];

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    width: 150,
    resizable: true,
  },
  onColumnPinned: onColumnPinned,
  suppressDragLeaveHidesColumns: true,
};

function onColumnPinned(event) {
  const allCols = event.columnApi.getAllGridColumns();

  const allFixedCols = allCols.filter((col) => col.getColDef().lockPosition);
  const allNonFixedCols = allCols.filter(
    (col) => !col.getColDef().lockPosition
  );

  const pinnedCount = allNonFixedCols.filter(
    (col) => col.getPinned() === 'left'
  ).length;

  const pinFixed = pinnedCount > 0;

  const columnStates = [];
  allFixedCols.forEach((col) => {
    if (pinFixed !== col.isPinned()) {
      columnStates.push({
        colId: col.getId(),
        pinned: pinFixed ? 'left' : null,
      });
    }
  });

  if (columnStates.length > 0) {
    event.columnApi.applyColumnState({ state: columnStates });
  }
}

function onPinAthlete() {
  gridOptions.columnApi.applyColumnState({
    state: [{ colId: 'athlete', pinned: 'left' }],
  });
}

function onUnpinAthlete() {
  gridOptions.columnApi.applyColumnState({
    state: [{ colId: 'athlete', pinned: null }],
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
