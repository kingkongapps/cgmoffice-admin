class CountryCellRenderer {
  init(params) {
    const flag = `<img border="0" width="15" height="10" src="../../example-assets/flags/${params.data.code}.png">`;

    const eTemp = document.createElement('div');
    eTemp.innerHTML = `<span style="cursor: default;">${flag} ${params.value}</span>`;
    this.eGui = eTemp.firstElementChild;
  }

  getGui() {
    return this.eGui;
  }

  refresh(params) {
    return false;
  }
}

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: [
    { field: 'name', cellRenderer: CountryCellRenderer },
    { field: 'continent' },
    { field: 'language' },
  ],
  defaultColDef: {
    flex: 1,
    sortable: true,
    resizable: true,
    filter: true,
  },
  rowData: getData(),
  getRowHeight: (params) => {
    // return 100px height for full width rows
    if (isFullWidth(params.data)) {
      return 100;
    }
  },
  isFullWidthRow: (params) => {
    return isFullWidth(params.rowNode.data);
  },
  // see AG Grid docs cellRenderer for details on how to build cellRenderers
  fullWidthCellRenderer: FullWidthCellRenderer,
};

function isFullWidth(data) {
  // return true when country is Peru, France or Italy
  return ['Peru', 'France', 'Italy'].indexOf(data.name) >= 0;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
});
