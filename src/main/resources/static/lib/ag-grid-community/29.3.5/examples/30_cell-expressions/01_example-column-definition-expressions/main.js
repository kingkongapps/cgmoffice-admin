/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
  {
    headerName: 'String (editable)',
    field: 'simple',
    editable: true,
  },
  {
    headerName: 'Bad Number (editable)',
    field: 'numberBad',
    editable: true,
  },
  {
    headerName: 'Good Number (editable)',
    field: 'numberGood',
    editable: true,
    valueFormatter: `"£" + Math.floor(value).toString().replace(/(\\d)(?=(\\d{3})+(?!\\d))/g, "$1,")`,
    valueParser: 'Number(newValue)',
  },
  {
    headerName: 'Name (editable)',
    editable: true,
    valueGetter: 'data.firstName + " " + data.lastName',
    valueSetter:
      // an expression can span multiple lines!!!
      `var nameSplit = newValue.split(" ");
             var newFirstName = nameSplit[0];
             var newLastName = nameSplit[1];
             if (data.firstName !== newFirstName || data.lastName !== newLastName) {  
                data.firstName = newFirstName;  
                data.lastName = newLastName;  
                return true;
            } else {  
                return false;
            }`,
  },
  { headerName: 'A', field: 'a', maxWidth: 120 },
  { headerName: 'B', field: 'b', maxWidth: 120 },
  { headerName: 'A + B', valueGetter: 'data.a + data.b', maxWidth: 120 },
];

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    flex: 1,
    minWidth: 200,
    resizable: true,
  },
  rowData: getData(),
  onCellValueChanged: onCellValueChanged,
};

function onCellValueChanged(event) {
  console.log('data after changes is: ', event.data);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  gridOptions.api.sizeColumnsToFit();
});
