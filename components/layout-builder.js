// components/layout-builder.js

export function handleDragStart(appState, e, colId) {
    appState.draggedBlock = {
        id: colId,
        width: 150,
        height: 50
    };
    e.dataTransfer.setData('text/plain', '');
    e.dataTransfer.effectAllowed = 'move';
}

export function handleDragOver(appState, e) {
    e.preventDefault();
    const layoutBuilder = document.getElementById('layout-builder');
    const rect = layoutBuilder.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update visual feedback
    layoutBuilder.style.backgroundColor = '#f1f5f9';
}

export function handleDrop(appState, e) {
    e.preventDefault();
    const layoutBuilder = document.getElementById('layout-builder');
    const rect = layoutBuilder.getBoundingClientRect();
    const dropCoords = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };

    const existingBlocks = appState.layoutBlocks.map(b => ({ ...b }));

    const newBlocks = handleBlockDrop(
        appState,
        dropCoords,
        existingBlocks,
        { width: 150, height: 50 }
    );

    appState.updateLayoutBlocks(newBlocks);
    updateLayoutPositions(appState, appState.layoutBlocks);
    layoutBuilder.style.backgroundColor = '';
}

export function updateLayoutPositions(appState, blocks) {
    blocks.forEach(block => {
        const element = document.querySelector(`.layout-item[data-id="${block.id}"]`);
        if (element) {
            element.style.left = `${block.x}px`;
            element.style.top = `${block.y}px`;
        }
    });
}

export function toggleBold(appState, columnId) {
    const button = document.querySelector(`.layout-item[data-id="${columnId}"] .bx-bold`);
    button.classList.toggle('active');
    appState.updatePreview();
}

export function toggleItalic(appState, columnId) {
    const button = document.querySelector(`.layout-item[data-id="${columnId}"] .bx-italic`);
    button.classList.toggle('active');
    appState.updatePreview();
}

export function toggleUnderline(appState, columnId) {
    const button = document.querySelector(`.layout-item[data-id="${columnId}"] .bx-underline`);
    button.classList.toggle('active');
    appState.updatePreview();
}

export function alignLeft(appState, columnId) {
    const button = document.querySelector(`.layout-item[data-id="${columnId}"] .bx-align-left`);
    button.classList.add('active');
    document.querySelector(`.layout-item[data-id="${columnId}"] .bx-align-middle`).classList.remove('active');
    document.querySelector(`.layout-item[data-id="${columnId}"] .bx-align-right`).classList.remove('active');
    document.querySelector(`.layout-item[data-id="${columnId}"]`).style.textAlign = 'left';
    appState.updatePreview();
}

export function alignCenter(appState, columnId) {
    const button = document.querySelector(`.layout-item[data-id="${columnId}"] .bx-align-middle`);
    button.classList.add('active');
    document.querySelector(`.layout-item[data-id="${columnId}"] .bx-align-left`).classList.remove('active');
    document.querySelector(`.layout-item[data-id="${columnId}"] .bx-align-right`).classList.remove('active');
    document.querySelector(`.layout-item[data-id="${columnId}"]`).style.textAlign = 'center';
    appState.updatePreview();
}

export function alignRight(appState, columnId) {
    const button = document.querySelector(`.layout-item[data-id="${columnId}"] .bx-align-right`);
    button.classList.add('active');
    document.querySelector(`.layout-item[data-id="${columnId}"] .bx-align-left`).classList.remove('active');
    document.querySelector(`.layout-item[data-id="${columnId}"] .bx-align-middle`).classList.remove('active');
    document.querySelector(`.layout-item[data-id="${columnId}"]`).style.textAlign = 'right';
    appState.updatePreview();
}

export function updateLayoutItems(appState) {
    const layoutBuilder = document.getElementById('layout-builder');
    layoutBuilder.innerHTML = ''; // Clear existing items

    appState.layoutBlocks.forEach(block => {
        const layoutItem = document.createElement('div');
        layoutItem.classList.add('layout-item');
        layoutItem.setAttribute('data-id', block.id);
        layoutItem.style.left = `${block.x}px`;
        layoutItem.style.top = `${block.y}px`;
        layoutItem.draggable = true;
        layoutItem.ondragstart = (e) => handleDragStart(appState, e, block.id);

        layoutItem.innerHTML = `
            <div class="column-name">${appState.columns.find(col => col.id === block.id).name}</div>
            <div class="formatting-buttons">
                <button class="toggle-formatting" onclick="appState.toggleBold(${block.id})"><i class="bx bx-bold"></i></button>
                <button class="toggle-formatting" onclick="appState.toggleItalic(${block.id})"><i class="bx bx-italic"></i></button>
                <button class="toggle-formatting" onclick="appState.toggleUnderline(${block.id})"><i class="bx bx-underline"></i></button>
                <button class="toggle-formatting" onclick="appState.alignLeft(${block.id})"><i class="bx bx-align-left"></i></button>
                <button class="toggle-formatting" onclick="appState.alignCenter(${block.id})"><i class="bx bx-align-middle"></i></button>
                <button class="toggle-formatting" onclick="appState.alignRight(${block.id})"><i class="bx bx-align-right"></i></button>
            </div>
        `;
        layoutBuilder.appendChild(layoutItem);
    });

    // Keep existing drag event listeners
    layoutBuilder.addEventListener('dragover', (e) => handleDragOver(appState, e));
    layoutBuilder.addEventListener('drop', (e) => handleDrop(appState, e));
}

function handleBlockDrop(appState, dropCoords, existingBlocks, blockDimensions) {
    const newBlock = {
        id: appState.draggedBlock.id,
        x: dropCoords.x,
        y: dropCoords.y,
        width: blockDimensions.width,
        height: blockDimensions.height
    };

    // Remove the dragged block from its original position
    const updatedBlocks = existingBlocks.filter(block => block.id !== appState.draggedBlock.id);

    // Add the new block
    updatedBlocks.push(newBlock);

    return updatedBlocks;
}
