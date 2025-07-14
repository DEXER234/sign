
document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu functionality
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.r1');
    
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        const icon = this.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // Canvas drawing functionality
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const downloadBtn = document.getElementById('downloadBtn');
    const penTool = document.getElementById('penTool');
    const eraserTool = document.getElementById('eraserTool');
    const clearCanvas = document.getElementById('clearCanvas');
    
    // Set canvas size
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        
        // Redraw content if needed (for when implementing more features)
        // ctx.fillStyle = 'white';
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function resizeCanvas() {
        const container = canvas.parentElement;
        const maxHeight = window.innerHeight * 0.6; // Limit canvas to 60% of viewport height
        
        canvas.width = container.offsetWidth;
        canvas.height = Math.min(container.offsetHeight, maxHeight);
        
        // Redraw content if needed
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Initial resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Drawing variables
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentTool = 'pen';
    let strokeColor = '#000000';
    let lineWidth = 2;
    
    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Drawing functions
    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }
    
    function draw(e) {
        if (!isDrawing) return;
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        
        if (currentTool === 'pen') {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        } else if (currentTool === 'eraser') {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = lineWidth * 3; // Make eraser thicker
        }
        
        ctx.stroke();
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }
    
    function stopDrawing() {
        isDrawing = false;
    }
    
    // Event listeners for drawing
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch support for mobile devices
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
    });
    
    // Tool selection
    const shapeTool = document.getElementById('clearCanvas');

    // Tool selection
    penTool.addEventListener('click', function() {
        currentTool = 'pen';
        penTool.classList.add('active-tool');
        eraserTool.classList.remove('active-tool');
        shapeTool.classList.remove('active-tool');
    });
    eraserTool.addEventListener('click', function() {
        currentTool = 'eraser';
        eraserTool.classList.add('active-tool');
        penTool.classList.remove('active-tool');
        shapeTool.classList.remove('active-tool');
    });
    shapeTool.addEventListener('click', function() {
        currentTool = 'shape';
        shapeTool.classList.add('active-tool');
        penTool.classList.remove('active-tool');
        eraserTool.classList.remove('active-tool');
    });
    
    clearCanvas.addEventListener('click', function() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    
    // Set pen as default active tool
    penTool.classList.add('active-tool');
    
    // --- Download button usability logic ---
    if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.classList.add('disabled');
    }

    let hasDrawn = false;

    function enableDownload() {
        if (!hasDrawn && downloadBtn) {
            downloadBtn.disabled = false;
            downloadBtn.classList.remove('disabled');
            hasDrawn = true;
        }
    }

    // Enable download after drawing
    canvas.addEventListener('mousedown', enableDownload);
    canvas.addEventListener('touchstart', enableDownload);

    // Reset download button when canvas is cleared
    const clearBtn = document.getElementById('clearCanvas');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (downloadBtn) {
                downloadBtn.disabled = true;
                downloadBtn.classList.add('disabled');
            }
            hasDrawn = false;
        });
    }
    
    // Download functionality
    downloadBtn.addEventListener('click', function() {
        // Create a temporary canvas to add white background
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        
        // Fill with white background
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Draw the original canvas content
        tempCtx.drawImage(canvas, 0, 0);
        
        // Create download link
        const link = document.createElement('a');
        link.download = 'blink-sign-drawing.png';
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    });

    // --- Drawing Undo Stack ---
    let undoStack = [];
    const MAX_UNDO = 30;

    function saveState() {
        if (undoStack.length >= MAX_UNDO) undoStack.shift();
        undoStack.push(canvas.toDataURL());
    }

    function restoreState() {
        if (undoStack.length > 0) {
            const imgData = undoStack.pop();
            const img = new window.Image();
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                updateDownloadButtonState(); // Check after image is drawn
            };
            img.src = imgData;
        } else {
            updateDownloadButtonState(); // If nothing to undo, check state
        }
    }

    // Save state before drawing
    canvas.addEventListener('mousedown', saveState);
    canvas.addEventListener('touchstart', saveState);

    // Keyboard shortcut for undo (Ctrl+Z)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            restoreState();
        }
    });

    // Add undo tool button click event
    const undoBtn = document.getElementById('undoTool');
    if (undoBtn) {
        undoBtn.addEventListener('click', restoreState);
    }

    // Utility to check if canvas is empty
    function isCanvasEmpty() {
        const blank = document.createElement('canvas');
        blank.width = canvas.width;
        blank.height = canvas.height;
        return canvas.toDataURL() === blank.toDataURL();
    }

    function updateDownloadButtonState() {
        if (downloadBtn) {
            if (isCanvasEmpty()) {
                downloadBtn.disabled = true;
                downloadBtn.classList.add('disabled');
                hasDrawn = false;
            } else {
                downloadBtn.disabled = false;
                downloadBtn.classList.remove('disabled');
                hasDrawn = true;
            }
        }
    }

    // After undo, check if canvas is empty
    if (undoBtn) {
        undoBtn.addEventListener('click', function() {
            // No need for setTimeout here
        });
    }
    // After clear, check if canvas is empty (already handled, but ensure)
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            setTimeout(updateDownloadButtonState, 50);
        });
    }
    // After drawing, check if canvas is empty (should always be not empty)
    canvas.addEventListener('mouseup', function() {
        setTimeout(updateDownloadButtonState, 50);
    });
    canvas.addEventListener('touchend', function() {
        setTimeout(updateDownloadButtonState, 50);
    });

    // --- Super Advanced Shape Tool ---
    let shapeType = 'line';
    const shapePopup = document.getElementById('shapePopup');
    const shapeOptions = document.querySelectorAll('.shape-option');

    // Show/hide shape popup on shape tool click
    shapeTool.addEventListener('click', function(e) {
        e.stopPropagation();
        if (shapePopup.style.display === 'none' || !shapePopup.style.display) {
            shapePopup.style.display = 'flex';
        } else {
            shapePopup.style.display = 'none';
        }
    });
    // Hide popup when clicking elsewhere
    window.addEventListener('click', function(e) {
        if (shapePopup && !shapePopup.contains(e.target) && !shapeTool.contains(e.target)) {
            shapePopup.style.display = 'none';
        }
    });
    // Shape option selection
    shapeOptions.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            shapeType = btn.getAttribute('data-shape');
            shapeOptions.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            shapePopup.style.display = 'none';
        });
    });
    // Set default active
    shapeOptions[0].classList.add('active');

    // Drawing logic for advanced shapes
    let shapeStart = null;
    let shapePreview = null;

    function drawShapePreview(start, end, type, shiftKey, altKey) {
        if (!canvas || !ctx) return;
        if (!shapePreview) shapePreview = ctx.getImageData(0, 0, canvas.width, canvas.height);
        else ctx.putImageData(shapePreview, 0, 0);
        ctx.save();
        ctx.strokeStyle = '#241c4c';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        if (type === 'line') {
            let dx = end.x - start.x, dy = end.y - start.y;
            if (altKey) {
                // Snap to 45° increments
                const angle = Math.atan2(dy, dx);
                const snap = Math.round(angle / (Math.PI/4)) * (Math.PI/4);
                const dist = Math.sqrt(dx*dx + dy*dy);
                end.x = start.x + Math.cos(snap) * dist;
                end.y = start.y + Math.sin(snap) * dist;
            }
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        } else if (type === 'rect') {
            let w = end.x - start.x, h = end.y - start.y;
            if (shiftKey) {
                // Perfect square
                const side = Math.sign(w) * Math.min(Math.abs(w), Math.abs(h));
                w = side;
                h = Math.sign(h) * Math.abs(side);
            }
            ctx.strokeRect(start.x, start.y, w, h);
        } else if (type === 'ellipse') {
            let rx = (end.x - start.x) / 2, ry = (end.y - start.y) / 2;
            let cx = start.x + rx, cy = start.y + ry;
            if (shiftKey) {
                // Perfect circle
                const r = Math.sign(ry) * Math.min(Math.abs(rx), Math.abs(ry));
                rx = r;
                ry = r;
                cx = start.x + rx;
                cy = start.y + ry;
            }
            ctx.beginPath();
            ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, 2 * Math.PI);
            ctx.stroke();
        }
        ctx.restore();
    }

    function clearShapePreview() {
        if (shapePreview) {
            ctx.putImageData(shapePreview, 0, 0);
            shapePreview = null;
        }
    }

    canvas.addEventListener('mousedown', function(e) {
        if (currentTool === 'shape') {
            shapeStart = { x: e.offsetX, y: e.offsetY };
            shapePreview = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
    });
    canvas.addEventListener('mousemove', function(e) {
        if (currentTool === 'shape' && shapeStart && isDrawing) {
            drawShapePreview(shapeStart, { x: e.offsetX, y: e.offsetY }, shapeType, e.shiftKey, e.altKey);
        }
    });
    canvas.addEventListener('mouseup', function(e) {
        if (currentTool === 'shape' && shapeStart) {
            clearShapePreview();
            ctx.save();
            ctx.strokeStyle = '#241c4c';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            if (shapeType === 'line') {
                let start = shapeStart, end = { x: e.offsetX, y: e.offsetY };
                if (e.altKey) {
                    // Snap to 45°
                    let dx = end.x - start.x, dy = end.y - start.y;
                    const angle = Math.atan2(dy, dx);
                    const snap = Math.round(angle / (Math.PI/4)) * (Math.PI/4);
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    end.x = start.x + Math.cos(snap) * dist;
                    end.y = start.y + Math.sin(snap) * dist;
                }
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            } else if (shapeType === 'rect') {
                let w = e.offsetX - shapeStart.x, h = e.offsetY - shapeStart.y;
                if (e.shiftKey) {
                    const side = Math.sign(w) * Math.min(Math.abs(w), Math.abs(h));
                    w = side;
                    h = Math.sign(h) * Math.abs(side);
                }
                ctx.strokeRect(shapeStart.x, shapeStart.y, w, h);
            } else if (shapeType === 'ellipse') {
                let rx = (e.offsetX - shapeStart.x) / 2, ry = (e.offsetY - shapeStart.y) / 2;
                let cx = shapeStart.x + rx, cy = shapeStart.y + ry;
                if (e.shiftKey) {
                    const r = Math.sign(ry) * Math.min(Math.abs(rx), Math.abs(ry));
                    rx = r;
                    ry = r;
                    cx = shapeStart.x + rx;
                    cy = shapeStart.y + ry;
                }
                ctx.beginPath();
                ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, 2 * Math.PI);
                ctx.stroke();
            }
            ctx.restore();
            shapeStart = null;
            shapePreview = null;
            enableDownload();
        }
    });
    canvas.addEventListener('mouseleave', function() {
        if (currentTool === 'shape') {
            clearShapePreview();
            shapeStart = null;
        }
    });
    // Touch events for shape tool (basic support)
    canvas.addEventListener('touchstart', function(e) {
        if (currentTool === 'shape') {
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            shapeStart = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
            shapePreview = ctx.getImageData(0, 0, canvas.width, canvas.height);
            isDrawing = true;
        }
    });
    canvas.addEventListener('touchmove', function(e) {
        if (currentTool === 'shape' && shapeStart && isDrawing) {
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            drawShapePreview(shapeStart, { x: touch.clientX - rect.left, y: touch.clientY - rect.top }, shapeType, e.shiftKey, e.altKey);
        }
    });
    canvas.addEventListener('touchend', function(e) {
        if (currentTool === 'shape' && shapeStart) {
            clearShapePreview();
            ctx.save();
            ctx.strokeStyle = '#241c4c';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            // Only draw line for touch (rect/circle on desktop)
            if (shapeType === 'line') {
                const rect = canvas.getBoundingClientRect();
                const touch = e.changedTouches[0];
                let start = shapeStart, end = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
            ctx.restore();
            shapeStart = null;
            shapePreview = null;
            isDrawing = false;
            enableDownload();
        }
    });

    // --- Canvas border glow on drawing ---
    canvas.addEventListener('mousedown', function() {
        canvas.classList.add('drawing-glow');
    });
    canvas.addEventListener('mouseup', function() {
        canvas.classList.remove('drawing-glow');
    });
    canvas.addEventListener('mouseleave', function() {
        canvas.classList.remove('drawing-glow');
    });
    canvas.addEventListener('touchstart', function() {
        canvas.classList.add('drawing-glow');
    });
    canvas.addEventListener('touchend', function() {
        canvas.classList.remove('drawing-glow');
    });

    // --- Hamburger morph animation ---
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
        });
    }
});