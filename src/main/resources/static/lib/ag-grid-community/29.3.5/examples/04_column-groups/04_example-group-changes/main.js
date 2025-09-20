/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
  { field: 'athlete', colId: 'athlete' },
  { field: 'age', colId: 'age' },
  { field: 'country', colId: 'country' },
  { field: 'year', colId: 'year' },
  { field: 'date', colId: 'date' },
  { field: 'total', colId: 'total' },
  { field: 'gold', colId: 'gold' },
  { field: 'silver', colId: 'silver' },
  { field: 'bronze', colId: 'bronze' },
];

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  defaultColDef: {
    initialWidth: 150,
    sortable: true,
    resizable: true,
    filter: true,
  },
  columnDefs: columnDefs,
  maintainColumnOrder: true,
};

function onBtNoGroups() {
  const columnDefs = [
    { field: 'athlete', colId: 'athlete' },
    { field: 'age', colId: 'age' },
    { field: 'country', colId: 'country' },
    { field: 'year', colId: 'year' },
    { field: 'date', colId: 'date' },
    { field: 'total', colId: 'total' },
    { field: 'gold', colId: 'gold' },
    { field: 'silver', colId: 'silver' },
    { field: 'bronze', colId: 'bronze' },
  ];
  gridOptions.api.setColumnDefs(columnDefs);
}

function onMedalsInGroupOnly() {
  const columnDefs = [
    { field: 'athlete', colId: 'athlete' },
    { field: 'age', colId: 'age' },
    { field: 'country', colId: 'country' },
    { field: 'year', colId: 'year' },
    { field: 'date', colId: 'date' },
    {
      headerName: 'Medals',
      headerClass: 'medals-group',
      children: [
        { field: 'total', colId: 'total' },
        { field: 'gold', colId: 'gold' },
        { field: 'silver', colId: 'silver' },
        { field: 'bronze', colId: 'bronze' },
      ],
    },
  ];
  gridOptions.api.setColumnDefs(columnDefs);
}

function onParticipantInGroupOnly() {
  const columnDefs = [
    {
      headerName: 'Participant',
      headerClass: 'participant-group',
      children: [
        { field: 'athlete', colId: 'athlete' },
        { field: 'age', colId: 'age' },
        { field: 'country', colId: 'country' },
        { field: 'year', colId: 'year' },
        { field: 'date', colId: 'date' },
      ],
    },
    { field: 'total', colId: 'total' },
    { field: 'gold', colId: 'gold' },
    { field: 'silver', colId: 'silver' },
    { field: 'bronze', colId: 'bronze' },
  ];
  gridOptions.api.setColumnDefs(columnDefs);
}

function onParticipantAndMedalsInGroups() {
  const columnDefs = [
    {
      headerName: 'Participant',
      headerClass: 'participant-group',
      children: [
        { field: 'athlete', colId: 'athlete' },
        { field: 'age', colId: 'age' },
        { field: 'country', colId: 'country' },
        { field: 'year', colId: 'year' },
        { field: 'date', colId: 'date' },
      ],
    },
    {
      headerName: 'Medals',
      headerClass: 'medals-group',
      children: [
        { field: 'total', colId: 'total' },
        { field: 'gold', colId: 'gold' },
        { field: 'silver', colId: 'silver' },
        { field: 'bronze', colId: 'bronze' },
      ],
    },
  ];
  gridOptions.api.setColumnDefs(columnDefs);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
