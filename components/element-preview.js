// components/element-preview.js

export function runCode(appState) {
    const preview = document.getElementById('preview-menu');
    const code = document.getElementById('generated-code').textContent;

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%; height:300px; border:none;';

    while (preview.firstChild) {
        preview.removeChild(preview.firstChild);
    }

    preview.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(code);
    iframeDoc.close();
}

export function updatePreview(appState) {
    const displayColumnIndex = document.getElementById('display-column').value;
    const menu = document.getElementById('preview-menu');
    const columns = appState.columns;
    const rows = appState.rows;
    const groups = appState.groups;

    const groupedRows = getGroupedRows(rows);

    menu.innerHTML = Object.entries(groupedRows).map(([groupId, rowsInGroup]) => {
        const group = groups.find(g => g.id == groupId) || { name: '' };
        return `
            <div class="dropdown-group">
                ${groupId !== 'ungrouped' ? `
                    <div class="group-header" data-group-id="${groupId}">
                        <input value="${group.name}" class="group-name-input">
                    </div>
                ` : ''}
                ${rowsInGroup.map(row => {
                    const primaryText = row.values[displayColumnIndex] || '';

                    // Generate secondary info based on grid layout
                    const activeCells = {};
                    appState.layoutBlocks.forEach(block => {
                        if (block.gridCol !== undefined && block.gridRow !== undefined) {
                            activeCells[`${block.gridRow}-${block.gridCol}`] = block;
                        }
                    });

                    const activeRows = new Set();
                    const activeCols = new Set();
                    Object.keys(activeCells).forEach(key => {
                        const [rowGrid, colGrid] = key.split('-');
                        activeRows.add(parseInt(rowGrid));
                        activeCols.add(parseInt(colGrid));
                    });

                    const minRow = Math.min(...activeRows);
                    const maxRow = Math.max(...activeRows);
                    const minCol = Math.min(...activeCols);
                    const maxCol = Math.max(...activeCols);

                    // Create 2D array to store column data
                    const gridData = [];
                    for (let rowGrid = minRow; rowGrid <= maxRow; rowGrid++) {
                        gridData[rowGrid - minRow] = [];
                        for (let colGrid = minCol; colGrid <= maxCol; colGrid++) {
                            gridData[rowGrid - minRow][colGrid - minCol] = '';
                        }
                    }

                    // Populate gridData with column data
                    for (let rowGrid = minRow; rowGrid <= maxRow; rowGrid++) {
                        for (let colGrid = minCol; colGrid <= maxCol; colGrid++) {
                            const block = activeCells[`${rowGrid}-${colGrid}`];
                            if (block) {
                                const colIndex = appState.columns.findIndex(c => c.id === block.id);
                                const item = document.querySelector(`.layout-item[data-id="${block.id}"]`);
                                const bold = item.querySelector('.bx-bold').classList.contains('active') ? 'font-weight: bold;' : '';
                                const italic = item.querySelector('.bx-italic').classList.contains('active') ? 'font-style: italic;' : '';
                                const underline = item.querySelector('.bx-underline').classList.contains('active') ? 'text-decoration: underline;' : '';
                                const textAlign = item.style.textAlign ? `text-align: ${item.style.textAlign};` : '';

                                const rowIndex = rows.findIndex(r => r === row);
                                gridData[rowGrid - minRow][colGrid - minCol] = `<span style="${bold} ${italic} ${underline} ${textAlign}">${rowsInGroup[rowIndex].values[colIndex]}</span>`;
                            }
                        }
                    }

                    // Generate secondaryInfo string from gridData
                    let secondaryInfo = `<div style="display: grid; grid-template-columns: repeat(${maxCol - minCol + 1}, 1fr); grid-gap: 5px;">`;
                    for (let rowGrid = 0; rowGrid < gridData.length; rowGrid++) {
                        for (let colGrid = 0; colGrid < gridData[rowGrid].length; colGrid++) {
                            secondaryInfo += `<div>${gridData[rowGrid][colGrid]}</div>`;
                        }
                    }
                    secondaryInfo += `</div>`;

                    return `
                        <div class="dropdown-item" data-primary-text="${primaryText}" style="display: grid; grid-template-columns: 1fr; grid-gap: 5px;">
                            <div class="item-primary"><b>${primaryText}</b></div>
                            <div class="item-secondary">${secondaryInfo}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }).join('');
}

