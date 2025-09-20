let editableYear = 2012;

function isCellEditable(params) {
  return params.data.year === editableYear;
}

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: [
    { field: 'athlete', type: 'editableColumn' },
    { field: 'age', type: 'editableColumn' },
    { field: 'year' },
    { field: 'country' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
  ],
  columnTypes: {
    editableColumn: {
      editable: (params) => {
        return isCellEditable(params);
      },
      cellStyle: (params) => {
        if (isCellEditable(params)) {
          return { backgroundColor: 'lightBlue' };
        }
      },
    },
  },
};

function setEditableYear(year) {
  editableYear = year;
  // Redraw to re-apply the new cell style
  gridOptions.api.redrawRows();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
