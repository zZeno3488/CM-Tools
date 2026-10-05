(function () {
    'use strict';

    let isTimerEnabled = true;
    let isCaseSoundEnabled = true;
    let caseSoundType = 'chime';
    let caseSoundVolume = 70;
    let isTrackerEnabled = true;
    let currentTagText = 'BD-GX3488';
    let isCaseActive = false;

    const style = document.createElement('style');
    style.id = 'summary-box-style';
    
    function updateStyle(tagText) {
        style.textContent = `
            #countdown-timer { position: fixed; bottom: 20px; right: 20px; background-color: rgba(0, 255, 255, 0.7); color: white; font-size: 22px; font-weight: bold; padding: 4px 6px; border-radius: 10px; z-index: 99999; user-select: none; font-family: 'Arial', sans-serif; cursor: pointer; opacity: 0; transition: opacity 0.5s ease; box-shadow: 0 0 10px rgba(0, 255, 255, 0.5); display: none; }
            #countdown-timer.show { opacity: 1; display: block; }
            .shake-effect { animation: shake 0.5s ease; }
            .red-bg { background-color: rgba(255, 0, 0, 0.7) !important; box-shadow: 0 0 10px rgba(255, 0, 0, 0.5); }
            @keyframes shake { 0%, 100% { transform: rotate(0deg); } 25%, 75% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
            
            #summary-box { position: fixed; bottom: 3px; left: 3px; background: rgba(10, 15, 20, 0.9); color: rgba(0, 255, 255, 0.9); padding: 6px 8px; font-family: 'Arial', sans-serif; font-size: 11px; border-radius: 6px; width: 130px; z-index: 99998; display: none; border: 1px solid rgba(0, 255, 255, 0.4); box-shadow: 0 0 8px rgba(0, 255, 255, 0.3); }
            #summary-box.show { display: block; }
            #summary-box::after { content: '${tagText}'; display: block; font-size: 9px; color: rgba(73, 255, 0, .4); position: absolute; top: 2px; right: 5px; pointer-events: none; }
            
            .tracker-stats { text-align: left; margin-top: 4px; border-top: 1px solid #444; padding-top: 4px; }
            .stat-row { display: flex; justify-content: space-between; margin-bottom: 2px; line-height: 1.2; }
            .highlight-red { color: #ff4444; font-weight: bold; }
        `;
    }
    updateStyle(currentTagText);
    document.head.appendChild(style);

    const timerEl = document.createElement('div');
    timerEl.id = 'countdown-timer';
    timerEl.textContent = '0';
    document.body.appendChild(timerEl);

    const summaryBox = document.createElement('div');
    summaryBox.id = 'summary-box';
    document.body.appendChild(summaryBox);

    let sessionDurations = [];
    let actionCounts = { ignore: 0, punish: 0, shield: 0, tiered: 0 };
    let counter = 0, intervalId = null, startTime = null;

    function playCaseArrivalSound() {
        if (!isCaseSoundEnabled) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;
            const vol = Math.max(0.05, Math.min(1.0, (caseSoundVolume || 70) / 100));

            if (caseSoundType === 'bell') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1046.50, now); // High C6
                gain.gain.setValueAtTime(vol, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(now); osc.stop(now + 0.5);
            } else if (caseSoundType === 'double') {
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
            } else if (caseSoundType === 'arcade') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(987.77, now); // B5
                osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
                gain.gain.setValueAtTime(vol, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(now); osc.stop(now + 0.4);
            } else {
                // Default 'chime' (Crisp Triangle Chime)
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(587.33, now); // D5
                osc.frequency.setValueAtTime(880, now + 0.09); // A5
                gain.gain.setValueAtTime(vol, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(now); osc.stop(now + 0.35);
            }
        } catch (e) {}
    }

    chrome.storage.local.get({ 
        enableTimer: true, 
        enableCaseSound: true, 
        caseSoundType: 'chime',
        caseSoundVolume: 70,
        enableTracker: true, 
        customTagText: 'BD-GX3488' 
    }, (res) => { 
        isTimerEnabled = res.enableTimer; 
        isCaseSoundEnabled = res.enableCaseSound;
        caseSoundType = res.caseSoundType || 'chime';
        caseSoundVolume = res.caseSoundVolume !== undefined ? res.caseSoundVolume : 70;
        isTrackerEnabled = res.enableTracker;
        currentTagText = res.customTagText || 'BD-GX3488';
        updateStyle(currentTagText);
        toggleUI(); 
    });
    
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.enableTimer) { isTimerEnabled = changes.enableTimer.newValue; toggleUI(); }
        if (changes.enableCaseSound) { isCaseSoundEnabled = changes.enableCaseSound.newValue; }
        if (changes.caseSoundType) { caseSoundType = changes.caseSoundType.newValue; }
        if (changes.caseSoundVolume) { caseSoundVolume = changes.caseSoundVolume.newValue; }
        if (changes.enableTracker) { isTrackerEnabled = changes.enableTracker.newValue; updateSummary(); }
        if (changes.customTagText) {
            currentTagText = changes.customTagText.newValue || 'BD-GX3488';
            updateStyle(currentTagText);
        }
    });

    function toggleUI() {
        if (!isTimerEnabled || !window.location.hash.includes('tags/audit/live-common')) {
            timerEl.classList.remove('show');
            summaryBox.classList.remove('show');
            if (intervalId) hideTimer(); 
        } else {
            if (document.querySelector('.cv-bigo-figure:not(.gray)')) showTimer();
        }
    }

    window.addEventListener('hashchange', toggleUI);

    function loadData() {
        const savedTime = localStorage.getItem('timerSessions');
        const savedCounts = localStorage.getItem('shiftActionCounts');
        const timestamp = localStorage.getItem('shiftTimestamp');
        const now = Date.now();
        
        if (timestamp && now - Number(timestamp) < 12 * 60 * 60 * 1000) {
            if (savedTime) sessionDurations = JSON.parse(savedTime);
            if (savedCounts) actionCounts = JSON.parse(savedCounts);
        } else {
            sessionDurations = [];
            actionCounts = { ignore: 0, punish: 0, shield: 0, tiered: 0 };
            localStorage.setItem('shiftTimestamp', now);
            saveData();
        }
    }

    function saveData() {
        localStorage.setItem('timerSessions', JSON.stringify(sessionDurations));
        localStorage.setItem('shiftActionCounts', JSON.stringify(actionCounts));
    }

    document.addEventListener('click', (e) => {
        if (!isTrackerEnabled || !window.location.hash.includes('tags/audit/live-common')) return;
        
        const btn = e.target.closest('button');
        if (!btn) return;
        
        const text = btn.innerText.trim().toLowerCase();
        let changed = false;

        if (text === 'ignore') { actionCounts.ignore++; changed = true; }
        else if (text === 'punish') { actionCounts.punish++; changed = true; }
        else if (text === 'screen shield') { actionCounts.shield++; changed = true; }
        else if (text === 'tiered punishment') { actionCounts.tiered++; changed = true; }
        
        if (changed) {
            saveData();
            updateSummary();
        }
    });

    function showTimer() {
        if (!isTimerEnabled || !window.location.hash.includes('tags/audit/live-common')) return;
        timerEl.classList.add('show');
        if (!intervalId) startSession();
    }

    function hideTimer() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            sessionDurations.push({ duration: Math.floor(performance.now() - startTime) / 1000, hour: new Date().getHours() });
            saveData();
            updateSummary();
        }
    }

    function startSession() {
        counter = 0; timerEl.textContent = counter;
        timerEl.classList.remove('shake-effect', 'red-bg');
        timerEl.style.backgroundColor = 'green';
        startTime = performance.now();

        intervalId = setInterval(() => {
            if (!isTimerEnabled || !window.location.hash.includes('tags/audit/live-common')) return hideTimer();
            counter++; timerEl.textContent = counter;
            if (counter === 12) {
                new Audio('https://www.soundjay.com/buttons/sounds/beep-07.mp3').play().catch(()=>{});
                timerEl.classList.add('shake-effect', 'red-bg');
            }
            if (counter >= 200) { clearInterval(intervalId); intervalId = null; }
        }, 1000);
    }

    function formatAD(label, value) {
        const formatted = `${value.toFixed(1)}s`;
        const highlighted = value >= 12 ? `<span class="highlight-red">${formatted}</span>` : `<span style="color:white;">${formatted}</span>`;
        return `<div><span>${label}:</span> <strong>${highlighted}</strong></div>`;
    }

    function formatODRate(label, value) {
        const formatted = `${value.toFixed(2)}%`;
        const highlighted = value >= 8.00 ? `<span class="highlight-red">${formatted}</span>` : `<span style="color:white;">${formatted}</span>`;
        return `<div><span>${label}:</span> <strong>${highlighted}</strong></div>`;
    }

    function updateSummary() {
        const count = sessionDurations.length;
        const totalSecs = sessionDurations.reduce((sum, s) => sum + s.duration, 0);
        const avg = count > 0 ? totalSecs / count : 0;

        const currentHour = new Date().getHours();
        const hourlyData = sessionDurations.filter(s => s.hour === currentHour);
        const hourlyAvg = hourlyData.length > 0
            ? hourlyData.reduce((sum, s) => sum + s.duration, 0) / hourlyData.length
            : 0;

        const odData = sessionDurations.filter(s => s.duration > 30);
        const odCount = odData.length;
        const odRate = count > 0 ? (odCount / count) * 100 : 0;

        let html = `
            <div style="text-align: left; padding-bottom: 2px; font-size: 11px; line-height: 1.4;">
                ${formatAD('AD', avg)}
                ${formatAD('Hr', hourlyAvg)}
                ${formatODRate('OD Rate', odRate)}
            </div>
        `;

        if (isTrackerEnabled) {
            const totalActions = actionCounts.ignore + actionCounts.punish + actionCounts.shield + actionCounts.tiered;
            html += `
                <div class="tracker-stats">
                    <div class="stat-row"><span style="color:#ffffff;">👁️ Ignore</span> <strong>${actionCounts.ignore}</strong></div>
                    <div class="stat-row"><span style="color:#ff4444;">🔨 Punish</span> <strong>${actionCounts.punish}</strong></div>
                    <div class="stat-row"><span style="color:#ffff00;">🛡️ Shield</span> <strong>${actionCounts.shield}</strong></div>
                    <div class="stat-row"><span style="color:#00ff66;">⚠️ Tiered</span> <strong>${actionCounts.tiered}</strong></div>
                    <div class="stat-row"><span style="color:#ff8800;">⏳ Overdue</span> <strong>${odCount}</strong></div>
                    <div class="stat-row" style="color:#00ffff; margin-top:3px; border-top: 1px dotted #555; padding-top:3px;">
                        <span>📈 Total</span> <strong>${totalActions}</strong>
                    </div>
                </div>
            `;
        }
        summaryBox.innerHTML = html;
    }

    const observer = new MutationObserver(() => {
        if (!window.location.hash.includes('tags/audit/live-common')) {
            isCaseActive = false;
            hideTimer();
            return;
        }
        
        const hasCase = Boolean(document.querySelector('.cv-bigo-figure:not(.gray)'));
        
        if (hasCase) {
            if (!isCaseActive) {
                isCaseActive = true;
                playCaseArrivalSound();
            }
            if (isTimerEnabled) showTimer();
        } else {
            isCaseActive = false;
            hideTimer();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    timerEl.addEventListener('click', () => { if(isTimerEnabled) summaryBox.classList.toggle('show'); });

    function initTimer() {
        loadData();
        updateSummary();
        toggleUI(); 
    }

    if (document.readyState === 'complete') {
        initTimer();
    } else {
        window.addEventListener('load', initTimer);
    }
})();