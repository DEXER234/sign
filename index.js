
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

    // --- Authentication Modal Logic ---
    const authModal = document.getElementById('authModal');
    const authBtn = document.querySelector('.nav_right button');
    const navRight = document.querySelector('.nav_right');
    const authCloseBtn = document.getElementById('authCloseBtn');
    const authForm = document.getElementById('authForm');
    const authFormTitle = document.getElementById('authFormTitle');
    const authToggleBtn = document.getElementById('authToggleBtn');
    const authToggleText = document.getElementById('authToggleText');
    let isSignup = false;

    // --- Profile Icon Logic ---
    function renderProfile(user) {
        // Remove existing content
        navRight.innerHTML = '';
        if (user) {
            // Create profile icon
            const profileDiv = document.createElement('div');
            profileDiv.className = 'profile-menu';
            profileDiv.style.position = 'relative';
            profileDiv.style.display = 'flex';
            profileDiv.style.alignItems = 'center';
            profileDiv.style.justifyContent = 'center';
            profileDiv.style.cursor = 'pointer';
            profileDiv.style.marginRight = '10px';
            profileDiv.style.height = '100%';
            // Profile image or fallback icon
            const img = document.createElement('img');
            img.className = 'profile-avatar';
            img.style.width = '48px';
            img.style.height = '48px';
            img.style.borderRadius = '50%';
            img.style.objectFit = 'cover';
            img.style.border = '2.5px solid #644ca0';
            img.style.background = '#e9e6f7';
            img.style.boxShadow = '0 2px 12px 0 #644ca044';
            img.alt = 'Profile';
            if (user.photoURL) {
                img.src = user.photoURL;
            } else {
                img.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || user.email || 'U') + '&background=644ca0&color=fff&size=128';
            }
            profileDiv.appendChild(img);
            // Dropdown arrow
            const arrow = document.createElement('span');
            arrow.innerHTML = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 8L10 12L14 8" stroke="#644ca0" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
            arrow.style.display = 'inline-block';
            arrow.style.verticalAlign = 'middle';
            arrow.style.marginLeft = '6px';
            arrow.style.transition = 'transform 0.2s';
            profileDiv.appendChild(arrow);
            // Dropdown
            const dropdown = document.createElement('div');
            dropdown.className = 'profile-dropdown';
            dropdown.style.display = 'none';
            dropdown.style.position = 'absolute';
            dropdown.style.left = '100%';
            dropdown.style.top = '50%';
            dropdown.style.transform = 'translateY(-50%) translateX(12px)';
            dropdown.style.background = '#fff';
            dropdown.style.border = '1.5px solid var(--secondary)';
            dropdown.style.borderRadius = '12px';
            dropdown.style.boxShadow = '0 4px 16px 0 rgba(36,28,76,0.10)';
            dropdown.style.minWidth = '140px';
            dropdown.style.zIndex = '99999';
            dropdown.style.padding = '6px 10px';
            dropdown.style.minHeight = '0';
            dropdown.style.transition = 'opacity 0.22s cubic-bezier(.4,2,.6,1), transform 0.22s cubic-bezier(.4,2,.6,1)';
            // User info
            const info = document.createElement('div');
            info.style.padding = '8px 10px 4px 10px';
            info.style.fontSize = '1.01rem';
            info.style.color = '#241c4c';
            info.style.fontWeight = '600';
            info.style.letterSpacing = '0.2px';
            info.style.wordBreak = 'break-all';
            info.style.textAlign = 'left';
            info.textContent = user.displayName || user.email;
            dropdown.appendChild(info);
            // Divider
            const divider = document.createElement('div');
            divider.style.height = '1px';
            divider.style.background = '#e9e6f7';
            divider.style.margin = '6px 0 4px 0';
            dropdown.appendChild(divider);
            // Sign out button
            const signOutBtn = document.createElement('button');
            signOutBtn.textContent = 'Logout';
            signOutBtn.style.background = 'none';
            signOutBtn.style.border = 'none';
            signOutBtn.style.color = 'var(--secondary)';
            signOutBtn.style.fontWeight = '700';
            signOutBtn.style.fontSize = '1.01rem';
            signOutBtn.style.cursor = 'pointer';
            signOutBtn.style.padding = '7px 10px';
            signOutBtn.style.width = '100%';
            signOutBtn.style.textAlign = 'left';
            signOutBtn.style.borderRadius = '8px';
            signOutBtn.style.transition = 'background 0.18s, color 0.18s';
            signOutBtn.addEventListener('mouseenter', function() {
                signOutBtn.style.background = 'var(--secondary)';
                signOutBtn.style.color = '#fff';
            });
            signOutBtn.addEventListener('mouseleave', function() {
                signOutBtn.style.background = 'none';
                signOutBtn.style.color = 'var(--secondary)';
            });
            signOutBtn.addEventListener('click', function() {
                window.firebaseAuth.signOut();
            });
            dropdown.appendChild(signOutBtn);
            // Toggle dropdown
            profileDiv.addEventListener('click', function(e) {
                e.stopPropagation();
                const isOpen = dropdown.style.display === 'block';
                dropdown.style.display = isOpen ? 'none' : 'block';
                arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            });
            // Hide dropdown on outside click
            document.addEventListener('click', function() {
                dropdown.style.display = 'none';
                arrow.style.transform = 'rotate(0deg)';
            });
            profileDiv.appendChild(dropdown);
            navRight.appendChild(profileDiv);
        } else {
            // Show Login/Signup button
            const btn = document.createElement('button');
            btn.textContent = 'Login/Signup';
            btn.addEventListener('click', openAuthModal);
            navRight.appendChild(btn);
        }
    }

    // Listen for auth state changes
    if (window.firebaseAuth) {
        window.firebaseAuth.onAuthStateChanged(renderProfile);
    }

    function openAuthModal() {
        authModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    function closeAuthModal() {
        authModal.style.display = 'none';
        document.body.style.overflow = '';
    }
    if (authBtn) {
        authBtn.addEventListener('click', openAuthModal);
    }
    if (authCloseBtn) {
        authCloseBtn.addEventListener('click', closeAuthModal);
    }
    authModal.addEventListener('click', function(e) {
        if (e.target === authModal) closeAuthModal();
    });
    // Toggle between login and signup
    if (authToggleBtn) {
        authToggleBtn.addEventListener('click', function() {
            isSignup = !isSignup;
            if (isSignup) {
                authFormTitle.textContent = 'Sign Up';
                authToggleText.textContent = 'Already have an account?';
                authToggleBtn.textContent = 'Login';
                authForm.querySelector('.auth-submit').textContent = 'Sign Up';
            } else {
                authFormTitle.textContent = 'Login';
                authToggleText.textContent = "Don't have an account?";
                authToggleBtn.textContent = 'Sign up';
                authForm.querySelector('.auth-submit').textContent = 'Login';
            }
        });
    }
    // Prevent form submit (demo only)
    authForm.addEventListener('submit', function(e) {
        e.preventDefault();
        closeAuthModal();
        // You can add real authentication logic here
    });

    // --- Enhanced Signup UI Logic ---
    const authName = document.getElementById('authName');
    const authPasswordHelper = document.getElementById('authPasswordHelper');
    const authModalContent = document.querySelector('.auth-modal-content');

    function updateAuthMode() {
        if (isSignup) {
            authModalContent.classList.add('signup-mode');
            authName.style.display = 'block';
            authPasswordHelper.style.display = 'block';
            authName.required = true;
        } else {
            authModalContent.classList.remove('signup-mode');
            authName.style.display = 'none';
            authPasswordHelper.style.display = 'none';
            authName.required = false;
        }
    }
    // Update on toggle
    if (authToggleBtn) {
        authToggleBtn.addEventListener('click', updateAuthMode);
    }
    // Also update on open
    if (authBtn) {
        authBtn.addEventListener('click', updateAuthMode);
    }
});

    // --- Authentication Modal Logic ---
    const authModal = document.getElementById('authModal');
    const authBtn = document.querySelector('.nav_right button');
    const authCloseBtn = document.getElementById('authCloseBtn');
    const authForm = document.getElementById('authForm');
    const authFormTitle = document.getElementById('authFormTitle');
    const authToggleBtn = document.getElementById('authToggleBtn');
    const authToggleText = document.getElementById('authToggleText');
    const authName = document.getElementById('authName');
    const authEmail = document.getElementById('authEmail');
    const authPassword = document.getElementById('authPassword');
    const authPasswordHelper = document.getElementById('authPasswordHelper');
    const authModalContent = document.querySelector('.auth-modal-content');
    const authSocialBtn = document.querySelector('.auth-social-btn.google');
    let isSignup = false;

    function openAuthModal() {
        authModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    function closeAuthModal() {
        authModal.style.display = 'none';
        document.body.style.overflow = '';
        authForm.reset();
    }
    if (authBtn) {
        authBtn.addEventListener('click', openAuthModal);
    }
    if (authCloseBtn) {
        authCloseBtn.addEventListener('click', closeAuthModal);
    }
    authModal.addEventListener('click', function(e) {
        if (e.target === authModal) closeAuthModal();
    });

    // Toggle between login and signup
    if (authToggleBtn) {
        authToggleBtn.addEventListener('click', function() {
            isSignup = !isSignup;
            updateAuthMode();
        });
    }

    // Update auth mode UI
    function updateAuthMode() {
        if (isSignup) {
            authFormTitle.textContent = 'Sign Up';
            authToggleText.textContent = 'Already have an account?';
            authToggleBtn.textContent = 'Login';
            authForm.querySelector('.auth-submit').textContent = 'Sign Up';
            authModalContent.classList.add('signup-mode');
            authName.style.display = 'block';
            authPasswordHelper.style.display = 'block';
            authName.required = true;
        } else {
            authFormTitle.textContent = 'Login';
            authToggleText.textContent = "Don't have an account?";
            authToggleBtn.textContent = 'Sign up';
            authForm.querySelector('.auth-submit').textContent = 'Login';
            authModalContent.classList.remove('signup-mode');
            authName.style.display = 'none';
            authPasswordHelper.style.display = 'none';
            authName.required = false;
        }
    }

    // Handle form submission
    authForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = authEmail.value;
        const password = authPassword.value;
        const name = isSignup ? authName.value : null;
        
        try {
            if (isSignup) {
                // Sign up
                await window.firebaseAuthFunctions.createUserWithEmailAndPassword(
                    window.firebaseAuth, 
                    email, 
                    password
                );
                // Here you could update the user profile with the name if needed
                alert('Account created successfully!');
            } else {
                // Login
                await window.firebaseAuthFunctions.signInWithEmailAndPassword(
                    window.firebaseAuth,
                    email,
                    password
                );
                alert('Logged in successfully!');
            }
            closeAuthModal();
            updateAuthState();
        } catch (error) {
            alert(error.message);
        }
    });

    // Google Sign In
    if (authSocialBtn) {
        authSocialBtn.addEventListener('click', async function() {
            try {
                await window.firebaseAuthFunctions.signInWithPopup(
                    window.firebaseAuth,
                    window.firebaseAuthFunctions.provider
                );
                closeAuthModal();
                updateAuthState();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    // Update UI based on auth state
    function updateAuthState() {
        const user = window.firebaseAuth.currentUser;
        const authButton = document.querySelector('.nav_right button');
        
        if (user) {
            authButton.textContent = 'Logout';
            authButton.onclick = function() {
                window.firebaseAuth.signOut();
                updateAuthState();
            };
        } else {
            authButton.textContent = 'Login/Signup';
            authButton.onclick = openAuthModal;
        }
    }

    // Initialize auth state
    window.firebaseAuth.onAuthStateChanged(updateAuthState);
    updateAuthMode();