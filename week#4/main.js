// Dollhouse Game - JavaScript

// Scene state
let sceneItems = [];
let isDragging = false;
let currentDragItem = null;
let offsetX = 0;
let offsetY = 0;

// DOM elements
let dollhouse;
let creatorNameInput;
let saveSceneBtn;
let loadSceneBtn;
let addTextBtn;
let customTextInput;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏠 Dollhouse Game Loading...');
    
    // Get elements
    dollhouse = document.getElementById('dollhouse');
    creatorNameInput = document.getElementById('creatorName');
    saveSceneBtn = document.getElementById('saveScene');
    loadSceneBtn = document.getElementById('loadScene');
    addTextBtn = document.getElementById('addText');
    customTextInput = document.getElementById('customText');

    if (!dollhouse) {
        console.error('❌ Dollhouse element not found!');
        return;
    }

    // Setup
    setupDraggableItems();
    setupDropZone();
    setupCustomText();
    setupSaveLoad();
    
    console.log('✅ Dollhouse Game Ready!');
});

// Setup draggable items
function setupDraggableItems() {
    const items = document.querySelectorAll('.draggable-item');
    console.log(`Found ${items.length} draggable items`);
    
    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            const emoji = e.target.dataset.item;
            e.dataTransfer.setData('text/plain', emoji);
            console.log('🎯 Dragging:', emoji);
        });
    });
}

// Setup drop zone
function setupDropZone() {
    dollhouse.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    dollhouse.addEventListener('drop', (e) => {
        e.preventDefault();
        
        const emoji = e.dataTransfer.getData('text/plain');
        if (emoji) {
            const rect = dollhouse.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            addItemToScene(emoji, x, y);
        }
    });
}

// Add item to scene
function addItemToScene(content, x, y, itemType = 'emoji') {
    const item = document.createElement('div');
    item.className = 'scene-item';
    
    if (itemType === 'text') {
        item.className += ' text-item';
    }
    
    item.textContent = content;
    item.style.left = `${x}px`;
    item.style.top = `${y}px`;
    
    // Store in scene data
    const itemData = {
        id: Date.now() + Math.random(),
        content: content,
        x: x,
        y: y,
        type: itemType
    };
    sceneItems.push(itemData);
    item.dataset.id = itemData.id;
    
    // Make item draggable within scene
    item.addEventListener('mousedown', startDragging);
    
    // Click to remove (only if not dragging)
    item.addEventListener('click', (e) => {
        if (!isDragging) {
            removeItem(item);
        }
    });
    
    dollhouse.appendChild(item);
    console.log('✨ Added to scene:', content);
}

// Start dragging item in scene
function startDragging(e) {
    currentDragItem = e.target;
    isDragging = false;
    
    const rect = currentDragItem.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);
    
    e.preventDefault();
}

// Drag item
function drag(e) {
    if (!currentDragItem) return;
    
    isDragging = true;
    
    const dollhouseRect = dollhouse.getBoundingClientRect();
    let x = e.clientX - dollhouseRect.left - offsetX;
    let y = e.clientY - dollhouseRect.top - offsetY;
    
    // Keep within bounds
    x = Math.max(0, Math.min(x, dollhouseRect.width - currentDragItem.offsetWidth));
    y = Math.max(0, Math.min(y, dollhouseRect.height - currentDragItem.offsetHeight));
    
    currentDragItem.style.left = `${x}px`;
    currentDragItem.style.top = `${y}px`;
    
    // Update stored position
    const itemId = parseFloat(currentDragItem.dataset.id);
    const itemData = sceneItems.find(item => item.id === itemId);
    if (itemData) {
        itemData.x = x;
        itemData.y = y;
    }
}

// Stop dragging
function stopDragging() {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDragging);
    
    setTimeout(() => {
        isDragging = false;
        currentDragItem = null;
    }, 100);
}

// Remove item
function removeItem(item) {
    const itemId = parseFloat(item.dataset.id);
    sceneItems = sceneItems.filter(i => i.id !== itemId);
    item.remove();
    console.log('🗑️ Removed item');
}

// Setup custom text
function setupCustomText() {
    addTextBtn.addEventListener('click', () => {
        const text = customTextInput.value.trim();
        if (text) {
            const rect = dollhouse.getBoundingClientRect();
            addItemToScene(text, rect.width / 2 - 50, rect.height / 2 - 20, 'text');
            customTextInput.value = '';
        } else {
            alert('Please enter some text!');
        }
    });
    
    // Enter key
    customTextInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTextBtn.click();
        }
    });
}

// Save/Load scenes
function setupSaveLoad() {
    // Save
    saveSceneBtn.addEventListener('click', () => {
        const name = creatorNameInput.value.trim();
        
        if (!name) {
            alert('Please enter your name before saving!');
            return;
        }
        
        if (sceneItems.length === 0) {
            alert('Your scene is empty! Add some items first.');
            return;
        }
        
        const sceneData = {
            creator: name,
            items: sceneItems,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(`dollhouse_${name}`, JSON.stringify(sceneData));
        alert(`✅ Scene saved for ${name}!`);
        console.log('💾 Scene saved:', sceneData);
    });
    
    // Load
    loadSceneBtn.addEventListener('click', () => {
        const name = creatorNameInput.value.trim();
        
        if (!name) {
            alert('Please enter your name to load!');
            return;
        }
        
        const savedData = localStorage.getItem(`dollhouse_${name}`);
        
        if (savedData) {
            const sceneData = JSON.parse(savedData);
            
            // Clear current scene
            clearScene();
            
            // Load items
            sceneData.items.forEach(item => {
                addItemToScene(item.content, item.x, item.y, item.type);
            });
            
            alert(`✅ Scene loaded for ${name}!`);
            console.log('📂 Scene loaded:', sceneData);
        } else {
            alert(`No saved scene found for ${name}.`);
        }
    });
}

// Clear scene
function clearScene() {
    const items = dollhouse.querySelectorAll('.scene-item');
    items.forEach(item => item.remove());
    sceneItems = [];
    console.log('🧹 Scene cleared');
}
