/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: [
    { field: 'athlete', minWidth: 160 },
    { field: 'age' },
    { field: 'country', minWidth: 140 },
    { field: 'year' },
    { field: 'date', minWidth: 140 },
    { field: 'sport', minWidth: 160 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
    editable: true,
  },
  getRowId: (params) => params.data.id,
  readOnlyEdit: true,
  onCellEditRequest: onCellEditRequest,
};

let rowImmutableStore;

function onCellEditRequest(event) {
  const data = event.data;
  const field = event.colDef.field;
  const newValue = event.newValue;

  const oldItem = rowImmutableStore.find((row) => row.id === data.id);

  if (!oldItem || !field) {
    return;
  }

  const newItem = { ...oldItem };

  newItem[field] = newValue;

  console.log('onCellEditRequest, updating ' + field + ' to ' + newValue);

  rowImmutableStore = rowImmutableStore.map((oldItem) =>
    oldItem.id == newItem.id ? newItem : oldItem
  );
  gridOptions.api.setRowData(rowImmutableStore);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  sampledata.forEach((item, index) => (item.id = index));
  rowImmutableStore = sampledata;
  gridOptions.api.setRowData(rowImmutableStore);
});
