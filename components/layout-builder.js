// components/layout-builder.js

export function handleDragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.getAttribute("data-id"));
    event.dataTransfer.effectAllowed = "move";
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

export function handleDrop(appState, event) {
    event.preventDefault();
    const id = parseInt(event.dataTransfer.getData("text/plain"));
    const block = appState.layoutBlocks.find(b => b.id === id);
    console.log(block);
    if (!block) return;

    const layoutBuilder = document.getElementById('layout-builder');
    const rect = layoutBuilder.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const gridSize = 160;
    const col = Math.floor(x / gridSize);
    const row = Math.floor(y / gridSize);

    const maxCols = appState.columns.length;
    const maxRows = appState.columns.length;
    block.x = Math.min(Math.max(col, 0) * gridSize, (maxCols - 1) * gridSize);
    block.y = Math.min(Math.max(row, 0) * gridSize, (maxRows - 1) * gridSize);

    block.gridCol = col;
    block.gridRow = row;
    console.log(block.gridCol, block.gridRow);

    appState.updateLayoutItems();
    appState.updatePreview();
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
    layoutBuilder.innerHTML = '';

    // Create grid cells with dashed lines
    const gridSize = 160; // Adjust as needed
    const maxCols = appState.columns.length;
    const maxRows = appState.columns.length;

    for (let row = 0; row < maxRows; row++) {
        for (let col = 0; col < maxCols; col++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.style.position = 'absolute';
            cell.style.left = col * gridSize + 'px';
            cell.style.top = row * gridSize + 'px';
            cell.style.width = gridSize + 'px';
            cell.style.height = gridSize + 'px';

            // Add dashed borders for inner cells
            if (col < maxCols - 1) {
                cell.style.borderRight = '1px dashed #ccc';
            }
            if (row < maxRows - 1) {
                cell.style.borderBottom = '1px dashed #ccc';
            }

            layoutBuilder.appendChild(cell);
        }
    }

    appState.layoutBlocks.forEach(block => {
        const column = appState.columns.find(col => col.id === block.id);
        if (!column) return;

        const layoutItem = document.createElement('div');
        layoutItem.classList.add('layout-item');
        layoutItem.setAttribute('data-id', block.id);
        layoutItem.style.position = 'absolute';
        layoutItem.style.left = block.x + 'px';
        layoutItem.style.top = block.y + 'px';
        layoutItem.style.width = block.width + 'px';
        layoutItem.style.height = block.height + 'px';
        layoutItem.draggable = true;
        layoutItem.innerHTML = `
            ${column.name}
            <i class="bx bx-bold"></i>
            <i class="bx bx-italic"></i>
            <i class="bx bx-underline"></i>
            <i class="bx bx-align-left"></i>
            <i class="bx bx-align-center"></i>
            <i class="bx bx-align-right"></i>
        `;
        layoutItem.addEventListener('dragstart', (event) => handleDragStart(event)); // Corrected line
        layoutBuilder.appendChild(layoutItem);
    });
}

export function updateLayoutGrid(appState) {
    const layoutGrid = document.getElementById('layout-grid');
    layoutGrid.innerHTML = ''; // Clear existing grid

    const layoutBuilder = document.getElementById('layout-builder');
    const builderWidth = layoutBuilder.clientWidth;
    const builderHeight = layoutBuilder.clientHeight;

    // Calculate cell dimensions based on the layout builder's dimensions
    const cellWidth = builderWidth / (appState.columns.length + 1); // +1 to account for the row numbers column
    const cellHeight = builderHeight / (appState.rows.length + 1); // +1 to account for the header row

    for (let row = 0; row <= appState.rows.length; row++) {
        for (let col = 0; col <= appState.columns.length; col++) {
            const cell = document.createElement('div');
            cell.classList.add('layout-grid-cell');
            cell.style.left = `${col * cellWidth}px`;
            cell.style.top = `${row * cellHeight}px`;
            cell.style.width = `${cellWidth}px`;
            cell.style.height = `${cellHeight}px`;
            layoutGrid.appendChild(cell);
        }
    }

    // Update layout block sizes and positions
    updateLayoutBlocks(appState, cellWidth, cellHeight);
}

export function updateLayoutBlocks(appState, cellWidth, cellHeight) {
    appState.layoutBlocks.forEach(block => {
        const layoutItem = document.querySelector(`.layout-item[data-id="${block.id}"]`);
        if (layoutItem) {
            layoutItem.style.width = `${cellWidth}px`;
            layoutItem.style.height = `${cellHeight}px`;
            layoutItem.style.left = `${block.gridCol * cellWidth}px`;
            layoutItem.style.top = `${block.gridRow * cellHeight}px`;
        }
    });
}

// Resize Observer to update grid and blocks on resize
const layoutBuilder = document.getElementById('layout-builder');
const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        if (entry.target === layoutBuilder) {
            updateLayoutGrid(appState); // Update grid and blocks on resize
        }
    }
});
resizeObserver.observe(layoutBuilder);


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
