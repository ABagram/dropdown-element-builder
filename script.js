import { addColumn, addRow, addGroup, deleteColumn, renderTable, updateDisplayColumnOptions, updateColumnName, updateCell, deleteRow, updateGroup, updateGroupName, updateGroupNames } from './components/element-builder.js';
import { updatePreview, selectItem, generateCode, runCode } from './components/element-preview.js';
import { copyCode } from './components/code-preview.js';
import { handleDragStart, handleDragOver, handleDrop, toggleBold, toggleItalic, toggleUnderline, alignLeft, alignCenter, alignRight, updateLayoutItems } from './components/layout-builder.js';

let columns = [{ id: 0, name: 'Column 1', visible: true }];
let rows = [{ values: columns.map(() => ''), groupId: null }];
let groups = [];
let displayColumnIndex = 0;
let draggedBlock = null;
let layoutBlocks = [];

// Centralized Data and Function Registry
const appState = {
    columns: columns,
    rows: rows,
    groups: groups,
    displayColumnIndex: displayColumnIndex,
    layoutBlocks: layoutBlocks,
    updateColumns: (newColumns) => { appState.columns = newColumns; },
    updateRows: (newRows) => { appState.rows = newRows; },
    updateGroups: (newGroups) => { appState.groups = newGroups; },
    updateDisplayColumnIndex: (newIndex) => { appState.displayColumnIndex = newIndex; },
    updateLayoutBlocks: (newLayoutBlocks) => { appState.layoutBlocks = newLayoutBlocks; },
    renderTable: () => renderTable(appState),
    updatePreview: () => updatePreview(appState),
    updateLayoutItems: () => updateLayoutItems(appState),
    updateDisplayColumnOptions: () => updateDisplayColumnOptions(appState),
    updateColumnName: (columnId, newName) => updateColumnName(appState, columnId, newName),
    updateCell: (rowIndex, colIndex, value) => updateCell(appState, rowIndex, colIndex, value),
    deleteRow: (rowIndex) => deleteRow(appState, rowIndex),
    updateGroup: (rowIndex, groupId) => updateGroup(appState, rowIndex, groupId),
    updateGroupName: (groupId, newName) => updateGroupName(appState, groupId, newName),
    updateGroupNames: () => updateGroupNames(appState),
};

const helpIcon = document.getElementById('help-icon');
const tooltip = document.getElementById('display-column-tooltip');
const addColumnButton = document.getElementById('addColumnButton');
const addRowButton = document.getElementById('addRowButton');
const addGroupButton = document.getElementById('addGroupButton');
const generateCodeButton = document.getElementById('generateCodeButton');
const runCodeButton = document.getElementById('runCodeButton');
const copyButton = document.getElementById('copy-button');
const previewButton = document.getElementById('preview-button');
const previewMenu = document.getElementById('preview-menu');
const layoutBuilder = document.getElementById('layout-builder');

helpIcon.addEventListener('mouseover', () => {
    tooltip.style.display = 'block';
});

helpIcon.addEventListener('mouseout', () => {
    tooltip.style.display = 'none';
});

addColumnButton.addEventListener('click', () => addColumn(appState));
addRowButton.addEventListener('click', () => addRow(appState));
addGroupButton.addEventListener('click', () => addGroup(appState));
generateCodeButton.addEventListener('click', () => generateCode(appState));
runCodeButton.addEventListener('click', () => runCode(appState));
copyButton.addEventListener('click', () => copyCode(appState));
previewButton.addEventListener('click', () => {
    previewMenu.style.display = previewMenu.style.display === 'block' ? 'none' : 'block';
});

document.getElementById('display-column').addEventListener('change', () => updatePreview(appState));

layoutBuilder.addEventListener('dragover', (e) => handleDragOver(appState, e));
layoutBuilder.addEventListener('drop', (e) => handleDrop(appState, e));

document.addEventListener('DOMContentLoaded', () => {
    appState.renderTable();
    appState.updateGroupNames();
    appState.layoutBlocks = appState.columns.map((col, index) => ({
        id: col.id,
        x: index * 160,
        y: 0,
        width: 150,
        height: 50
    }));
    appState.updateLayoutItems();
    appState.updatePreview();
    appState.updateDisplayColumnOptions();

    document.getElementById('table-body').addEventListener('click', (event) => {
        let target = event.target;
        if (target.tagName === 'I') {
            target = target.parentElement;
        }
        if (target.classList.contains('delete-row')) {
            const rowIndex = parseInt(target.getAttribute('data-row-index'));
            appState.deleteRow(rowIndex);
        }
    });

    document.getElementById('table-header').addEventListener('click', (event) => {
        let target = event.target;
        if (target.tagName === 'I') {
            target = target.parentElement;
        }
        if (target.classList.contains('delete-column')) {
            const colId = parseInt(target.getAttribute('data-column-id'));
            deleteColumn(appState, colId);
        }
    });

    document.getElementById('table-body').addEventListener('input', (event) => {
        if (event.target.tagName === 'INPUT') {
            const rowIndex = parseInt(event.target.getAttribute('data-row-index'));
            const colIndex = parseInt(event.target.getAttribute('data-col-index'));
            const value = event.target.value;
            appState.updateCell(rowIndex, colIndex, value);
        }
    });
});