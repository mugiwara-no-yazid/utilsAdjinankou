(function () {
    'use strict';

    const canvas = document.getElementById('canvas-v2');
    const ctx = canvas.getContext('2d');
    const contextPanel = document.getElementById('contextPanel');

    let images = [];
    let texts = [];
    let nextImageId = 1;
    let nextTextId = 1;
    let selectedElement = null;
    let isDragging = false;
    let isResizing = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let resizeHandle = null;
    let elementBounds = { images: [], texts: [] };
    let bgImage = null;
    let currentFormat = [1080, 1080];

    // Init
    function init() {
        updateCanvasSize();
        setupEventListeners();
        render();

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateCanvasSize();
                render();
            }, 100);
        });
    }

    function updateCanvasSize() {
        const [w, h] = currentFormat;
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

        let maxWidth, maxHeight;

        if (isMobile) {
            maxWidth = Math.min(window.innerWidth - 60, 500);
            maxHeight = window.innerHeight * 0.5;
        } else if (isTablet) {
            maxWidth = Math.min(window.innerWidth - 100, 700);
            maxHeight = 600;
        } else {
            const previewContainer = document.querySelector('.bgv2-preview');
            if (previewContainer) {
                maxWidth = previewContainer.clientWidth - 64;
            } else {
                maxWidth = Math.min(window.innerWidth * 0.4, 700);
            }
            maxHeight = 600;
        }

        const scale = Math.min(maxWidth / w, maxHeight / h, 1);
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = (w * scale) + 'px';
        canvas.style.height = (h * scale) + 'px';
    }

    function setupEventListeners() {
        // Format
        document.getElementById('bgFormatSelect').addEventListener('change', (e) => {
            currentFormat = e.target.value.split(',').map(Number);
            updateCanvasSize();
            render();
        });

        // Background type
        document.getElementById('bgType').addEventListener('change', (e) => {
            const type = e.target.value;
            document.getElementById('bgColorControls').style.display = type === 'color' ? 'block' : 'none';
            document.getElementById('bgGradientControls').style.display = type === 'gradient' ? 'block' : 'none';
            document.getElementById('bgImageControls').style.display = type === 'image' ? 'block' : 'none';
            render();
        });

        // Couleur fond
        setupColorPicker('bgColor', 'bgColorDisplay', 'bgColorText', () => render());

        // Gradient
        document.getElementById('bgGradientType').addEventListener('change', () => render());
        document.getElementById('bgGradAngle').addEventListener('input', (e) => {
            document.getElementById('bgGradAngleVal').textContent = e.target.value + '°';
            render();
        });
        setupColorPicker('bgGrad1', 'bgGrad1Display', 'bgGrad1Text', () => render());
        setupColorPicker('bgGrad2', 'bgGrad2Display', 'bgGrad2Text', () => render());

        // Background image
        document.getElementById('bgImageInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const img = new Image();
                    img.onload = () => {
                        bgImage = img;
                        render();
                    };
                    img.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById('bgImageFit').addEventListener('change', () => render());

        // Canvas events
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mouseleave', onMouseUp);
        canvas.addEventListener('dblclick', onDoubleClick);

        // Touch events
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', onTouchEnd);
    }

    let lastTapTime = 0;
    let lastTapElement = null;

    function onTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;

        const now = Date.now();
        const clicked = getElementAt(x, y);
        if (clicked && clicked.type === 'text' &&
            lastTapElement && lastTapElement.id === clicked.id &&
            now - lastTapTime < 300) {
            onDoubleTap(touch);
            lastTapTime = 0;
            lastTapElement = null;
            return;
        }
        lastTapTime = now;
        lastTapElement = clicked;

        if (selectedElement) {
            const handle = getResizeHandle(x, y);
            if (handle) {
                isResizing = true;
                resizeHandle = handle;
                dragStartX = x;
                dragStartY = y;
                return;
            }
        }

        if (clicked) {
            selectedElement = clicked;
            isDragging = true;
            dragStartX = x - clicked.x;
            dragStartY = y - clicked.y;
            showContextPanel();
            render();
        } else {
            deselectElement();
        }
    }

    function onTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;

        if (isResizing && selectedElement) {
            handleResize(x, y);
            render();
        } else if (isDragging && selectedElement) {
            if (selectedElement.type === 'image') {
                const img = images.find(i => i.id === selectedElement.id);
                if (img) {
                    img.x = x - dragStartX;
                    img.y = y - dragStartY;
                    selectedElement.x = img.x;
                    selectedElement.y = img.y;
                }
            } else if (selectedElement.type === 'text') {
                const txt = texts.find(t => t.id === selectedElement.id);
                if (txt) {
                    txt.x = x - dragStartX;
                    txt.y = y - dragStartY;
                    selectedElement.x = txt.x;
                    selectedElement.y = txt.y;
                }
            }
            render();
        }
    }

    function onTouchEnd() {
        isDragging = false;
        isResizing = false;
        resizeHandle = null;
    }

    function onDoubleTap(touch) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (touch.clientX - rect.left) * scaleX;
        const y = (touch.clientY - rect.top) * scaleY;

        const clicked = getElementAt(x, y);
        if (clicked && clicked.type === 'text') {
            editTextInline(clicked.id);
        }
    }

    function onDoubleClick(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const clicked = getElementAt(x, y);
        if (clicked && clicked.type === 'text') {
            editTextInline(clicked.id);
        }
    }

    function editTextInline(textId) {
        const txt = texts.find(t => t.id === textId);
        if (!txt) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const textScreenX = rect.left + (txt.x / scaleX);
        const textScreenY = rect.top + (txt.y / scaleY);

        const input = document.createElement('textarea');
        input.value = txt.content;
        input.style.position = 'fixed';
        input.style.left = textScreenX + 'px';
        input.style.top = textScreenY + 'px';
        input.style.transform = 'translate(-50%, -50%)';
        input.style.minWidth = '150px';
        input.style.minHeight = Math.max(40, txt.size / scaleY) + 'px';
        input.style.padding = '8px 12px';
        input.style.fontSize = Math.max(16, txt.size / scaleY) + 'px';
        input.style.fontFamily = txt.font;
        input.style.fontWeight = txt.bold ? 'bold' : 'normal';
        input.style.fontStyle = txt.italic ? 'italic' : 'normal';
        input.style.color = txt.color;
        input.style.textAlign = 'center';
        input.style.border = '2px solid #667eea';
        input.style.borderRadius = '6px';
        input.style.background = 'rgba(255, 255, 255, 0.98)';
        input.style.zIndex = '10000';
        input.style.outline = 'none';
        input.style.resize = 'none';
        input.style.overflow = 'hidden';

        document.body.appendChild(input);
        input.focus();
        input.select();

        const autoResize = () => {
            // 1. On force la hauteur à auto pour que le textarea se "rétracte"
            input.style.height = 'auto';

            // 2. On mesure maintenant la hauteur réelle du contenu
            // et on l'applique immédiatement
            input.style.height = input.scrollHeight + 'px';

            // Idem pour la largeur si tu l'utilises
            input.style.width = 'auto';
            input.style.width = Math.max(150, input.scrollWidth + 20) + 'px';
        };
        autoResize();
        input.addEventListener('input', autoResize);

        const finishEdit = () => {
            txt.content = input.value || 'Votre texte ici';
            if (selectedElement && selectedElement.id === txt.id) {
                selectedElement.content = txt.content;
                showContextPanel();
            }
            document.body.removeChild(input);
            render();
        };

        input.addEventListener('blur', finishEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') finishEdit();
        });
    }

    function setupColorPicker(inputId, displayId, textId, callback) {
        const input = document.getElementById(inputId);
        const display = document.getElementById(displayId);
        const text = document.getElementById(textId);

        input.addEventListener('input', (e) => {
            const color = e.target.value;
            display.style.background = color;
            text.value = color;
            callback();
        });

        text.addEventListener('input', (e) => {
            const color = e.target.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                input.value = color;
                display.style.background = color;
                callback();
            }
        });
    }

    function onMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        if (selectedElement) {
            const handle = getResizeHandle(x, y);
            if (handle) {
                isResizing = true;
                resizeHandle = handle;
                dragStartX = x;
                dragStartY = y;
                return;
            }
        }

        const clicked = getElementAt(x, y);
        if (clicked) {
            selectedElement = clicked;
            isDragging = true;
            dragStartX = x - clicked.x;
            dragStartY = y - clicked.y;
            showContextPanel();
            render();
        } else {
            deselectElement();
        }
    }

    function onMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        if (isResizing && selectedElement) {
            handleResize(x, y);
            render();
        } else if (isDragging && selectedElement) {
            if (selectedElement.type === 'image') {
                const img = images.find(i => i.id === selectedElement.id);
                if (img) {
                    img.x = x - dragStartX;
                    img.y = y - dragStartY;
                    selectedElement.x = img.x;
                    selectedElement.y = img.y;
                }
            } else if (selectedElement.type === 'text') {
                const txt = texts.find(t => t.id === selectedElement.id);
                if (txt) {
                    txt.x = x - dragStartX;
                    txt.y = y - dragStartY;
                    selectedElement.x = txt.x;
                    selectedElement.y = txt.y;
                }
            }
            render();
        } else {
            updateCursor(x, y);
        }
    }

    function onMouseUp() {
        isDragging = false;
        isResizing = false;
        resizeHandle = null;
    }

    function getElementAt(x, y) {
        for (let i = texts.length - 1; i >= 0; i--) {
            const b = elementBounds.texts.find(b => b.id === texts[i].id);
            if (b && x >= b.left && x <= b.right && y >= b.top && y <= b.bottom) {
                return { type: 'text', id: texts[i].id, ...texts[i] };
            }
        }
        for (let i = images.length - 1; i >= 0; i--) {
            const b = elementBounds.images.find(b => b.id === images[i].id);
            if (b && x >= b.left && x <= b.right && y >= b.top && y <= b.bottom) {
                return { type: 'image', id: images[i].id, ...images[i] };
            }
        }
        return null;
    }

    function getResizeHandle(x, y) {
        if (!selectedElement) return null;
        const b = selectedElement.type === 'image'
            ? elementBounds.images.find(b => b.id === selectedElement.id)
            : elementBounds.texts.find(b => b.id === selectedElement.id);

        if (!b) return null;

        const size = 10;
        const handles = [
            { name: 'nw', x: b.left, y: b.top },
            { name: 'ne', x: b.right, y: b.top },
            { name: 'sw', x: b.left, y: b.bottom },
            { name: 'se', x: b.right, y: b.bottom }
        ];

        for (const h of handles) {
            if (Math.abs(x - h.x) < size && Math.abs(y - h.y) < size) {
                return h.name;
            }
        }
        return null;
    }

    function handleResize(x, y) {
        if (selectedElement.type === 'image') {
            const img = images.find(i => i.id === selectedElement.id);
            if (!img) return;
            const dx = x - dragStartX;
            const dy = y - dragStartY;
            const delta = (dx + dy) / 2;
            img.scale = Math.max(10, Math.min(500, img.scale + delta * 0.5));
            dragStartX = x;
            dragStartY = y;
            selectedElement.scale = img.scale;
            if (!contextPanel.classList.contains('hidden')) {
                showContextPanel();
            }
        } else if (selectedElement.type === 'text') {
            const txt = texts.find(t => t.id === selectedElement.id);
            if (!txt) return;
            const dx = x - dragStartX;
            txt.size = Math.max(12, Math.min(300, txt.size + dx * 0.3));
            dragStartX = x;
            dragStartY = y;
            selectedElement.size = txt.size;
            if (!contextPanel.classList.contains('hidden')) {
                showContextPanel();
            }
        }
    }

    function updateCursor(x, y) {
        const handle = getResizeHandle(x, y);
        if (handle) {
            canvas.style.cursor = handle + '-resize';
        } else if (getElementAt(x, y)) {
            canvas.style.cursor = 'move';
        } else {
            canvas.style.cursor = 'default';
        }
    }

    function showContextPanel() {
        contextPanel.classList.remove('hidden');

        if (selectedElement.type === 'image') {
            const img = images.find(i => i.id === selectedElement.id);
            contextPanel.innerHTML = `
        <div class="bgv2-context-header">
          <div class="bgv2-context-title">Image</div>
          <button class="bgv2-close-btn" onclick="closePanel()">×</button>
        </div>
        
        <div class="bgv2-slider-group">
          <div class="bgv2-slider-label">
            <label class="bgv2-label" style="margin: 0;">Taille</label>
            <span id="ctx-scale-val" class="bgv2-slider-value">${Math.round(img.scale)}%</span>
          </div>
          <input type="range" id="ctx-scale" min="10" max="500" value="${img.scale}" class="bgv2-slider">
        </div>

        <div class="bgv2-slider-group">
          <div class="bgv2-slider-label">
            <label class="bgv2-label" style="margin: 0;">Opacité</label>
            <span id="ctx-opacity-val" class="bgv2-slider-value">${Math.round(img.opacity)}%</span>
          </div>
          <input type="range" id="ctx-opacity" min="0" max="100" value="${img.opacity}" class="bgv2-slider">
        </div>

        <div class="bgv2-context-actions">
          <button class="bgv2-button bgv2-button-secondary" onclick="replaceImage()">Remplacer l'image</button>
          <button class="bgv2-button bgv2-button-secondary" onclick="duplicateElement()">Dupliquer</button>
          <button class="bgv2-button bgv2-button-danger" onclick="deleteElement()">Supprimer</button>
        </div>
      `;

            document.getElementById('ctx-scale').addEventListener('input', (e) => {
                img.scale = parseFloat(e.target.value);
                selectedElement.scale = img.scale;
                document.getElementById('ctx-scale-val').textContent = Math.round(img.scale) + '%';
                render();
            });

            document.getElementById('ctx-opacity').addEventListener('input', (e) => {
                img.opacity = parseFloat(e.target.value);
                selectedElement.opacity = img.opacity;
                document.getElementById('ctx-opacity-val').textContent = Math.round(img.opacity) + '%';
                render();
            });

        } else if (selectedElement.type === 'text') {
            const txt = texts.find(t => t.id === selectedElement.id);
            contextPanel.innerHTML = `
        <div class="bgv2-context-header">
          <div class="bgv2-context-title">Texte</div>
          <button class="bgv2-close-btn" onclick="closePanel()">×</button>
        </div>
        
        <div class="bgv2-section">
          <label class="bgv2-label">Contenu</label>
          <textarea id="ctx-content" class="bgv2-textarea">${txt.content}</textarea>
          <p class="bgv2-hint">Double-cliquez sur le texte pour éditer</p>
        </div>

        <div class="bgv2-section">
          <label class="bgv2-label">Police</label>
          <select id="ctx-font" class="bgv2-select">
            <optgroup label="Sans-Serif">
              <option value="Inter" ${txt.font === 'Inter' ? 'selected' : ''}>Inter</option>
              <option value="Roboto" ${txt.font === 'Roboto' ? 'selected' : ''}>Roboto</option>
              <option value="'Open Sans'" ${txt.font === "'Open Sans'" ? 'selected' : ''}>Open Sans</option>
              <option value="Lato" ${txt.font === 'Lato' ? 'selected' : ''}>Lato</option>
              <option value="Montserrat" ${txt.font === 'Montserrat' ? 'selected' : ''}>Montserrat</option>
              <option value="Poppins" ${txt.font === 'Poppins' ? 'selected' : ''}>Poppins</option>
            </optgroup>
            <optgroup label="Serif">
              <option value="Merriweather" ${txt.font === 'Merriweather' ? 'selected' : ''}>Merriweather</option>
              <option value="'Playfair Display'" ${txt.font === "'Playfair Display'" ? 'selected' : ''}>Playfair Display</option>
            </optgroup>
            <optgroup label="Display">
              <option value="'Bebas Neue'" ${txt.font === "'Bebas Neue'" ? 'selected' : ''}>Bebas Neue</option>
              <option value="Anton" ${txt.font === 'Anton' ? 'selected' : ''}>Anton</option>
            </optgroup>
          </select>
        </div>

        <div class="bgv2-section">
          <label class="bgv2-label">Style</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 8px; background: #f9fafb; border-radius: 6px;">
              <input type="checkbox" id="ctx-bold" ${txt.bold ? 'checked' : ''}>
              <span style="font-weight: 700;">Gras</span>
            </label>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 8px; background: #f9fafb; border-radius: 6px;">
              <input type="checkbox" id="ctx-italic" ${txt.italic ? 'checked' : ''}>
              <span style="font-style: italic;">Italique</span>
            </label>
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; padding: 8px; background: #f9fafb; border-radius: 6px;">
              <input type="checkbox" id="ctx-underline" ${txt.underline ? 'checked' : ''}>
              <span style="text-decoration: underline;">Souligné</span>
            </label>
          </div>
        </div>

        <div class="bgv2-slider-group">
          <div class="bgv2-slider-label">
            <label class="bgv2-label" style="margin: 0;">Taille</label>
            <span id="ctx-size-val" class="bgv2-slider-value">${Math.round(txt.size)}px</span>
          </div>
          <input type="range" id="ctx-size" min="12" max="300" value="${txt.size}" class="bgv2-slider">
        </div>

        <div class="bgv2-section">
          <label class="bgv2-label">Couleur</label>
          <div class="bgv2-color-picker">
            <div class="bgv2-color-pastille">
              <div class="bgv2-color-display" id="ctx-color-display" style="background: ${txt.color};"></div>
              <input type="color" id="ctx-color" value="${txt.color}" class="bgv2-color-input">
            </div>
            <input type="text" id="ctx-color-text" value="${txt.color}" class="bgv2-color-text">
          </div>
        </div>

        <div class="bgv2-context-actions">
          <button class="bgv2-button bgv2-button-secondary" onclick="duplicateElement()">Dupliquer</button>
          <button class="bgv2-button bgv2-button-danger" onclick="deleteElement()">Supprimer</button>
        </div>
      `;

            document.getElementById('ctx-content').addEventListener('input', (e) => {
                txt.content = e.target.value;
                selectedElement.content = txt.content;
                render();
            });

            document.getElementById('ctx-font').addEventListener('change', (e) => {
                txt.font = e.target.value;
                selectedElement.font = txt.font;
                render();
            });

            document.getElementById('ctx-bold').addEventListener('change', (e) => {
                txt.bold = e.target.checked;
                selectedElement.bold = txt.bold;
                render();
            });

            document.getElementById('ctx-italic').addEventListener('change', (e) => {
                txt.italic = e.target.checked;
                selectedElement.italic = txt.italic;
                render();
            });

            document.getElementById('ctx-underline').addEventListener('change', (e) => {
                txt.underline = e.target.checked;
                selectedElement.underline = txt.underline;
                render();
            });

            document.getElementById('ctx-size').addEventListener('input', (e) => {
                txt.size = parseFloat(e.target.value);
                selectedElement.size = txt.size;
                document.getElementById('ctx-size-val').textContent = Math.round(txt.size) + 'px';
                render();
            });

            setupColorPicker('ctx-color', 'ctx-color-display', 'ctx-color-text', () => {
                txt.color = document.getElementById('ctx-color').value;
                selectedElement.color = txt.color;
                render();
            });
        }
    }

    function deselectElement() {
        selectedElement = null;
        contextPanel.classList.add('hidden');
        contextPanel.innerHTML = '<div class="bgv2-empty-state">Sélectionnez un élément<br />dans le canvas<br />pour le modifier</div>';
        render();
    }

    // Global functions
    window.closePanel = function () {
        deselectElement();
    };

    window.addImage = function () {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const img = new Image();
                    img.onload = () => {
                        images.push({
                            id: nextImageId++,
                            image: img,
                            x: canvas.width / 2,
                            y: canvas.height / 2,
                            scale: 100,
                            opacity: 100
                        });
                        render();
                    };
                    img.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    window.addText = function () {
        texts.push({
            id: nextTextId++,
            content: 'Votre texte ici',
            x: canvas.width / 2,
            y: canvas.height / 2,
            size: 48,
            font: 'Inter',
            color: '#000000',
            bold: false,
            italic: false,
            underline: false
        });
        render();
    };

    window.duplicateElement = function () {
        if (!selectedElement) return;

        if (selectedElement.type === 'image') {
            const orig = images.find(i => i.id === selectedElement.id);
            if (orig) {
                images.push({
                    id: nextImageId++,
                    image: orig.image,
                    x: orig.x + 20,
                    y: orig.y + 20,
                    scale: orig.scale,
                    opacity: orig.opacity
                });
            }
        } else {
            const orig = texts.find(t => t.id === selectedElement.id);
            if (orig) {
                texts.push({
                    id: nextTextId++,
                    content: orig.content,
                    x: orig.x + 20,
                    y: orig.y + 20,
                    size: orig.size,
                    font: orig.font,
                    color: orig.color,
                    bold: orig.bold || false,
                    italic: orig.italic || false,
                    underline: orig.underline || false
                });
            }
        }
        render();
    };

    window.deleteElement = function () {
        if (!selectedElement) return;

        if (selectedElement.type === 'image') {
            images = images.filter(i => i.id !== selectedElement.id);
        } else {
            texts = texts.filter(t => t.id !== selectedElement.id);
        }
        deselectElement();
    };

    window.replaceImage = function () {
        if (!selectedElement || selectedElement.type !== 'image') return;

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const img = new Image();
                    img.onload = () => {
                        const targetImg = images.find(i => i.id === selectedElement.id);
                        if (targetImg) {
                            targetImg.image = img;
                            selectedElement.image = img;
                            render();
                        }
                    };
                    img.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    window.exportBanner = function () {
        const link = document.createElement('a');
        const format = currentFormat.join('x');
        link.download = `banniere-${format}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();
    };

    // Render
    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        const bgType = document.getElementById('bgType').value;
        if (bgType === 'color') {
            ctx.fillStyle = document.getElementById('bgColor').value;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (bgType === 'gradient') {
            const type = document.getElementById('bgGradientType').value;
            const angle = parseInt(document.getElementById('bgGradAngle').value);
            const c1 = document.getElementById('bgGrad1').value;
            const c2 = document.getElementById('bgGrad2').value;

            let gradient;
            if (type === 'linear') {
                const rad = angle * Math.PI / 180;
                const x1 = canvas.width / 2 - Math.cos(rad) * canvas.width / 2;
                const y1 = canvas.height / 2 - Math.sin(rad) * canvas.height / 2;
                const x2 = canvas.width / 2 + Math.cos(rad) * canvas.width / 2;
                const y2 = canvas.height / 2 + Math.sin(rad) * canvas.height / 2;
                gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            } else {
                gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
            }
            gradient.addColorStop(0, c1);
            gradient.addColorStop(1, c2);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (bgType === 'image' && bgImage) {
            const fitMode = document.getElementById('bgImageFit').value;

            if (fitMode === 'cover') {
                const scale = Math.max(canvas.width / bgImage.width, canvas.height / bgImage.height);
                const w = bgImage.width * scale;
                const h = bgImage.height * scale;
                const x = (canvas.width - w) / 2;
                const y = (canvas.height - h) / 2;
                ctx.drawImage(bgImage, x, y, w, h);
            } else if (fitMode === 'contain') {
                const scale = Math.min(canvas.width / bgImage.width, canvas.height / bgImage.height);
                const w = bgImage.width * scale;
                const h = bgImage.height * scale;
                const x = (canvas.width - w) / 2;
                const y = (canvas.height - h) / 2;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(bgImage, x, y, w, h);
            } else if (fitMode === 'fill') {
                ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
            } else if (fitMode === 'repeat') {
                const pattern = ctx.createPattern(bgImage, 'repeat');
                ctx.fillStyle = pattern;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (fitMode === 'repeat-x') {
                // On remplit le fond en blanc (ou une autre couleur) pour éviter la transparence
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const pattern = ctx.createPattern(bgImage, 'repeat-x');
                ctx.fillStyle = pattern;
                // On centre verticalement l'image qui se répète horizontalement
                const y = (canvas.height - bgImage.height) / 2;
                ctx.save();
                ctx.translate(0, y);
                ctx.fillRect(0, 0, canvas.width, bgImage.height);
                ctx.restore();
            } else if (fitMode === 'repeat-y') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                const pattern = ctx.createPattern(bgImage, 'repeat-y');
                ctx.fillStyle = pattern;
                // On centre horizontalement l'image qui se répète verticalement
                const x = (canvas.width - bgImage.width) / 2;
                ctx.save();
                ctx.translate(x, 0);
                ctx.fillRect(0, 0, bgImage.width, canvas.height);
                ctx.restore();
            }
            else if (fitMode === 'no-repeat') {
                const x = (canvas.width - bgImage.width) / 2;
                const y = (canvas.height - bgImage.height) / 2;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(bgImage, x, y);
            }
        }

        elementBounds = { images: [], texts: [] };

        // Draw images
        images.forEach(img => {
            ctx.globalAlpha = img.opacity / 100;
            const w = img.image.width * (img.scale / 100);
            const h = img.image.height * (img.scale / 100);
            ctx.drawImage(img.image, img.x - w / 2, img.y - h / 2, w, h);

            elementBounds.images.push({
                id: img.id,
                left: img.x - w / 2,
                right: img.x + w / 2,
                top: img.y - h / 2,
                bottom: img.y + h / 2
            });

            if (selectedElement && selectedElement.type === 'image' && selectedElement.id === img.id) {
                ctx.globalAlpha = 1;
                ctx.strokeStyle = '#667eea';
                ctx.lineWidth = 3;
                ctx.strokeRect(img.x - w / 2, img.y - h / 2, w, h);

                ctx.fillStyle = '#ffffff';
                ctx.strokeStyle = '#667eea';
                ctx.lineWidth = 2;
                [
                    [img.x - w / 2, img.y - h / 2],
                    [img.x + w / 2, img.y - h / 2],
                    [img.x - w / 2, img.y + h / 2],
                    [img.x + w / 2, img.y + h / 2]
                ].forEach(([x, y]) => {
                    ctx.beginPath();
                    ctx.arc(x, y, 8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                });
            }
        });
        ctx.globalAlpha = 1;
        
        // Draw texts
        texts.forEach(txt => {
            let fontStyle = '';
            if (txt.italic) fontStyle += 'italic ';
            if (txt.bold) fontStyle += 'bold ';

            ctx.font = `${fontStyle}${txt.size}px ${txt.font}`;
            ctx.fillStyle = txt.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // 1. Découper le texte en lignes
            const lines = txt.content.split('\n');
            const lineHeight = txt.size * 1.2; // Espace entre les lignes

            // 2. Calculer la hauteur totale pour centrer le bloc verticalement
            const totalHeight = lines.length * lineHeight;

            // 3. Dessiner chaque ligne
            let maxWidth = 0;
            lines.forEach((line, index) => {
                // On calcule la position Y de chaque ligne
                // (y de base) - (moitié de la hauteur totale) + (décalage de la ligne actuelle)
                const lineY = txt.y - (totalHeight / 2) + (index * lineHeight) + (lineHeight / 2);

                ctx.fillText(line, txt.x, lineY);

                // On mesure la ligne la plus large pour le cadre de sélection
                const metrics = ctx.measureText(line);
                if (metrics.width > maxWidth) maxWidth = metrics.width;
            });

            // 4. Mettre à jour les zones de clic (elementBounds) avec la hauteur totale
            const w = maxWidth;
            const h = totalHeight;

            elementBounds.texts.push({
                id: txt.id,
                left: txt.x - w / 2,
                right: txt.x + w / 2,
                top: txt.y - h / 2,
                bottom: txt.y + h / 2
            });

            // 5. Cadre de sélection (si l'élément est sélectionné)
            if (selectedElement && selectedElement.id === txt.id) {
                ctx.strokeStyle = '#667eea';
                ctx.lineWidth = 2;
                ctx.strokeRect(txt.x - w / 2, txt.y - h / 2, w, h);
                // ... (ajoute tes petits cercles de redimensionnement ici comme avant)
            }
        });
    }

    init();
})();
