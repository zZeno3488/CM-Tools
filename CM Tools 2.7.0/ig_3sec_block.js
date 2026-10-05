(function () {
    'use strict';

    let lockConfig = {
        "Ignore": true,
        "Punish": true,
        "Tiered Punishment": true,
        "Screen Shield": true
    };
    
    // Store the live duration globally, default to 5000ms
    let currentLockDuration = 5000; 

    chrome.storage.local.get({
        lockIgnore: true,
        lockPunish: true,
        lockTiered: true,
        lockShield: true,
        lockDuration: 5
    }, (res) => {
        lockConfig["Ignore"] = res.lockIgnore;
        lockConfig["Punish"] = res.lockPunish;
        lockConfig["Tiered Punishment"] = res.lockTiered;
        lockConfig["Screen Shield"] = res.lockShield;
        
        currentLockDuration = (res.lockDuration || 5) * 1000;
    });

    // Constantly listen for live changes applied inside the popup menu
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.lockIgnore) lockConfig["Ignore"] = changes.lockIgnore.newValue;
        if (changes.lockPunish) lockConfig["Punish"] = changes.lockPunish.newValue;
        if (changes.lockTiered) lockConfig["Tiered Punishment"] = changes.lockTiered.newValue;
        if (changes.lockShield) lockConfig["Screen Shield"] = changes.lockShield.newValue;
        
        if (changes.lockDuration) currentLockDuration = (changes.lockDuration.newValue || 5) * 1000;
    });

    const TARGET_SELECTOR = '.cv-bigo-figure:not(.gray)';
    const buttonsToLock = ["Ignore", "Punish", "Tiered Punishment", "Screen Shield"];

    function getButtonByText(text) {
        return Array.from(document.querySelectorAll("button"))
            .find(b => b.innerText && b.innerText.trim().toLowerCase() === text.toLowerCase());
    }

    function applyLock(btn, buttonName) {
        if (!btn) return;
        
        let isLocked = lockConfig[buttonName] || false;

        // Skip if the user turned the toggle off for this specific button
        if (!isLocked) return; 
        
        if (!btn.dataset.lockStatus) {
            btn.dataset.lockStatus = 'locked'; 
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
            
            setTimeout(() => {
                if (btn) {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.style.cursor = 'pointer';
                    btn.dataset.lockStatus = 'unlocked'; 
                }
            }, currentLockDuration);
        }
    }

    function startLockout() {
        buttonsToLock.forEach(buttonText => {
            const btnElement = getButtonByText(buttonText);
            applyLock(btnElement, buttonText);
        });
    }

    function resetLockout() {
        buttonsToLock.forEach(buttonText => {
            const btnElement = getButtonByText(buttonText);
            if (btnElement) {
                delete btnElement.dataset.lockStatus;
            }
        });
    }

    const observer = new MutationObserver(() => {
        if (document.querySelector(TARGET_SELECTOR)) {
            startLockout();
        } else {
            resetLockout();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    function initLockout() {
        if (document.querySelector(TARGET_SELECTOR)) {
            startLockout();
        }
    }

    if (document.readyState === 'complete') {
        initLockout();
    } else {
        window.addEventListener('load', initLockout);
    }
})();