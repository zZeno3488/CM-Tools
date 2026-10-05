(function () {
    'use strict';

    let isEnabled = false;
    let styleEl = null;

    const defaultCSS = `/* Optional Tag Styling */
.tag-label, .tag-label.BD-GX3488 {
    display: inline-block !important;
    margin-top: 6px !important;
    padding: 2px 6px !important;
    background-color: #ffca12eb !important;
    color: #000 !important;
    font-size: 16px !important;
    font-weight: bold !important;
    border-radius: 4px !important;
}

.cv-bigo-figure.gray::after, .gray::after {
    content: "Monarch" !important;
    color: #ffffffe0 !important;
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    text-align: center !important;
    background-color: rgba(66, 66, 66, .56) !important;
    border-radius: 4px !important;
    padding: 1px 4px !important;
    font-size: 22px !important;
    font-weight: bold !important;
    font-style: italic !important;
    z-index: 999 !important;
    pointer-events: none !important;
}

.cv-bigo-figure.gray img, .gray img {
    border: 4px solid #70ffee59 !important;
    border-radius: 4px !important;
}

.cv-bigo-figure {
    position: relative !important;
    border-radius: 4px !important;
    box-shadow: 0 2px 6px #eb0e0e00 !important;
    padding: 2px !important;
    overflow: hidden !important;
    transition: all 0.2s ease !important;
    background-color: #0f0f0f75 !important;
    border: 1px solid rgba(0, 0, 0, .99) !important;
}

/* Hover effect for interactivity */
.cv-bigo-figure:hover {
    transform: translateY(-4px) !important;
    border-color: #fff !important;
}

.cv-bigo-figure.gray {
    background-color: #07688e !important;
    border: 1px solid #5598c7eb !important;
    box-shadow: none !important;
}

/* Optional: Add a small animation on click */
.cv-bigo-figure:active {
    transform: scale(0.8) !important;
}`;

    let customCSS = defaultCSS;

    function applyStyle() {
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'cm-custom-stylus';
        }

        // Attach to documentElement so it sits after <head> and overrides platform styles
        if (!document.getElementById('cm-custom-stylus')) {
            (document.head || document.documentElement).appendChild(styleEl);
        }

        if (isEnabled) {
            styleEl.textContent = customCSS;
        } else {
            styleEl.textContent = '';
        }
    }

    chrome.storage.local.get(['enableCustomStyle', 'customStylusCSS'], (res) => {
        isEnabled = res.enableCustomStyle === true; // OFF by default
        if (res.customStylusCSS === undefined) {
            customCSS = defaultCSS;
            chrome.storage.local.set({ customStylusCSS: defaultCSS });
        } else {
            customCSS = res.customStylusCSS;
        }
        applyStyle();
    });

    chrome.storage.onChanged.addListener((changes) => {
        if (changes.enableCustomStyle !== undefined) {
            isEnabled = changes.enableCustomStyle.newValue;
            applyStyle();
        }
        if (changes.customStylusCSS !== undefined) {
            customCSS = changes.customStylusCSS.newValue;
            applyStyle();
        }
    });
})();