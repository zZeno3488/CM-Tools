(function () {
    'use strict';

    let isEnabled = true;

    chrome.storage.local.get({ enableAutoMute: true }, (res) => {
        isEnabled = res.enableAutoMute;
        if (isEnabled) muteCustomPlayer();
    });

    chrome.storage.onChanged.addListener((changes) => {
        if (changes.enableAutoMute) {
            isEnabled = changes.enableAutoMute.newValue;
            if (isEnabled) muteCustomPlayer();
        }
    });

    function muteCustomPlayer() {
        if (!isEnabled) return;
        
        const allElements = Array.from(document.querySelectorAll('*'));
        const flvButton = allElements.find(el => el.innerText && el.innerText.trim().toLowerCase() === 'flv');
        
        if (flvButton && flvButton.previousElementSibling) {
            const volBtn = flvButton.previousElementSibling;
            const isUnmuted = volBtn.querySelector('[data-icon="sound"]') || volBtn.innerHTML.includes('sound');
            
            if (isUnmuted) {
                volBtn.click(); 
            }
        }

        document.querySelectorAll('video, audio').forEach(media => {
            if (!media.muted || media.volume > 0) {
                media.muted = true;
                media.volume = 0;
            }
        });
    }

    setInterval(muteCustomPlayer, 500);
})();