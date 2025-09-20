const athleteColumn = {
  headerName: 'Athlete',
  valueGetter: (params) => {
    return params.data ? params.data.athlete : undefined;
  },
};

function getColDefsMedalsIncluded() {
  return [
    athleteColumn,
    {
      colId: 'myAgeCol',
      headerName: 'Age',
      valueGetter: (params) => {
        return params.data ? params.data.age : undefined;
      },
    },
    {
      headerName: 'Country',
      headerClass: 'country-header',
      valueGetter: (params) => {
        return params.data ? params.data.country : undefined;
      },
    },
    { field: 'sport' },
    { field: 'year' },
    { field: 'date' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ];
}

function getColDefsMedalsExcluded() {
  return [
    athleteColumn,
    {
      colId: 'myAgeCol',
      headerName: 'Age',
      valueGetter: (params) => {
        return params.data ? params.data.age : undefined;
      },
    },
    {
      headerName: 'Country',
      headerClass: 'country-header',
      valueGetter: (params) => {
        return params.data ? params.data.country : undefined;
      },
    },
    { field: 'sport' },
    { field: 'year' },
    { field: 'date' },
  ];
}

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  defaultColDef: {
    initialWidth: 100,
    sortable: true,
    resizable: true,
  },
  columnDefs: getColDefsMedalsIncluded(),
};

function onBtExcludeMedalColumns() {
  gridOptions.api.setColumnDefs(getColDefsMedalsExcluded());
}

function onBtIncludeMedalColumns() {
  gridOptions.api.setColumnDefs(getColDefsMedalsIncluded());
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
