/** @type {(import('ag-grid-community').ColDef | import('ag-grid-community').ColGroupDef )[]} */
const columnDefs = [
  { headerName: 'Athlete Name', field: 'athlete', suppressMenu: true },
  { field: 'age', sortable: false },
  { field: 'country', suppressMenu: true },
  { field: 'year', sortable: false },
  { field: 'date', suppressMenu: true, sortable: false },
  { field: 'sport', sortable: false },
  { field: 'gold' },
  { field: 'silver', sortable: false },
  { field: 'bronze', suppressMenu: true },
  { field: 'total', sortable: false },
];

/** @type {import('ag-grid-community').GridOptions} */
const gridOptions = {
  columnDefs: columnDefs,
  rowData: null,
  suppressMenuHide: true,
  defaultColDef: {
    sortable: true,
    resizable: true,
    filter: true,
    width: 150,
    headerComponentParams: {
      menuIcon: 'fa-bars',
      template: `<div class="ag-cell-label-container" role="presentation">
                    <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>
                    <div ref="eLabel" class="ag-header-cell-label" role="presentation">
                        <span ref="eSortOrder" class="ag-header-icon ag-sort-order ag-hidden"></span>
                        <span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon ag-hidden"></span>
                        <span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon ag-hidden"></span>
                        <span ref="eSortMixed" class="ag-header-icon ag-sort-mixed-icon ag-hidden"></span>
                        <span ref="eSortNone" class="ag-header-icon ag-sort-none-icon ag-hidden"></span>
                        ** <span ref="eText" class="ag-header-cell-text" role="columnheader"></span>
                        <span ref="eFilter" class="ag-header-icon ag-filter-icon"></span>
                    </div>
                </div>`,
    },
  },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
  const gridDiv = document.querySelector('#myGrid');
  new agGrid.Grid(gridDiv, gridOptions);
  
  gridOptions.api.setRowData(sampledata);
});
