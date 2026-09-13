---
name: run-home-base
description: Launch, screenshot, and drive the Home Base family command center — a unified localStorage-backed PWA combining family routines, children management, and financial tracking
keywords: [home base, web app, family, pwa, family routines, finance, money tracking]
---

# Run Home Base — Family Command Center

**Home Base** is a production-ready single-file HTML5 application that combines family management (children, routines, habits, milestones) with personal finance tracking (transactions, budgets, loans) in one unified, beautiful interface. It's a glass-morphism dark-mode PWA backed by localStorage, with smooth animations and a cohesive design system.

All data is stored on the user's device — no cloud, no servers, no sign-ups.

## Prerequisites

You'll need:
- A modern browser (Chrome, Edge, Safari, Firefox) — tested on Chromium 120+
- Node.js 18+ and npm/yarn (if you want to use the automated driver)
- Basic file serving (Python, Node, or any static file server)

The app is **zero-build**: it's a single `.html` file with no dependencies — just open it in a browser.

## Build & Run

### Option 1: Open Directly (Fastest)

The app file is at `./home-base.html` — open it directly in your browser:
- Copy the absolute path: `/home/user/HacxGPT-CLI/home-base.html`
- Paste into your browser's address bar as: `file:///home/user/HacxGPT-CLI/home-base.html`

### Option 2: Serve Locally (Recommended for Dev)

Python 3:
```bash
cd /home/user/HacxGPT-CLI
python3 -m http.server 8765
```

Then open in your browser: `http://localhost:8765/home-base.html`

Node.js with `http-server`:
```bash
npm install -g http-server
cd /home/user/HacxGPT-CLI
http-server -p 8765
# Open: http://localhost:8765/home-base.html
```

## Agent Path: Automated Driver

The `.claude/skills/run-home-base/driver.mjs` script provides programmatic control for agents to interact with the app in a browser.

### Prerequisites for Driver

```bash
npm install playwright --save-dev
```

### Driver Commands

The driver launches a Chromium browser (headless or visible), loads the HTML file, and automates interactions:

**Take a screenshot:**
```bash
node .claude/skills/run-home-base/driver.mjs screenshot /tmp/home-base-screenshot.png
```

**Switch to a tab:**
```bash
node .claude/skills/run-home-base/driver.mjs switch-tab money
node .claude/skills/run-home-base/driver.mjs switch-tab children
node .claude/skills/run-home-base/driver.mjs switch-tab home
```

**Add a child:**
```bash
node .claude/skills/run-home-base/driver.mjs add-child Emma 2018
node .claude/skills/run-home-base/driver.mjs add-child Noah 2020
```

**Add a transaction:**
```bash
# add-transaction <type> <amount> <category> <description>
node .claude/skills/run-home-base/driver.mjs add-transaction income 2500 salary "Monthly salary"
node .claude/skills/run-home-base/driver.mjs add-transaction expense 45.50 groceries "Weekly shopping"
```

**Add a routine:**
```bash
node .claude/skills/run-home-base/driver.mjs add-routine Emma "Brush teeth"
node .claude/skills/run-home-base/driver.mjs add-routine Noah "Pack backpack"
```

**Get current state:**
```bash
node .claude/skills/run-home-base/driver.mjs get-state
```

**Interactive mode (browser stays open):**
```bash
node .claude/skills/run-home-base/driver.mjs launch
# Chromium opens; press Ctrl+C to exit
```

### Example Workflow

```bash
# Install dependencies
npm install playwright

# Start interactive session
node .claude/skills/run-home-base/driver.mjs launch &

# Switch to children tab
sleep 2
node .claude/skills/run-home-base/driver.mjs switch-tab children

# Add sample data
node .claude/skills/run-home-base/driver.mjs add-child Emma 2018
node .claude/skills/run-home-base/driver.mjs add-routine Emma "Brush teeth"
node .claude/skills/run-home-base/driver.mjs switch-tab money
node .claude/skills/run-home-base/driver.mjs add-transaction income 2500 salary "Monthly salary"
node .claude/skills/run-home-base/driver.mjs add-transaction expense 45.50 groceries "Weekly shopping"

# Take final screenshot
node .claude/skills/run-home-base/driver.mjs screenshot /tmp/home-base-demo.png

# Print state
node .claude/skills/run-home-base/driver.mjs get-state
```

## Features

### Home Tab
- Daily overview: active children count, routines completed, income/expenses this month
- Quick action buttons for common workflows

### Children Tab
- Create child profiles with name and birth year
- Add daily routines (tasks) for each child
- Visual progress tracking (routines completed/total)
- Colorful avatar badges per child

### Money Tab
- Financial dashboard with month picker
- Income, expense, net balance, and remaining budget stats
- Transaction log with sorting by date
- Budget tracking by category (set limits, see spending)
- Loan tracking (principal, remaining, interest rate)
- All amounts in AUD by default (easily customizable)

### Design System
- Glass-morphism UI with gradient accents
- Dark mode only (high contrast, low eye strain)
- Responsive grid layouts (works on mobile, tablet, desktop)
- Smooth animations and micro-interactions
- Accessibility: ARIA labels, keyboard navigation, focus management

## Data Format

All state is stored in a single `homeBase.v1` localStorage key as JSON:

