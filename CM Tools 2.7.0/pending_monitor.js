(function () {
    'use strict';

    let config = { enablePendingWidget: true, enableLargeAlert: true };
    
    chrome.storage.local.get(['enablePendingWidget', 'enableLargeAlert'], (result) => {
        if (result.enablePendingWidget !== undefined) config.enablePendingWidget = result.enablePendingWidget;
        if (result.enableLargeAlert !== undefined) config.enableLargeAlert = result.enableLargeAlert;
    });

    chrome.storage.onChanged.addListener((changes) => {
        if (changes.enablePendingWidget) config.enablePendingWidget = changes.enablePendingWidget.newValue;
        if (changes.enableLargeAlert) config.enableLargeAlert = changes.enableLargeAlert.newValue;
    });

    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse-critical {
            0% { box-shadow: 0 0 15px rgba(255, 0, 0, 0.8); background-color: rgba(220, 0, 0, 0.95); }
            50% { box-shadow: 0 0 40px rgba(255, 0, 0, 1); background-color: rgba(255, 60, 60, 1); }
            100% { box-shadow: 0 0 15px rgba(255, 0, 0, 0.8); background-color: rgba(220, 0, 0, 0.95); }
        }
        .critical-pulse {
            animation: pulse-critical 1s infinite !important;
        }
    `;
    document.head.appendChild(style);

    const widget = document.createElement('div');
    widget.id = 'live-pending-widget';
    widget.style.cssText = `
        position: fixed;
        top: 15px;
        right: 20px;
        z-index: 999998;
        font-family: 'Arial', sans-serif;
        font-weight: bold;
        padding: 8px 15px;
        border-radius: 8px;
        user-select: none;
        cursor: grab;
        transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        display: none;
    `;
    document.body.appendChild(widget);

    let isDragging = false;
    let offsetX = 0, offsetY = 0;

    widget.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - widget.getBoundingClientRect().left;
        offsetY = e.clientY - widget.getBoundingClientRect().top;
        widget.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        widget.style.left = `${e.clientX - offsetX}px`;
        widget.style.top = `${e.clientY - offsetY}px`;
        widget.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            widget.style.cursor = 'grab';
        }
    });

    const largeAlertBox = document.createElement('div');
    largeAlertBox.id = 'large-pending-alert';
    largeAlertBox.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(230, 0, 0, 0.95);
        color: #ffffff;
        font-size: 28px;
        font-weight: bold;
        padding: 15px 40px;
        border-radius: 8px;
        border: 3px solid #ffffff;
        z-index: 9999999;
        box-shadow: 0 0 30px rgba(255, 0, 0, 0.9);
        display: none;
        pointer-events: none;
        font-family: 'Arial', sans-serif;
        text-align: center;
        letter-spacing: 1px;
        white-space: nowrap;
    `;
    document.body.appendChild(largeAlertBox);

    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    function sendDesktopAlert(count) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🚨 High Pending Case Alert', {
                body: `Attention: Pending queue has reached ${count} cases!`,
                icon: 'icon.png'
            });
        }
    }

    let lastCount = null;
    let rushStartTime = null;
    let hasAlerted = false;
    
    // NEW: Smart Sync tracking variables
    let wasStartButtonVisible = false;
    let gracePeriodEndTime = Date.now() + 5000; // Gives a 5-second buffer on hard refreshes

    function scanAndDisplay() {
        if (!window.location.hash.includes('/tags/audit/live-common')) {
            widget.style.display = 'none';
            largeAlertBox.style.display = 'none';
            return;
        }

        if (!config.enablePendingWidget && !config.enableLargeAlert) {
            widget.style.display = 'none';
            largeAlertBox.style.display = 'none';
            return;
        }

        // --- NEW FEATURE: Start Button Detector & Sync Delay ---
        const startBtn = Array.from(document.querySelectorAll('button')).find(b => {
            const text = b.innerText && b.innerText.trim().toLowerCase();
            return text && text.includes('start') && text.length < 15;
        });

        if (startBtn) {
            wasStartButtonVisible = true;
            rushStartTime = null;
            hasAlerted = false;
            lastCount = null; // Clear the previous trend

            if (config.enablePendingWidget) {
                widget.style.display = 'block';
                widget.textContent = `Waiting to Start...`;
                widget.style.backgroundColor = 'rgba(30, 30, 30, 0.9)';
                widget.style.color = '#888';
                widget.style.border = '1px solid #555';
                widget.style.boxShadow = 'none';
            }
            largeAlertBox.style.display = 'none';
            return; 
        } else if (wasStartButtonVisible) {
            // The start button just disappeared! Trigger the 6-second grace period.
            wasStartButtonVisible = false;
            gracePeriodEndTime = Date.now() + 6000; 
        }

        if (Date.now() < gracePeriodEndTime) {
            // We are in the grace period, ignoring the fake high numbers
            rushStartTime = null;
            hasAlerted = false;
            
            if (config.enablePendingWidget) {
                widget.style.display = 'block';
                widget.textContent = `Syncing Data...`;
                widget.style.backgroundColor = 'rgba(10, 25, 30, 0.9)';
                widget.style.color = '#00ffff';
                widget.style.border = '1px solid #00ffff';
                widget.style.boxShadow = '0 0 10px rgba(0,255,255,0.3)';
            }
            largeAlertBox.style.display = 'none';
            return;
        }
        // --------------------------------------------------------

        let pendingCount = -1;
        let isRevealing = true;

        const countWrappers = document.querySelectorAll('.count-wrapper');
        for (let wrapper of countWrappers) {
            if (wrapper.innerText.includes('Pending')) {
                const countSpan = wrapper.querySelector('.count');
                if (countSpan) {
                    const text = countSpan.innerText.trim();
                    if (text.includes('[...]')) {
                        countSpan.click();
                        wrapper.click();
                    } else {
                        const match = text.match(/^(\d+)/);
                        if (match) {
                            pendingCount = parseInt(match[1], 10);
                            isRevealing = false;
                        }
                    }
                }
                break;
            }
        }

        if (isRevealing) {
            if (config.enablePendingWidget) {
                widget.style.display = 'block';
                widget.textContent = `Revealing...`;
                widget.style.backgroundColor = 'rgba(30, 30, 30, 0.85)';
                widget.style.color = '#ffcc00';
                widget.style.border = '1px solid #ffcc00';
            }
            largeAlertBox.style.display = 'none';
            return;
        }

        let trendIcon = '➡️';
        if (lastCount !== null) {
            const diff = pendingCount - lastCount;
            if (diff > 0) trendIcon = `⬆️ (+${diff})`;
            else if (diff < 0) trendIcon = `⬇️ (${diff})`;
        }
        lastCount = pendingCount;

        let timerString = '';
        if (pendingCount > 6) {
            if (!rushStartTime) {
                rushStartTime = Date.now();
                if (!hasAlerted) {
                    sendDesktopAlert(pendingCount);
                    hasAlerted = true;
                }
            }
            const elapsedSecs = Math.floor((Date.now() - rushStartTime) / 1000);
            const mins = String(Math.floor(elapsedSecs / 60)).padStart(2, '0');
            const secs = String(elapsedSecs % 60).padStart(2, '0');
            timerString = ` | ⏱️ ${mins}:${secs}`;
        } else {
            rushStartTime = null;
            hasAlerted = false;
        }

        largeAlertBox.classList.remove('critical-pulse');
        if (config.enableLargeAlert) {
            if (pendingCount >= 10) {
                largeAlertBox.style.display = 'block';
                largeAlertBox.textContent = `🚨 CRITICAL: ${pendingCount} CASES 🚨${timerString}`;
                largeAlertBox.classList.add('critical-pulse');
            } else if (pendingCount >= 7) {
                largeAlertBox.style.display = 'block';
                largeAlertBox.textContent = `⚠️ HIGH PENDING: ${pendingCount} CASES ⚠️${timerString}`;
            } else {
                largeAlertBox.style.display = 'none';
            }
        } else {
            largeAlertBox.style.display = 'none';
        }

        if (config.enablePendingWidget) {
            widget.style.display = 'block';
            widget.textContent = `Cases: ${pendingCount} ${trendIcon}`;
            
            if (pendingCount >= 7) {
                widget.style.backgroundColor = 'rgba(217, 4, 41, 0.95)';
                widget.style.color = '#ffffff';
                widget.style.border = '2px solid #ffffff';
                widget.style.boxShadow = '0 0 20px rgba(217, 4, 41, 0.8)';
            } else if (pendingCount >= 4) {
                widget.style.backgroundColor = 'rgba(40, 35, 10, 0.9)';
                widget.style.color = '#ffcc00';
                widget.style.border = '1px solid #ffcc00';
                widget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
            } else {
                widget.style.backgroundColor = 'rgba(10, 25, 30, 0.9)';
                widget.style.color = '#00ffff';
                widget.style.border = '1px solid #00ffff';
                widget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.5)';
            }
        } else {
            widget.style.display = 'none';
        }
    }

    setInterval(scanAndDisplay, 1000);
})();