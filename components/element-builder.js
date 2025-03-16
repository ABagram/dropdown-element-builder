// components/element-builder.js

export function addColumn(appState) {
    const newId = appState.columns.length;
    appState.updateColumns([...appState.columns, {
        id: newId,
        name: `Column ${newId + 1}`,
        visible: true
    }]);
    appState.renderTable();
    appState.updateDisplayColumnOptions();
    appState.updateLayoutItems();
}

export function addGroup(appState) {
    const groupId = appState.groups.length + 1;
    appState.updateGroups([...appState.groups, {
        id: groupId,
        name: `Group ${groupId}`,
        rows: []
    }]);
    appState.renderTable();
    appState.updateGroupNames();
    appState.updatePreview();
}

export function deleteColumn(appState, columnId) {
    appState.updateColumns(appState.columns.filter(col => col.id !== columnId));
    appState.renderTable();
    appState.updateDisplayColumnOptions();
    appState.updateLayoutItems();
}

export function addRow(appState) {
    appState.updateRows([...appState.rows, {
        values: appState.columns.map(() => ''),
        groupId: null
    }]);
    appState.renderTable();
}

export function updateDisplayColumnOptions(appState) {
    const select = document.getElementById('display-column');
    select.innerHTML = appState.columns
        .map((col, index) => `<option value="${index}">${col.name}</option>`)
        .join('');
}

export function renderTable(appState) {
    const header = document.getElementById('table-header');
    const body = document.getElementById('table-body');

    header.innerHTML = `
        <th>#</th>
        ${appState.columns.map(col => `
            <th>
                <div class="column-header">
                    <input class="table-input" value="${col.name}" 
                        onchange="appState.updateColumnName(appState, ${col.id}, this.value)">
                    <button class="btn" onclick="appState.deleteColumn(appState, ${col.id})" 
                        style="border: none; background: none; padding: 4px 8px">
                        <i class="bx bx-x"></i>
                    </button>
                </div>
            </th>
        `).join('')}
        <th>Group</th><th>Actions</th>`;

        body.innerHTML = appState.rows.map((row, rowIndex) => `
        <tr>
            <td>${rowIndex + 1}</td>
            ${appState.columns.map((col, colIndex) => `
                <td>
                    <input class="table-input" 
                        value="${row.values[colIndex] || ''}" 
                        onchange="appState.updateCell(appState, ${rowIndex}, ${colIndex}, this.value)">
                </td>
            `).join('')}
            <td>
                <select onchange="appState.updateGroup(appState, ${rowIndex}, this.value)">
                    <option value="">No Group</option>
                    ${appState.groups.map(group => `
                        <option value="${group.id}" ${row.groupId === group.id ? 'selected' : ''}>
                            ${group.name}
                        </option>
                    `).join('')}
                </select>
            </td>
            <td>
                <button class="btn" onclick="appState.deleteRow(appState, ${rowIndex})" 
                    style="background: none; border: none; padding: 4px 8px">
                    <i class="bx bx-trash-alt"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

export function updateColumnName(appState, columnId, newName) {
    const updatedColumns = appState.columns.map(col => col.id === columnId ? { ...col, name: newName } : col);
    appState.updateColumns(updatedColumns);
    appState.updateDisplayColumnOptions();
    appState.updatePreview();
}

export function updateCell(appState, rowIndex, colIndex, value) {
    const updatedRows = appState.rows.map((row, index) => index === rowIndex ? { ...row, values: row.values.map((val, i) => i === colIndex ? value : val) } : row);
    appState.updateRows(updatedRows);
    appState.updatePreview();
}

export function deleteRow(appState, rowIndex) {
    const updatedRows = appState.rows.filter((row, index) => index !== rowIndex);
    appState.updateRows(updatedRows);
    appState.renderTable();
    appState.updatePreview();
}

export function updateGroup(appState, rowIndex, groupId) {
    const updatedRows = appState.rows.map((row, index) => index === rowIndex ? { ...row, groupId: groupId ? parseInt(groupId) : null } : row);
    appState.updateRows(updatedRows);
    appState.updatePreview();
}

export function updateGroupName(appState, groupId, newName) {
    const updatedGroups = appState.groups.map(group => group.id === groupId ? { ...group, name: newName } : group);
    appState.updateGroups(updatedGroups);
    appState.updatePreview();
}

export function updateGroupNames(appState) {
    const container = document.getElementById('group-names');
    container.innerHTML = appState.groups.map(group => `
        <div style="margin-bottom: 8px;">
            <input class="table-input" value="${group.name}" onchange="appState.updateGroupName(appState, ${group.id}, this.value)">
        </div>
    `).join('');
}