```json
{
  "children": {
    "1697234567890": {
      "id": "1697234567890",
      "name": "Emma",
      "birthYear": 2018
    }
  },
  "routines": [
    {
      "id": "1697234567891",
      "childId": "1697234567890",
      "task": "Brush teeth",
      "completed": false,
      "date": "2024-01-15"
    }
  ],
  "transactions": [
    {
      "id": "1697234567892",
      "type": "income",
      "desc": "Monthly salary",
      "amount": 2500,
      "category": "salary",
      "date": "2024-01-01"
    }
  ],
  "budgets": [
    {
      "id": "1697234567893",
      "category": "Groceries",
      "limit": 500
    }
  ],
  "loans": [
    {
      "id": "1697234567894",
      "name": "Car loan",
      "total": 25000,
      "remaining": 18000,
      "rate": 4.5
    }
  ]
}
```

**Export/Import:** Use your browser's DevTools console:
```javascript
// Export to clipboard
copy(JSON.stringify(JSON.parse(localStorage.getItem('homeBase.v1')), null, 2))

// Import from JSON string
localStorage.setItem('homeBase.v1', JSON.stringify({...yourData...}))
```

## Gotchas

### 1. Driver requires Playwright
The `driver.mjs` script uses Playwright to automate browser interactions. Install it first:
```bash
npm install playwright
```
If Playwright fails to install or run, check that Node.js is 18+.

### 2. Chromium must be in PATH or installed locally
Playwright bundles Chromium; on first run it downloads (~200MB). Network issues can cause timeout:
```bash
# Force re-download
npm install --force playwright
```

### 3. File URLs have limited localStorage on some browsers
When opening via `file://`, Safari and some Firefox configs sandbox localStorage. Use a local server instead:
```bash
python3 -m http.server 8765
# Open: http://localhost:8765/home-base.html
```

### 4. Data persists only in that browser/domain
If you open `home-base.html` from two different file paths, or in two browsers, they won't see the same data (separate localStorage). Keep one canonical path or sync manually via export/import.

### 5. Editing modals with click-outside close
Clicking outside a modal (on the dark overlay) closes it without saving. This is intentional (no accidental submits) but can be surprising on touch devices where the overlay is easier to tap.

### 6. Month filter is separate per view
The Money tab's month picker only affects transactions/budgets shown in that tab. Switching to Home or Children doesn't change it.

### 7. Budgets are per-category, not per-month
A budget for "Groceries" applies to all months. Edit the budget to change its limit; delete and recreate to reset.

## Troubleshooting

### "App fails to load" (blank page)
**Symptom:** Open the `.html` file, page stays blank or shows errors in DevTools console.

**Diagnosis:** Check the browser console (F12 → Console tab). Look for script errors or `Uncaught ReferenceError`.

**Fixes:**
1. Ensure you're opening the correct file: `./home-base.html` in the repo root
2. Clear browser cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
3. Try a different browser (Chrome, Firefox, Edge)
4. Use a local server instead of file://, as some browsers restrict file:// strict

### "localStorage is empty after refresh"
**Symptom:** Add data, refresh the page, data is gone.

**Causes:**
- File is opened from two different paths (localStorage is per-origin)
- Browser is in private/incognito mode (localStorage not persisted)
- Browser storage is full

**Fixes:**
1. Use the same file path consistently (bookmark it if needed)
2. Use normal browsing mode, not incognito
3. Open DevTools (F12) → Application → Local Storage → check `homeBase.v1` key exists
4. If key exists, try export (copy to clipboard) and restart; if data is there, it's a display bug

### "Driver script fails: 'Cannot find Playwright'"
**Fix:**
```bash
cd /home/user/HacxGPT-CLI
npm install playwright
node .claude/skills/run-home-base/driver.mjs screenshot /tmp/test.png
```

### "Driver screenshot is blank"
**Cause:** Page took too long to load (network, slow machine, or JavaScript error).

**Fix:**
```bash
# Add longer timeout by editing driver.mjs, change:
# await page.goto(fileUrl, { waitUntil: 'networkidle' });
# to:
# await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 10000 });
```

Or wait longer before capturing:
```bash
node .claude/skills/run-home-base/driver.mjs launch
# Wait 3 seconds for page to fully render
sleep 3
node .claude/skills/run-home-base/driver.mjs screenshot /tmp/screenshot.png
```

### "Can't add data via driver: selector not found"
**Cause:** Modal or button HTML structure changed, or page didn't load fully.

**Fix:**
1. Take a screenshot to see current state: `driver.mjs screenshot /tmp/check.png`
2. Open DevTools (F12) → Elements, find the button or form field
3. Update the selector in `driver.mjs` to match
4. Ensure app is fully loaded: wait a moment before running command

### "Budgets/Loans don't update when I add a transaction"
**Cause:** This is expected — budgets and loans are separate from transactions. You must:
1. Add transactions in Money tab
2. Set budgets separately to track spending against limits
3. Add loans separately to track repayment progress

Budgets show spending **vs. limit** for the current month. Add a budget, then add transactions with matching categories to see the budget bar fill.

## Human Path (Manual)

If you just want to use Home Base normally without automation:

1. Open `home-base.html` in your browser
2. Use the buttons and forms to add children, routines, transactions, budgets, loans
3. Click the tabs to navigate between Home, Children, and Money views
4. Your data saves automatically to localStorage

No command line, no scripts — just click and type.

## Next Steps

- **Backup data:** Export from DevTools console, save to a file
- **Share data:** Export, email, import into another device's browser
- **Customize:** Edit `home-base.html` to change colors, categories, or features
- **Deploy:** Upload `home-base.html` to any static host (GitHub Pages, Vercel, Netlify) to make it accessible from anywhere

---

Built with glass-morphism design, localStorage persistence, and zero external dependencies. Pure HTML + CSS + JavaScript.
