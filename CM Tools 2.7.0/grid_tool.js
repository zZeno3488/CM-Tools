(function() {
    'use strict';

    let isFeatureEnabled = false;
    let isActive = false;
    let pts = [];
    let currentMouse = null; 
    let canvas, ctx, statusBox, toggleBtn;
    let isDrawing = false; 

    // Helper function to check if we are on the live case webpage
    function isCorrectPage() {
        return window.location.hash.includes('tags/audit/live-common');
    }

    function initSquareGrid() {
        if (!isCorrectPage()) return; // Extra guard to prevent spawning on wrong pages
        if (document.getElementById('audit-grid-canvas')) return; 

        // 1. The Canvas
        canvas = document.createElement('canvas');
        canvas.id = 'audit-grid-canvas';
        canvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; z-index: 2147483646; pointer-events: none; cursor: crosshair; transition: background 0.2s;';
        document.body.appendChild(canvas);
        ctx = canvas.getContext('2d');

        // 2. The Status Box
        statusBox = document.createElement('div');
        statusBox.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); padding: 12px 24px; background: rgba(0, 0, 0, 0.9); color: #fff; border-radius: 50px; font-family: sans-serif; font-size: 15px; font-weight: bold; z-index: 2147483647; box-shadow: 0 4px 12px rgba(0,255,255,0.3); display: none; pointer-events: none; border: 1px solid #00ffff;';
        document.body.appendChild(statusBox);

        // 3. The Floating Button
        toggleBtn = document.createElement('button');
        toggleBtn.innerHTML = '🔲 Open Grid (Alt+x)';
        toggleBtn.style.cssText = 'position: fixed; bottom: 80px; left: 20px; z-index: 2147483647; padding: 12px 20px; background: #1b263b; color: #00ffff; border: 2px solid #00ffff; border-radius: 50px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); cursor: grab; font-weight: bold; font-family: sans-serif; transition: all 0.2s;';
        document.body.appendChild(toggleBtn);

        // --- Mouse Drag Logic ---
        let isDragging = false, hasMoved = false, dragX = 0, dragY = 0;

        toggleBtn.addEventListener('mousedown', (e) => {
            isDragging = true; hasMoved = false;
            dragX = e.clientX - toggleBtn.getBoundingClientRect().left;
            dragY = e.clientY - toggleBtn.getBoundingClientRect().top;
            toggleBtn.style.cursor = 'grabbing';
            toggleBtn.style.transform = 'scale(0.95)';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            hasMoved = true;
            toggleBtn.style.left = (e.clientX - dragX) + 'px';
            toggleBtn.style.top = (e.clientY - dragY) + 'px';
            toggleBtn.style.bottom = 'auto'; 
            toggleBtn.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                toggleBtn.style.cursor = 'grab';
                toggleBtn.style.transform = 'scale(1)';
            }
        });
        
        toggleBtn.addEventListener('click', (e) => {
            if (hasMoved) { e.preventDefault(); e.stopPropagation(); return; }
            toggleTool();
        });

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // High-performance canvas rendering
        canvas.addEventListener('mousemove', (e) => {
            if (!isActive) return;
            currentMouse = {x: e.clientX, y: e.clientY};
            
            if (pts.length === 1 && !isDrawing) {
                isDrawing = true;
                requestAnimationFrame(() => {
                    drawScene();
                    isDrawing = false;
                });
            }
        });

        canvas.addEventListener('click', (e) => {
            if (!isActive || pts.length >= 2) return;
            pts.push({x: e.clientX, y: e.clientY});
            updateStatusAndDraw();
        });

        canvas.addEventListener('contextmenu', (e) => {
            if (!isActive) return;
            e.preventDefault(); 
            if (pts.length > 0) { pts.pop(); updateStatusAndDraw(); }
        });
    }

    function destroyGrid() {
        if (canvas) { canvas.remove(); canvas = null; }
        if (statusBox) { statusBox.remove(); statusBox = null; }
        if (toggleBtn) { toggleBtn.remove(); toggleBtn = null; }
        isActive = false; pts = [];
    }

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (isActive) drawScene();
    }

    function toggleTool() {
        isActive = !isActive;
        if (isActive) {
            canvas.style.pointerEvents = 'auto'; 
            canvas.style.background = 'rgba(0, 0, 0, 0.2)'; 
            statusBox.style.display = 'block';
            toggleBtn.innerHTML = '❌ Close Grid (Alt+x)';
            toggleBtn.style.background = '#00ffff';
            toggleBtn.style.color = '#000000';
            resetTool();
        } else {
            canvas.style.pointerEvents = 'none'; 
            canvas.style.background = 'transparent';
            statusBox.style.display = 'none';
            toggleBtn.innerHTML = '🔲 Open Grid (Alt+x)';
            toggleBtn.style.background = '#1b263b';
            toggleBtn.style.color = '#00ffff';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    // --- The "KeyUp" Bypass with URL Checking ---
    window.addEventListener('keydown', function(e) {
        if (!isFeatureEnabled || !isCorrectPage() || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
        if (e.altKey && !e.shiftKey && (e.code === 'KeyX' || e.keyCode === 88 || e.key.toLowerCase() === 'x')) {
            e.preventDefault(); 
            e.stopImmediatePropagation(); 
        }
    }, true); 

    window.addEventListener('keyup', function(e) {
        if (!isFeatureEnabled || !isCorrectPage() || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
        if (e.altKey && !e.shiftKey && (e.code === 'KeyX' || e.keyCode === 88 || e.key.toLowerCase() === 'x')) {
            e.preventDefault(); 
            e.stopImmediatePropagation(); 
            if (!canvas) initSquareGrid(); 
            toggleTool();
        }
    }, true); 

    function resetTool() {
        pts = []; currentMouse = null;
        updateStatus("👉 Click 1: Top-Left vertex");
        drawScene();
    }

    function updateStatus(text) {
        statusBox.innerHTML = '📏 ' + text + ' <span style="font-size:13px;color:#aaa;margin-left:10px;">(Right-click to undo)</span>';
    }

    function updateStatusAndDraw() {
        if (pts.length === 0) updateStatus("👉 Click 1: Top-Left vertex");
        else if (pts.length === 1) updateStatus("✅ Drag to rotate & size Grid. Click 2 to fix.");
        else if (pts.length === 2) updateStatus("🎉 Rotated Grid fixed!");
        drawScene();
    }

    function drawScene() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#000";
        pts.forEach((p, index) => {
            if (index === 0) { 
                ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI); ctx.fill();
            }
        });

        if (pts.length > 0) {
            const p1 = pts[0]; 
            const p2 = pts.length === 2 ? pts[1] : currentMouse; 

            if (p2) {
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const s = Math.hypot(dx, dy); 
                const angle = Math.atan2(dy, dx); 

                if (s > 1) { 
                    ctx.save();
                    ctx.translate(p1.x, p1.y);
                    ctx.rotate(angle);

                    ctx.strokeStyle = "#00ffff"; 
                    ctx.lineWidth = 2;
                    ctx.strokeRect(0, 0, s, s);

                    ctx.beginPath();
                    ctx.moveTo(s / 3, 0); ctx.lineTo(s / 3, s);
                    ctx.moveTo(2 * s / 3, 0); ctx.lineTo(2 * s / 3, s);
                    ctx.moveTo(0, s / 3); ctx.lineTo(s, s / 3);
                    ctx.moveTo(0, 2 * s / 3); ctx.lineTo(s, 2 * s / 3);
                    ctx.stroke();

                    ctx.fillStyle = "rgba(0, 255, 255, 0.1)";
                    ctx.fillRect(s / 3, s / 3, s / 3, s / 3);

                    ctx.beginPath();
                    ctx.strokeStyle = "#ff4444";
                    ctx.lineWidth = 2;
                    ctx.moveTo(0, s / 2); ctx.lineTo(s, s / 2);
                    ctx.moveTo(s / 2, 0); ctx.lineTo(s / 2, s);
                    ctx.stroke();

                    const pxVal = Math.round(s) + " px";
                    ctx.font = "bold 14px sans-serif";
                    const tw = ctx.measureText(pxVal).width;
                    
                    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
                    ctx.fillRect(s + 10, s / 2 - 12, tw + 12, 24);
                    
                    ctx.fillStyle = "#ff4444";
                    ctx.textAlign = "left";
                    ctx.textBaseline = "middle";
                    ctx.fillText(pxVal, s + 16, s / 2);

                    ctx.restore(); 
                }
            }
        }
    }

    // Evaluates if the tool should be active based on both the toggle switch and the current URL
    function evaluateState() {
        if (isFeatureEnabled && isCorrectPage()) {
            initSquareGrid();
        } else {
            destroyGrid();
        }
    }

    chrome.storage.local.get({ enableGridTool: false }, (res) => {
        isFeatureEnabled = res.enableGridTool;
        evaluateState();
    });

    chrome.storage.onChanged.addListener((changes) => {
        if (changes.enableGridTool) {
            isFeatureEnabled = changes.enableGridTool.newValue;
            evaluateState();
        }
    });

    // Listen for URL changes as you navigate between tabs on the website
    window.addEventListener('hashchange', evaluateState);
})();