document.addEventListener('DOMContentLoaded', () => {
    const toggleIds = [
        'enablePendingWidget', 'enableLargeAlert', 'enableRedlineAlert', 'enableAutoMute', 
        'enableReminder', 'enableTimer', 'enableCaseSound', 'enableTracker', 
        'enableShortcuts', 'lockIgnore', 'lockPunish', 'lockTiered', 'lockShield', 
        'enableTag', 'enableGridTool', 'enableCustomStyle', 'enableClock', 'use24HourClock'
    ];

    const defaultKeys = {
        keyIgnore: '`',
        keyPunish: '2',
        keyShield: '3',
        keyTiered: '1',
        keyOk: ' ',
        keyScrollTop: 'w'
    };

    const defaultCSS = `/* Highlight BD-GX3488 Tag */
.tag-label, .tag-label.BD-GX3488 {
    display: inline-block !important;
    margin-top: 6px !important;
    padding: 2px 8px !important;
    background-color: #2CBFFF !important;
    color: #0d1b2a !important;
    border: 1px solid #ffffff !important;
    font-family: 'Arial', sans-serif !important;
    font-size: 15px !important;
    font-weight: bold !important;
    border-radius: 4px !important;
    box-shadow: 0 0 10px rgba(44, 191, 255, 0.7) !important;
}

/* Centered "Gray Frame" Text Overlay */
.cv-bigo-figure.gray::after, .gray::after {
    content: "Gray Frame" !important;
    color: #ffffff !important;
    position: absolute !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    text-align: center !important;
    background-color: rgba(25, 28, 32, 0.88) !important;
    border: 1px solid #2CBFFF !important;
    border-radius: 6px !important;
    padding: 3px 10px !important;
    font-family: 'Arial', sans-serif !important;
    font-size: 18px !important;
    font-weight: bold !important;
    font-style: italic !important;
    white-space: nowrap !important;
    box-shadow: 0 0 12px rgba(44, 191, 255, 0.4) !important;
    z-index: 999 !important;
    pointer-events: none !important;
}

/* Smooth Transition Base */
.cv-bigo-figure {
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease !important;
}

/* Hover Lift Animation */
.cv-bigo-figure:hover {
    transform: translateY(-4px) !important;
    border-color: #2CBFFF !important;
    box-shadow: 0 4px 14px rgba(44, 191, 255, 0.45) !important;
    z-index: 10 !important;
}

/* Tap / Click Press Animation */
.cv-bigo-figure:active {
    transform: scale(0.92) !important;
    border-color: #2CBFFF !important;
}

/* Gray Frame Design */
.cv-bigo-figure.gray, .gray {
    position: relative !important;
    background-color: #24272b !important;
    border: 1px solid #525860 !important;
    border-radius: 6px !important;
    box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.6) !important;
}

.cv-bigo-figure.gray img, .gray img {
    border: 3px solid rgba(44, 191, 255, 0.35) !important;
    border-radius: 6px !important;
    filter: grayscale(40%) brightness(0.8) !important;
    opacity: 0.7 !important;
}`;

    function previewSound(type, volPercent) {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;
            const vol = Math.max(0.05, Math.min(1.0, (volPercent || 70) / 100));

            if (type === 'bell') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1046.50, now);
                gain.gain.setValueAtTime(vol, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(now); osc.stop(now + 0.5);
            } else if (type === 'double') {
                [0, 0.14].forEach(offset => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(880, now + offset);
                    gain.gain.setValueAtTime(vol * 0.6, now + offset);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.09);
                    osc.connect(gain); gain.connect(ctx.destination);
                    osc.start(now + offset); osc.stop(now + offset + 0.09);
                });
            } else if (type === 'arcade') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(987.77, now);
                osc.frequency.setValueAtTime(1318.51, now + 0.08);
                gain.gain.setValueAtTime(vol, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(now); osc.stop(now + 0.4);
            } else {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(587.33, now);
                osc.frequency.setValueAtTime(880, now + 0.09);
                gain.gain.setValueAtTime(vol, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(now); osc.stop(now + 0.35);
            }
        } catch (e) {}
    }

    chrome.storage.local.get([
        ...toggleIds, ...Object.keys(defaultKeys), 
        'customTagText', 'customStylusCSS', 'lockDuration', 
        'caseSoundType', 'caseSoundVolume'
    ], (result) => {
        
        toggleIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (['enableGridTool', 'enableCustomStyle', 'enableClock', 'use24HourClock'].includes(id)) {
                    el.checked = result[id] === true; 
                } else {
                    el.checked = result[id] !== false; 
                }
            }
        });

        const soundBox = document.getElementById('soundConfigBox');
        const soundToggle = document.getElementById('enableCaseSound');
        const soundTypeSelect = document.getElementById('caseSoundType');
        const soundVolSlider = document.getElementById('caseSoundVolume');
        const volValText = document.getElementById('volVal');
        const testSoundBtn = document.getElementById('testSoundBtn');

        if (soundBox && soundToggle) {
            soundBox.style.display = soundToggle.checked ? 'flex' : 'none';
            soundToggle.addEventListener('change', (e) => {
                soundBox.style.display = e.target.checked ? 'flex' : 'none';
            });
        }

        if (soundTypeSelect) {
            soundTypeSelect.value = result.caseSoundType || 'chime';
            soundTypeSelect.addEventListener('change', (e) => {
                chrome.storage.local.set({ caseSoundType: e.target.value });
                previewSound(e.target.value, soundVolSlider ? soundVolSlider.value : 70);
            });
        }

        if (soundVolSlider && volValText) {
            const savedVol = result.caseSoundVolume !== undefined ? result.caseSoundVolume : 70;
            soundVolSlider.value = savedVol;
            volValText.textContent = savedVol;
            soundVolSlider.addEventListener('input', (e) => {
                volValText.textContent = e.target.value;
                chrome.storage.local.set({ caseSoundVolume: Number(e.target.value) });
            });
        }

        if (testSoundBtn) {
            testSoundBtn.addEventListener('click', () => {
                previewSound(
                    soundTypeSelect ? soundTypeSelect.value : 'chime',
                    soundVolSlider ? Number(soundVolSlider.value) : 70
                );
            });
        }

        const durationInput = document.getElementById('lockDuration');
        if (durationInput) {
            durationInput.value = result.lockDuration !== undefined ? result.lockDuration : 5;
            durationInput.addEventListener('input', (e) => {
                let val = parseInt(e.target.value, 10);
                if (val < 1 || isNaN(val)) val = 1; 
                chrome.storage.local.set({ lockDuration: val });
            });
        }

        const keyBox = document.getElementById('keyConfigBox');
        const shortcutToggle = document.getElementById('enableShortcuts');
        
        if (keyBox && shortcutToggle) {
            keyBox.style.display = shortcutToggle.checked ? 'flex' : 'none';
            shortcutToggle.addEventListener('change', (e) => {
                keyBox.style.display = e.target.checked ? 'flex' : 'none';
            });
        }

        Object.keys(defaultKeys).forEach(keyId => {
            const input = document.getElementById(keyId);
            if (input) {
                const savedKey = result[keyId] !== undefined ? result[keyId] : defaultKeys[keyId];
                input.value = formatKeyName(savedKey);
                
                input.addEventListener('keydown', (e) => {
                    e.preventDefault(); 
                    const newKey = e.key;
                    
                    if (['Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape'].includes(newKey)) {
                        input.blur(); 
                        return; 
                    }
                    
                    input.value = formatKeyName(newKey);
                    chrome.storage.local.set({ [keyId]: newKey });
                    input.blur();
                });
            }
        });

        const tagInput = document.getElementById('customTagText');
        if (tagInput) {
            tagInput.value = result.customTagText !== undefined ? result.customTagText : 'BD-GX3488';
            tagInput.addEventListener('input', (e) => {
                const newText = e.target.value.trim() || 'BD-GX3488';
                chrome.storage.local.set({ customTagText: newText });
            });
        }

        const cssEditor = document.getElementById('cssEditor');
        const toggleCssBtn = document.getElementById('toggleCssBtn');
        const resetCssBtn = document.getElementById('resetCssBtn');

        if (cssEditor && toggleCssBtn) {
            if (result.customStylusCSS !== undefined) {
                cssEditor.value = result.customStylusCSS;
            } else {
                cssEditor.value = defaultCSS;
                chrome.storage.local.set({ customStylusCSS: defaultCSS });
            }

            toggleCssBtn.addEventListener('click', () => {
                cssEditor.style.display = cssEditor.style.display === 'none' ? 'block' : 'none';
            });

            if (resetCssBtn) {
                resetCssBtn.addEventListener('click', () => {
                    cssEditor.value = defaultCSS;
                    cssEditor.style.display = 'block';
                    chrome.storage.local.set({ customStylusCSS: defaultCSS });
                });
            }

            cssEditor.addEventListener('input', (e) => {
                chrome.storage.local.set({ customStylusCSS: e.target.value });
            });
        }
    });

    toggleIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', (e) => {
                chrome.storage.local.set({ [id]: e.target.checked });
            });
        }
    });

    function formatKeyName(key) {
        if (key === ' ') return 'Space';
        return key.toUpperCase();
    }
});