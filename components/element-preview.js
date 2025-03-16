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
    const layoutBuilder = document.getElementById('layout-builder');
    const columns = appState.columns;
    const rows = appState.rows;
    const groups = appState.groups;
    const layoutOrder = Array.from(layoutBuilder.children)
        .filter(child => child.classList.contains('layout-item'))
        .map(child => parseInt(child.getAttribute('data-id')));

    const groupedRows = getGroupedRows(rows);

    menu.innerHTML = Object.entries(groupedRows).map(([groupId, rows]) => {
        const group = groups.find(g => g.id == groupId) || { name: '' };
        return `
            <div class="dropdown-group">
                ${groupId !== 'ungrouped' ? `
                    <div class="group-header" data-group-id="${groupId}">
                        <input value="${group.name}" class="group-name-input">
                    </div>
                ` : ''}
                ${rows.map(row => {
                    const primaryText = row.values[displayColumnIndex] || '';
                    const secondaryInfo = layoutOrder.map(colId => {
                        const colIndex = appState.columns.findIndex(col => col.id === colId);
                        const item = document.querySelector(`.layout-item[data-id="${colId}"]`);
                        const bold = item.querySelector('.bx-bold').classList.contains('active') ? 'font-weight: bold;' : '';
                        const italic = item.querySelector('.bx-italic').classList.contains('active') ? 'font-style: italic;' : '';
                        const underline = item.querySelector('.bx-underline').classList.contains('active') ? 'text-decoration: underline;' : '';
                        const textAlign = item.style.textAlign ? `text-align: ${item.style.textAlign};` : '';
                        return row.values[colIndex] ? `<div style="${bold} ${italic} ${underline} ${textAlign}">${row.values[colIndex]}</div>` : '';
                    }).join('');

                    return `
                        <div class="dropdown-item" data-primary-text="${primaryText}">
                            <div class="item-primary"><b>${primaryText}</b></div>
                            ${secondaryInfo ? `<div class="item-secondary">${secondaryInfo}</div>` : ''}
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
    const layoutOrder = Array.from(layoutBuilder.children)
        .filter(child => child.classList.contains('layout-item'))
        .map(child => parseInt(child.getAttribute('data-id')));

    let dropdownHTML = `
        <div class="dropdown-preview">
            <div class="dropdown-button" onclick="toggleDropdownMenu()">
                <span>Select an option</span>
                <i class="bx bx-chevron-down"></i>
            </div>
            <div class="dropdown-menu" style="display: none;">
                ${Object.entries(getGroupedRows(rows)).map(([groupId, rows]) => {
                    const group = groups.find(g => g.id == groupId) || { name: '' };
                    return `
                        <div class="dropdown-group">
                            ${groupId !== 'ungrouped' ? `
                                <div class="group-header">
                                    ${group.name}
                                </div>
                            ` : ''}
                            ${rows.map(row => {
                                const primaryText = row.values[displayColumnIndex] || '';
                                const secondaryInfo = layoutOrder.map(colId => {
                                    const colIndex = appState.columns.findIndex(col => col.id === colId);
                                    const item = document.querySelector(`.layout-item[data-id="${colId}"]`);
                                    const bold = item.querySelector('.bx-bold').classList.contains('active') ? 'font-weight: bold;' : '';
                                    const italic = item.querySelector('.bx-italic').classList.contains('active') ? 'font-style: italic;' : '';
                                    const underline = item.querySelector('.bx-underline').classList.contains('active') ? 'text-decoration: underline;' : '';
                                    const textAlign = item.style.textAlign ? `text-align: ${item.style.textAlign};` : '';
                                    return row.values[colIndex] ? `<div style="${bold} ${italic} ${underline} <span class="math-inline">\{textAlign\}"\></span>{row.values[colIndex]}</div>` : '';
                                }).join('');

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