(function () {
    'use strict';

    let config = { enableRedlineAlert: true };
    
    chrome.storage.local.get(['enableRedlineAlert'], (result) => {
        if (result.enableRedlineAlert !== undefined) config.enableRedlineAlert = result.enableRedlineAlert;
    });

    chrome.storage.onChanged.addListener((changes) => {
        if (changes.enableRedlineAlert) config.enableRedlineAlert = changes.enableRedlineAlert.newValue;
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

    const largeAlertBox = document.createElement('div');
    largeAlertBox.id = 'cm-redline-alert';
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

    let warningStartTime = null;

    function scanAndDisplay() {
        if (!window.location.hash.includes('tags/audit/live-common') || !config.enableRedlineAlert) {
            largeAlertBox.style.display = 'none';
            warningStartTime = null;
            return;
        }

        const pageText = document.body.innerText || "";
        const hasWarning = pageText.includes('Red-line Risk Warning') || pageText.includes('Red-line risk warning');

        largeAlertBox.classList.remove('critical-pulse');

        if (hasWarning) {
            if (!warningStartTime) {
                warningStartTime = Date.now();
            }

            const elapsedSecs = Math.floor((Date.now() - warningStartTime) / 1000);
            const mins = String(Math.floor(elapsedSecs / 60)).padStart(2, '0');
            const secs = String(elapsedSecs % 60).padStart(2, '0');
            const timerString = ` | ⏱️ ${mins}:${secs}`;

            largeAlertBox.style.display = 'block';
            largeAlertBox.textContent = `⚠️ RED-LINE RISK WARNING ⚠️${timerString}`;
            largeAlertBox.classList.add('critical-pulse');
        } else {
            warningStartTime = null;
            largeAlertBox.style.display = 'none';
        }
    }

    // Check twice a second to smoothly update the timer and catch warnings instantly
    setInterval(scanAndDisplay, 500);
})();