(function() {
    'use strict';

    let isEnabled = true;
    let currentTagText = 'BD-GX3488'; 

    function injectTag() {
        if (!isEnabled) return;
        document.querySelectorAll('.cv-bigo-figure.gray:not([data-tagged])').forEach(el => {
            const tag = document.createElement('div');
            tag.className = 'tag-label';
            tag.textContent = currentTagText;
            el.appendChild(tag);
            el.setAttribute('data-tagged', 'true');
        });
    }

    function removeTags() {
        document.querySelectorAll('.cv-bigo-figure.gray[data-tagged]').forEach(el => {
            const tag = el.querySelector('.tag-label');
            if (tag) tag.remove();
            el.removeAttribute('data-tagged');
        });
    }

    function refreshExistingTags() {
        document.querySelectorAll('.tag-label').forEach(tag => {
            tag.textContent = currentTagText;
        });
    }

    chrome.storage.local.get({ enableTag: true, customTagText: 'BD-GX3488' }, (res) => { 
        isEnabled = res.enableTag; 
        currentTagText = res.customTagText;
        
        if (isEnabled) injectTag(); 
        else removeTags();
    });

    chrome.storage.onChanged.addListener((changes) => {
        if (changes.enableTag) {
            isEnabled = changes.enableTag.newValue;
            if (isEnabled) injectTag(); else removeTags();
        }
        
        if (changes.customTagText) {
            currentTagText = changes.customTagText.newValue || 'BD-GX3488';
            if (isEnabled) refreshExistingTags();
        }
    });

    const observer = new MutationObserver(injectTag);
    observer.observe(document.body, { childList: true, subtree: true });
})();