export function selectItem(appState, value) {
    document.getElementById('preview-button').querySelector('span').textContent = value;
    document.getElementById('preview-menu').style.display = 'none';
}

export function generateCode(appState) {
    const displayColumnIndex = document.getElementById('display-column').value;
    const columns = appState.columns;
    const rows = appState.rows;
    const groups = appState.groups;
    const layoutBuilder = document.getElementById('layout-builder');

    let dropdownHTML = `
        <div class="dropdown-preview">
            <div class="dropdown-button" onclick="toggleDropdownMenu()">
                <span>Select an option</span>
                <i class="bx bx-chevron-down"></i>
            </div>
            <div class="dropdown-menu" style="display: none;">
                ${Object.entries(getGroupedRows(rows)).map(([groupId, rowsInGroup]) => { // Renamed rows to rowsInGroup
                    const group = groups.find(g => g.id == groupId) || { name: '' };
                    return `
                        <div class="dropdown-group">
                            ${groupId !== 'ungrouped' ? `
                                <div class="group-header">
                                    ${group.name}
                                </div>
                            ` : ''}
                            ${rowsInGroup.map(row => { // Use rowsInGroup
                                const primaryText = row.values[displayColumnIndex] || '';

                                // Generate secondary info based on grid layout
                                const activeCells = {};
                                appState.layoutBlocks.forEach(block => {
                                    if (block.gridCol !== undefined && block.gridRow !== undefined) {
                                        activeCells[`${block.gridRow}-${block.gridCol}`] = block;
                                    }
                                });

                                const activeRows = new Set();
                                const activeCols = new Set();
                                Object.keys(activeCells).forEach(key => {
                                    const [row, col] = key.split('-');
                                    activeRows.add(parseInt(row));
                                    activeCols.add(parseInt(col));
                                });

                                const minRow = Math.min(...activeRows);
                                const maxRow = Math.max(...activeRows);
                                const minCol = Math.min(...activeCols);
                                const maxCol = Math.max(...activeCols);

                                let secondaryInfo = '';
                                for (let rowGrid = minRow; rowGrid <= maxRow; rowGrid++) { // Renamed row to rowGrid
                                    for (let colGrid = minCol; colGrid <= maxCol; colGrid++) { // Renamed col to colGrid
                                        const block = activeCells[`${rowGrid}-${colGrid}`];
                                        if (block) {
                                            const colIndex = appState.columns.findIndex(c => c.id === block.id);
                                            const item = document.querySelector(`.layout-item[data-id="${block.id}"]`);
                                            const bold = item.querySelector('.bx-bold').classList.contains('active') ? 'font-weight: bold;' : '';
                                            const italic = item.querySelector('.bx-italic').classList.contains('active') ? 'font-style: italic;' : '';
                                            const underline = item.querySelector('.bx-underline').classList.contains('active') ? 'text-decoration: underline;' : '';
                                            const textAlign = item.style.textAlign ? `text-align: ${item.style.textAlign};` : '';
                                            secondaryInfo += row.values[colIndex] ? `<div style="${bold} ${italic} ${underline} ${textAlign}">${row.values[colIndex]}</div>` : '';
                                        } else {
                                            secondaryInfo += ''; // Empty cell
                                        }
                                    }
                                    if (rowGrid < maxRow) {
                                        secondaryInfo += '<br>';
                                    }
                                }

                                return `
                                    <div class="dropdown-item">
                                        <div class="item-primary"><b>${primaryText}</b></div>
                                        ${secondaryInfo ? `<div class="item-secondary">${secondaryInfo}</div>` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
        <script>
            function toggleDropdownMenu() {
                const menu = document.querySelector('.dropdown-menu');
                menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
            }
        </script>
    `;

    const codePreview = document.getElementById('generated-code');
    codePreview.textContent = dropdownHTML;
    if(codePreview.textContent) {
        Prism.highlightAll();
    }
}

function getGroupedRows(rows) {
    const groupedRows = {};
    rows.forEach((row) => {
        const groupId = row.groupId || 'ungrouped';
        if (!groupedRows[groupId]) {
            groupedRows[groupId] = [];
        }
        groupedRows[groupId].push(row);
    });
    return groupedRows;
    }