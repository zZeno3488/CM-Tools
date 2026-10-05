(function () {
    'use strict';

    let isEnabled = true;
    let reminderInterval = null;
    const FORTY_FIVE_MINUTES = 45 * 60 * 1000; 

    // Helper to check if we are on the live case webpage
    function isCorrectPage() {
        return window.location.hash.includes('tags/audit/live-common');
    }

    chrome.storage.local.get({ enableReminder: true }, (res) => { 
        isEnabled = res.enableReminder; 
        evaluateState();
    });
    
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.enableReminder) {
            isEnabled = changes.enableReminder.newValue;
            evaluateState();
        }
        
        if (changes.cmHydrationDismissed) {
            hideAlert();
            if (isEnabled) evaluateState(); 
        }
    });

    const reminderBox = document.createElement('div');
    reminderBox.id = 'cm-health-reminder';
    reminderBox.style.cssText = `
        position: fixed;
        top: -300px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #0d1b2a;
        color: #e0e1dd;
        font-family: 'Arial', sans-serif;
        padding: 20px 30px;
        border-radius: 12px;
        border: 2px solid #415a77;
        box-shadow: 0 10px 30px rgba(0,0,0,0.8);
        z-index: 9999999;
        text-align: center;
        transition: top 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;

    reminderBox.innerHTML = `
        <h2 style="margin: 0 0 10px 0; color: #00ffff; font-size: 22px;">💧 Time for a Quick Break!</h2>
        <p style="margin: 0 0 15px 0; font-size: 15px; line-height: 1.5;">
            You've been auditing for 45 minutes.<br>
            Please look at something 20 feet away for 20 seconds and drink some water.
        </p>
        <button id="cm-reminder-dismiss" style="
            background-color: #1b263b; color: #00ffff; border: 1px solid #00ffff;
            padding: 8px 25px; border-radius: 6px; font-weight: bold; cursor: pointer;
            font-size: 14px; transition: all 0.2s ease;
        ">I'm Hydrated!</button>
    `;
    document.body.appendChild(reminderBox);

    document.getElementById('cm-reminder-dismiss').addEventListener('click', () => {
        hideAlert();
        chrome.storage.local.set({ cmHydrationDismissed: Date.now() });
    });
    
    document.getElementById('cm-reminder-dismiss').addEventListener('mouseover', function() {
        this.style.backgroundColor = '#00ffff';
        this.style.color = '#000000';
    });
    
    document.getElementById('cm-reminder-dismiss').addEventListener('mouseout', function() {
        this.style.backgroundColor = '#1b263b';
        this.style.color = '#00ffff';
    });

    function showAlert() {
        // Double-check that we are still on the correct page before dropping the alert
        if (!isEnabled || !isCorrectPage()) return;
        reminderBox.style.top = '150px'; 
    }

    function hideAlert() {
        reminderBox.style.top = '-300px';
    }

    function startTimer() {
        stopTimer(); 
        reminderInterval = setInterval(showAlert, FORTY_FIVE_MINUTES);
    }

    function stopTimer() {
        if (reminderInterval) {
            clearInterval(reminderInterval);
            reminderInterval = null;
        }
    }

    // Evaluates if the timer should run based on the toggle switch and the current URL
    function evaluateState() {
        if (isEnabled && isCorrectPage()) {
            startTimer();
        } else {
            stopTimer();
            hideAlert();
        }
    }

    // Listen for URL changes as you navigate between tabs on the website
    window.addEventListener('hashchange', evaluateState);
})();