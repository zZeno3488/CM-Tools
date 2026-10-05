======================================================================
CM TOOLS CORE v2.6.4 - README
======================================================================

CM Tools is a comprehensive auditing productivity extension designed for 
the global-oss platform. It provides customizable UI overlays, workflow 
automation, and safety lockouts to enhance speed and accuracy during 
live case auditing.

----------------------------------------------------------------------
INSTALLATION
----------------------------------------------------------------------
1. Download and extract the "CM_Tools" folder to your computer.
2. Open Google Chrome and navigate to: chrome://extensions/
3. Toggle "Developer mode" ON in the top right corner.
4. Click "Load unpacked" and select the extracted CM_Tools folder.
5. Pin the extension to your toolbar for easy access to the settings.

----------------------------------------------------------------------
CORE FEATURES
----------------------------------------------------------------------

WORKFLOW & SAFETY LOCKOUTS
- Custom Keyboard Shortcuts: Bind your own keys for Ignore, Punish, 
  Screen Shield, Tiered Punish, and OK/Submit. The Tiered Punishment 
  shortcut remembers your selection and waits for you to press the 
  OK/Submit shortcut to finalize the case.
- Adjustable Button Lockouts: Prevent accidental rapid submissions. Set 
  a custom lock duration (in seconds) via the popup menu, and toggle 
  lockouts individually for the Ignore, Punish, Tiered, and Shield buttons.
- Red-Line Risk Alert: Scans the page for "Red-line Risk Warning" text 
  and instantly spawns a massive, pulsing center-screen alert so you 
  never speed past a highly sensitive case.

PERFORMANCE TRACKING
- Duration Timer & Stats: A fixed summary box in the bottom left tracks 
  your Average Duration (AD) and Hourly Average (Hr).
- Overdue (OD) Rate: Automatically calculates the percentage of cases 
  that take longer than 30 seconds. If your OD rate reaches or exceeds 
  8.00%, the text turns red.
- Shift Action Tracker: Keeps a live running tally of your Ignore, Punish, 
  Shield, and Tiered actions during your session.

UI OVERLAYS & TOOLS
- Rotatable 9-Grid: Press Alt + x to open the measuring grid. Click once 
  to set the top-left vertex, drag your mouse to rotate and size the grid, 
  and click again to lock it in place. Right-click to undo a step.
- Digital Clock: A draggable, resizable digital clock overlay. Drag the 
  bottom right corner to resize the clock frame, and the text will scale 
  automatically. You can toggle between 12-hour and 24-hour formats directly 
  from the popup.
- Tag Injector: Automatically injects a custom identifier (defaults to 
  BD-GX3488) onto gray offline figures. You can change the injected tag 
  text straight from the popup.
- Custom CSS (Stylus): Inject custom styling directly into the auditing 
  page. Click "Edit" in the popup menu to open the code editor box and 
  paste your CSS.

ALERTS & QUALITY OF LIFE
- Pending Case Monitors: Choose between a small draggable pending widget 
  or a Huge Center Alert. The center alert pulses critically when the 
  queue reaches 10+ cases. It features a built-in sync delay to ignore 
  fake high numbers when waiting for the "Start" button.
- Auto-Mute Video: Automatically mutes all video and audio elements on 
  the page and attempts to click the native platform mute button.
- Health Reminder: Triggers a popup every 45 minutes reminding you to 
  look 20 feet away for 20 seconds and drink water.

----------------------------------------------------------------------
TROUBLESHOOTING & TIPS
----------------------------------------------------------------------
- Features are missing: Many features (like the Grid Tool, Clock, and 
  Custom CSS) default to OFF upon installation. Open the popup menu to 
  toggle them on.
- Extension fails on a new Chrome Profile: Go to chrome://extensions/, 
  click "Details" on the CM Tools card, and ensure "Site access" is set 
  to "On all sites". Ensure Developer Mode remains turned ON.
- The "Hard Refresh" Rule: Whenever you change shortcut keys, lock 
  durations, or toggle major features, always click the Reload (refresh) 
  icon in chrome://extensions/ and perform a Hard Refresh (Ctrl + F5) 
  on your live case tab to inject the new settings.