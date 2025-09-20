/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
  {
    headerName: '#',
    colId: 'rowNum',
    valueGetter: 'node.id',
    width: 80,
    pinned: 'left',
  },
  { field: 'athlete', width: 150, pinned: 'left' },
  { field: 'age', width: 90, pinned: 'left' },
  { field: 'country', width: 150 },
  { field: 'year', width: 90 },
  { field: 'date', width: 110 },
  { field: 'sport', width: 150 },
  { field: 'gold', width: 100 },
  { field: 'silver', width: 100 },
  { field: 'bronze', width: 100 },
  { field: 'total', width: 100, pinned: 'right' },
];

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  defaultColDef: {
    resizable: true,
  },
  columnDefs: columnDefs,
  // debug: true,
  rowData: null,
};

function clearPinned() {
  gridOptions.columnApi.applyColumnState({ defaultState: { pinned: null } });
}

function resetPinned() {
  gridOptions.columnApi.applyColumnState({
    state: [
      { colId: 'rowNum', pinned: 'left' },
      { colId: 'athlete', pinned: 'left' },
      { colId: 'age', pinned: 'left' },
      { colId: 'total', pinned: 'right' },
    ],
    defaultState: { pinned: null },
  });
}

function pinCountry() {
  gridOptions.columnApi.applyColumnState({
    state: [{ colId: 'country', pinned: 'left' }],
    defaultState: { pinned: null },
  });
}

function jumpToCol() {
  const value = document.getElementById('col').value;
  if (typeof value !== 'string' || value === '') {
    return;
  }

  const index = Number(value);
  if (typeof index !== 'number' || isNaN(index)) {
    return;
  }

  // it's actually a column the api needs, so look the column up
  const allColumns = gridOptions.columnApi.getColumns();
  if (allColumns) {
    const column = allColumns[index];
    if (column) {
      gridOptions.api.ensureColumnVisible(column);
    }
  }
}

function jumpToRow() {
  var value = document.getElementById('row').value;
  const index = Number(value);
  if (typeof index === 'number' && !isNaN(index)) {
    gridOptions.api.ensureIndexVisible(index);
  }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
