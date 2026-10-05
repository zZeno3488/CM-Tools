```text
 ╭─────────────────────────╮
 │                         │
 │         ───────         │
 │       ╱         ╲       │
 │     ╱             ╲     │
 │    │       ●       │    │
 │     ╲             ╱     │
 │       ╲         ╱       │
 │         ───────         │
 │                         │
 ╰─────────────────────────╯
      CM TOOLS v2.7.0
```

# CM Tools Core v2.7.0 (Unified Edition)

**CM Tools** is an all-in-one auditing productivity and safety suite designed for the **Global OSS** platform. Version `2.7.0` merges the official `global-oss` metrics/watermark extension directly into the CM Tools core—allowing you to run a single unified extension with customizable keyboard shortcuts, button lockouts, audio notifications, real-time shift stats, and a built-in Stylus CSS engine.

---

## 🚀 Quick Installation

1. Click the green **`<> Code`** button at the top of this GitHub repository and select **Download ZIP**.
2. Extract the downloaded `.zip` archive to a permanent folder on your computer.
3. Open Google Chrome and navigate to: `chrome://extensions/`
4. Toggle **Developer mode** **ON** in the top-right corner.
5. Click **Load unpacked** in the top-left corner and select the extracted `CM_Tools` folder.
6. *(Important)* Disable or remove the old standalone `global-oss` extension so the two do not duplicate network messages.
7. Pin **CM Tools** to your Chrome toolbar for instant access to the popup settings menu.

---

## ✨ What's New in v2.7.0

* **🔗 Unified Global OSS Core:** Built-in platform metrics, media watermarking, DevTools bridge, and download-blocking rules—no need to run two separate extensions.
* **🔔 Case Arrival Sound Synthesizer:** Zero-lag Web Audio API notification that chimes the exact moment a live case lands on your screen. Includes 4 selectable sound profiles (*Crisp Chime*, *Bright Bell*, *Double Beep*, *Arcade Coin*), a live **Test** button, and a **10%–100% Volume Slider**.
* **⬆️ Scroll to Top Shortcut:** Press `W` (or bind any custom key) to instantly click the screenshot list's back-to-top button and jump straight to the newest frames.
* **🎨 Built-In Stylus Engine (v2):** Pre-loaded with the `#2CBFFF` Sky-Cyan & Charcoal Gray Frame theme, featuring hover-lift and tap-press animations, centered `"Gray Frame"` badges, highlighted `BD-GX3488` tags, and a one-click **Reset** button.

---

## 🛠️ Core Features

### 1. Workflow & Safety Lockouts
* **Custom Keyboard Shortcuts:** Bind your preferred keys directly from the popup menu.
  * **Default Keybinds:**
    | Action | Default Key | Behavior |
    | :--- | :---: | :--- |
    | **Ignore** | `` ` `` | Highlights & clicks the Ignore button |
    | **Punish** | `2` | Highlights & clicks the Punish button |
    | **Screen Shield** | `3` | Highlights & clicks the Screen Shield button |
    | **Tiered Punish** | `1` | Opens Tiered Punishment and waits for OK/Submit |
    | **OK / Submit** | `Space` | Confirms and submits the active dialog |
    | **Scroll to Top** | `W` | Clicks the back-to-top button in the screenshot feed |
* **Adjustable Button Lockouts:** Prevent accidental rapid submissions by setting a custom lockout timer (`1–60` seconds) and toggling locks individually for **Ignore**, **Punish**, **Tiered**, and **Shield**.
* **Red-Line Risk Alert:** Automatically scans incoming cases for `"Red-line Risk Warning"` and spawns a massive, pulsing center-screen alert (`pointer-events: none` so it never blocks your clicks).

### 2. Performance & Shift Tracking
* **Duration Timer & Live Summary:** A floating timer in the bottom-right tracks your current case duration (turning red at `12s`), while a collapsible summary box in the bottom-left displays your **Average Duration (AD)** and **Hourly Average (Hr)**.
* **Overdue (OD) Rate Monitor:** Automatically calculates the percentage of cases exceeding `30` seconds and highlights the rate in red if it reaches `8.00%` or higher.
* **Shift Action Tracker:** Keeps a live 12-hour session tally of your **Ignore**, **Punish**, **Shield**, **Tiered**, **Overdue**, and **Total** audited cases.

### 3. UI Overlays & Visual Tools
* **Custom CSS (Stylus):** Live CSS code editor built directly into the popup menu (defaults to **OFF**). Edit, delete, or customize rules in real time, or click **Reset** to restore the default `#2CBFFF` Gray Frame & Tag theme.
* **Rotatable 9-Grid (`Alt + X`):** Press `Alt + X` to launch the measuring grid. Click once to anchor the top-left corner, drag to rotate and scale, and click again to lock. Right-click to undo.
* **Resizable Digital Clock:** Draggable, corner-resizable digital clock overlay with a **12-Hour / 24-Hour Format** toggle.
* **Tag Injector:** Automatically stamps a customizable identifier (defaults to `BD-GX3488`) onto offline/gray figures and the stats summary box.

### 4. Alerts & Quality of Life
* **Pending Case Monitors:** Toggle between a compact draggable **Small Pending Widget** or a **Huge Center Alert** that pulses when the queue hits `10+` cases.
* **Auto-Mute Video:** Automatically mutes active video/audio streams and clicks the native platform mute button.
* **Health Reminder (45m):** Displays a hydration and 20-20-20 eye-care reminder every 45 minutes.

---

## 🔧 Troubleshooting & Tips

* **Features Not Showing Up:** Visual overlays like **Custom CSS (Stylus)**, **Rotatable 9-Grid**, and **Digital Clock** default to **OFF** on fresh installs. Open the CM Tools popup menu to toggle them on.
* **New Chrome Profile Setup:** In `chrome://extensions/`, click **Details** on **CM Tools** and verify that **Site access** is set to **On all sites**.
* **The Hard Refresh Rule:** Whenever you update files or reload the extension in `chrome://extensions/`, press **`Ctrl + F5`** on your active Global OSS tab to ensure all content scripts re-initialize cleanly.
