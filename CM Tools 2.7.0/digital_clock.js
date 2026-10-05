(function () {
    'use strict';

    let isFeatureEnabled = false;
    let is24Hour = false;
    let clockContainer = null;
    let timeTextSpan = null;
    let timeInterval = null;
    let resizeObserver = null;

    // Helper function to check if we are on the live case webpage
    function isCorrectPage() {
        return window.location.hash.includes('tags/audit/live-common');
    }

    function createClock() {
        if (document.getElementById('cm-digital-clock') || !isCorrectPage()) return;

        // 1. The Clock Container
        clockContainer = document.createElement('div');
        clockContainer.id = 'cm-digital-clock';
        clockContainer.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            background: rgba(13, 27, 42, 0.9);
            color: #00ffff;
            border: 1px solid #00ffff;
            border-radius: 8px;
            font-family: 'Arial', sans-serif;
            font-weight: bold;
            z-index: 999999;
            box-shadow: 0 4px 10px rgba(0, 255, 255, 0.2);
            cursor: grab;
            user-select: none;
            transition: background-color 0.3s ease, box-shadow 0.3s ease;
            resize: both; 
            overflow: hidden; 
            min-width: 140px; 
            min-height: 45px;
            width: 150px;
            height: 50px;
            display: flex; 
            align-items: center; 
            justify-content: center;
        `;
        
        timeTextSpan = document.createElement('span');
        timeTextSpan.style.pointerEvents = 'none'; // Prevent text from interfering with drag/resize
        clockContainer.appendChild(timeTextSpan);
        document.body.appendChild(clockContainer);

        // 2. Dynamic Text Scaling using ResizeObserver
        resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const h = entry.contentRect.height;
                // Scale font size to ~45% of the container height
                timeTextSpan.style.fontSize = Math.max(14, h * 0.45) + 'px';
            }
        });
        resizeObserver.observe(clockContainer);

        // 3. Mouse Drag Logic with Resize Collision Fix
        let isDragging = false, dragX = 0, dragY = 0;

        clockContainer.addEventListener('mousedown', (e) => {
            const rect = clockContainer.getBoundingClientRect();
            // Check if clicking within 20px of the bottom right corner (the native resize handle)
            const isResizeHandle = (e.clientX > rect.right - 20) && (e.clientY > rect.bottom - 20);
            
            if (isResizeHandle) return; // Ignore drag logic and let CSS resize it

            isDragging = true;
            dragX = e.clientX - clockContainer.getBoundingClientRect().left;
            dragY = e.clientY - clockContainer.getBoundingClientRect().top;
            clockContainer.style.cursor = 'grabbing';
            clockContainer.style.boxShadow = '0 4px 15px rgba(0, 255, 255, 0.6)';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            clockContainer.style.left = (e.clientX - dragX) + 'px';
            clockContainer.style.top = (e.clientY - dragY) + 'px';
            clockContainer.style.right = 'auto'; // Release the right anchor
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                clockContainer.style.cursor = 'grab';
                clockContainer.style.boxShadow = '0 4px 10px rgba(0, 255, 255, 0.2)';
            }
        });

        // Initialize and start the timer
        updateTime();
        timeInterval = setInterval(updateTime, 1000);
    }

    function updateTime() {
        if (!timeTextSpan) return;
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
        let ampm = '';

        if (!is24Hour) {
            ampm = hours >= 12 ? ' PM' : ' AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
        } else {
            hours = hours < 10 ? '0' + hours : hours;
        }
        
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        
        timeTextSpan.textContent = `${hours}:${minutes}:${seconds}${ampm}`;
    }

    function destroyClock() {
        if (clockContainer) {
            if (resizeObserver) resizeObserver.disconnect();
            clockContainer.remove();
            clockContainer = null;
            timeTextSpan = null;
        }
        if (timeInterval) {
            clearInterval(timeInterval);
            timeInterval = null;
        }
    }

    function evaluateState() {
        if (isFeatureEnabled && isCorrectPage()) {
            createClock();
        } else {
            destroyClock();
        }
    }

    chrome.storage.local.get({ enableClock: false, use24HourClock: false }, (res) => {
        isFeatureEnabled = res.enableClock;
        is24Hour = res.use24HourClock;
        evaluateState();
    });

    chrome.storage.onChanged.addListener((changes) => {
        if (changes.enableClock) {
            isFeatureEnabled = changes.enableClock.newValue;
            evaluateState();
        }
        if (changes.use24HourClock) {
            is24Hour = changes.use24HourClock.newValue;
            updateTime(); // Instantly update format without waiting for the next tick
        }
    });

    window.addEventListener('hashchange', evaluateState);
})();