(function () {
    'use strict';

    let isShortcutsEnabled = true;
    let keyMap = {
        keyIgnore: '`',
        keyPunish: '2',
        keyShield: '3',
        keyTiered: '1',
        keyOk: ' ',
        keyScrollTop: 'w'
    };

    chrome.storage.local.get(['enableShortcuts', ...Object.keys(keyMap)], (res) => {
        isShortcutsEnabled = res.enableShortcuts !== false;
        Object.keys(keyMap).forEach(k => {
            if (res[k] !== undefined) keyMap[k] = res[k];
        });
    });

    chrome.storage.onChanged.addListener((changes) => {
        if (changes.enableShortcuts !== undefined) {
            isShortcutsEnabled = changes.enableShortcuts.newValue;
        }
        Object.keys(keyMap).forEach(k => {
            if (changes[k] !== undefined) keyMap[k] = changes[k].newValue;
        });
    });

    function highlightAndClick(btn, color = '#2CBFFF') {
        if (!btn || btn.disabled) return;
        const origOutline = btn.style.outline;
        const origShadow = btn.style.boxShadow;
        btn.style.outline = `2px solid ${color}`;
        btn.style.boxShadow = `0 0 12px ${color}`;
        setTimeout(() => {
            btn.style.outline = origOutline;
            btn.style.boxShadow = origShadow;
        }, 250);
        btn.click();
    }

    function findButtonByText(textArray) {
        const buttons = Array.from(document.querySelectorAll('button, .el-button, .ant-btn'));
        return buttons.find(btn => {
            if (btn.offsetParent === null) return false;
            const txt = (btn.innerText || btn.textContent || '').trim().toLowerCase();
            return textArray.some(target => txt === target.toLowerCase());
        });
    }

    function triggerScrollToTop() {
        // Target the exact Ant Design back-to-top button inside the active tab's screenshot wrapper
        const backTopContent = document.querySelector(
            '.ant-tabs-tabpane-active .live-screenshot-list-wrapper .ant-back-top-content, ' +
            '.live-screenshot-list-wrapper .ant-back-top-content, ' +
            '.ant-back-top-content'
        );
        const backTopWrapper = document.querySelector(
            '.ant-tabs-tabpane-active .live-screenshot-list-wrapper .ant-back-top, ' +
            '.live-screenshot-list-wrapper .ant-back-top, ' +
            '.ant-back-top'
        );

        if (backTopContent) {
            highlightAndClick(backTopContent, '#2CBFFF');
        }
        if (backTopWrapper && backTopWrapper !== backTopContent) {
            backTopWrapper.click();
        }

        // Fallback: if the button isn't rendered yet, scroll the screenshot list directly
        if (!backTopContent && !backTopWrapper) {
            const listEl = document.querySelector('.ant-tabs-tabpane-active .screenshot-list, .ant-tabs-tabpane-active .live-screenshot-list-wrapper');
            if (listEl) listEl.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    document.addEventListener('keydown', (e) => {
        if (!isShortcutsEnabled) return;

        // Ignore shortcuts when typing in text inputs or textareas
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (['input', 'textarea', 'select'].includes(activeTag) || document.activeElement?.isContentEditable) {
            return;
        }

        if (e.ctrlKey || e.altKey || e.metaKey) return;

        const pressed = e.key.toLowerCase();

        if (pressed === keyMap.keyScrollTop.toLowerCase()) {
            e.preventDefault();
            triggerScrollToTop();
        } else if (pressed === keyMap.keyIgnore.toLowerCase()) {
            e.preventDefault();
            const btn = findButtonByText(['ignore']);
            highlightAndClick(btn, '#00ff66');
        } else if (pressed === keyMap.keyPunish.toLowerCase()) {
            e.preventDefault();
            const btn = findButtonByText(['punish']);
            highlightAndClick(btn, '#ff4444');
        } else if (pressed === keyMap.keyShield.toLowerCase()) {
            e.preventDefault();
            const btn = findButtonByText(['screen shield']);
            highlightAndClick(btn, '#ffff00');
        } else if (pressed === keyMap.keyTiered.toLowerCase()) {
            e.preventDefault();
            const btn = findButtonByText(['tiered punishment']);
            highlightAndClick(btn, '#2CBFFF');
        } else if (pressed === keyMap.keyOk.toLowerCase()) {
            e.preventDefault();
            const btn = findButtonByText(['ok', 'confirm', 'submit', 'yes', '确定']);
            highlightAndClick(btn, '#2CBFFF');
        }
    });
})();