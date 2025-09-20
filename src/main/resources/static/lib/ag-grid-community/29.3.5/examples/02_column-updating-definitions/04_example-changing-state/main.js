function getColumnDefs() {
  return [
    { field: 'athlete', width: 150, sort: 'asc' },
    { field: 'age' },
    { field: 'country', pinned: 'left' },
    { field: 'sport' },
    { field: 'year' },
    { field: 'date' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ];
}

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  defaultColDef: {
    initialWidth: 100,
    width: 100, // resets col widths if manually resized
    sortable: true,
    resizable: true,
    pinned: null, // important - clears pinned if not specified in col def
    sort: null, // important - clears sort if not specified in col def
  },
  columnDefs: getColumnDefs(),
};

function onBtWithState() {
  gridOptions.api.setColumnDefs(getColumnDefs());
}

function onBtRemove() {
  gridOptions.api.setColumnDefs([]);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
