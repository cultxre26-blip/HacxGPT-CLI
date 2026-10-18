---
name: run-home-base
description: Launch, screenshot, and drive the Home Base family command center — a bold neubrutalist-styled PWA combining family routines, children management, financial tracking (bills, budgets, loans, investments, debt payoff), savings/household goals, and a cloud-synced daily three-track list
keywords: [home base, web app, family, pwa, family routines, finance, money tracking, bills, goals]
---

# Run Home Base — Family Command Center

**Home Base** is a production single-file HTML5 application combining family
management (children, routines) with personal finance (transactions, budgets,
loans, bills with recurring frequency, investments/net worth, a debt payoff
planner) and goals (savings + household), all in one bold, neubrutalist-styled
interface — thick borders, hard offset shadows, flat colors, custom SVG icons
(no emoji), corner background accents. Core data (children, routines,
transactions, budgets, loans, bills, investments, goals) is local-first,
stored in `localStorage`, optionally PIN-encrypted on-device. The **Daily**
tab (a merged-in three-track quick list: Money/House/Her) is the one
exception — it syncs live across devices via the published Artifact's `db`
capability.

## Prerequisites

- A modern browser (Chrome, Edge, Safari, Firefox) — tested on Chromium 120+
- Node.js 18+ (for the automated driver)
- Playwright (`npm install playwright` — see Driver section)

The app is **zero-build**: a single `.html` file, no external JS/CSS
dependencies (Google Fonts and Chart.js were both removed during this
project's life — check before assuming either is still there).

## Build & Run

### Option 1: Open Directly (Fastest)

```
file:///home/user/HacxGPT-CLI/home-base.html
```

### Option 2: Serve Locally

```bash
cd /home/user/HacxGPT-CLI
python3 -m http.server 8765
# open http://localhost:8765/home-base.html
```

### Option 3: The Published Artifact (Daily tab cloud sync only works here)

The app is also published as a Claude Artifact at
`https://claude.ai/artifact/NbXeQf4vuUuuV2Qv3w6wGc` with the `db` capability
declared. Live cross-device sync for the **Daily** tab only works when
opened through that URL (or a republish of it) inside a real Claude Artifact
viewer — `window.claude` doesn't exist under `file://` or a plain static
host, so the Daily tab silently falls back to local-only storage there
(this is by design, not a bug — see Gotchas). Declaring `db` also made the
artifact **organization-internal**, not publicly link-shareable — a platform
rule, not something this project chose.

## Agent Path: Automated Driver

`.claude/skills/run-home-base/driver.mjs` gives programmatic control.

### Install

```bash
cd /home/user/HacxGPT-CLI
npm install playwright
```

### Important: persistent browser profile

Each `node driver.mjs <command>` invocation is its own process. The driver
uses `chromium.launchPersistentContext()` against a fixed profile directory
(`.claude/skills/run-home-base/.browser-profile/`, gitignored) specifically
so `localStorage` **survives between separate CLI calls** — without this,
chaining `add-child` then `add-routine` in two separate commands would lose
all state in between (this was broken until this session's fix; verified by
re-running the full example workflow below as genuinely separate processes
and confirming `get-state` shows everything). Delete that directory to reset
to a clean slate.

### Driver Commands

```bash
# Screenshot
node .claude/skills/run-home-base/driver.mjs screenshot /tmp/shot.png

# Switch tab — five tabs now: home, children, money, goals, daily
node .claude/skills/run-home-base/driver.mjs switch-tab money
node .claude/skills/run-home-base/driver.mjs switch-tab goals
node .claude/skills/run-home-base/driver.mjs switch-tab daily

# Add a child
node .claude/skills/run-home-base/driver.mjs add-child Emma 2018

# Add a transaction (type amount category description)
node .claude/skills/run-home-base/driver.mjs add-transaction income 2500 Personal "Monthly salary"
node .claude/skills/run-home-base/driver.mjs add-transaction expense 45.50 Groceries "Weekly shopping"

# Add a routine for an existing child
node .claude/skills/run-home-base/driver.mjs add-routine Emma "Brush teeth"

# Print current localStorage state (fails clearly if PIN-locked — see Gotchas)
node .claude/skills/run-home-base/driver.mjs get-state

# Generic click/type for anything the driver doesn't have a dedicated
# command for yet (bills, investments, goals, debt payoff, backup/restore,
# the Daily tab's three add-forms) — inspect the DOM via a screenshot first,
# then target ids/onclick attributes directly, e.g.:
node .claude/skills/run-home-base/driver.mjs click "#money-tab button[onclick=\"openModal('bill')\"]"
```

Verified this session (genuinely, as separate process invocations, not
just read from source):
```bash
node .claude/skills/run-home-base/driver.mjs add-child Emma 2018
node .claude/skills/run-home-base/driver.mjs add-routine Emma "Brush teeth"
node .claude/skills/run-home-base/driver.mjs add-transaction income 2500 Personal "Monthly salary"
node .claude/skills/run-home-base/driver.mjs get-state
# → get-state's children/routines/transactions all present, proving the
#   persistent-profile fix actually works across process boundaries.
```

## Features

### Home Tab
- Overview stats: active children, routines completed today, month's
  income/expenses, **Net Worth** (investments − loan balances)
- 6-month income/expense trend chart (hand-built inline SVG bar chart, no
  charting library) — hidden until there's at least one transaction
- "Needs Attention": overdue/upcoming bills and categories spending well
  above their recent average
- Quick actions: view Children/Money, add routine/transaction/bill

### Children Tab
- Child profiles (name, birth year), full edit/delete
- Routines per child with a real checklist (not just a count badge):
  toggle done/pending, edit, delete; search + status filter
- "Routines Done" on Home tab reflects routines completed **today**
  specifically (tracked via `completedAt`, not just an all-time count)

### Money Tab
- Transactions: search + type/category filters, category icons, full edit
- Budgets per category
- **Bills & Recurring Payments**: add/edit/delete, due date, **frequency**
  (none/weekly/fortnightly/monthly/yearly — not just a monthly toggle), a
  "Mark Paid" button that auto-logs a transaction and advances the due date
  by the right interval; auto-detects likely recurring charges from
  transaction history and offers to track them
- **Loans** and a **Debt Payoff Planner** (appears once 2+ loans exist):
  avalanche vs snowball ordering, side by side
- **Investments & Net Worth**: manually-tracked assets (no live price
  fetching — that would reintroduce an external dependency)
- **Financial Principles** and **Assistance & Support** panels — explicitly
  general education / general pointers, not personalized advice
- **Import From Jay's Day**: one-time paste-JSON import of a *different*
  app's dated Money-track items as bills (kept for backward compatibility;
  the live merge is now the Daily tab — see below)

### Goals Tab
- Savings goals: target/current amount, target date, progress bar, a
  per-week contribution estimate
- Household goals: a simple non-money checklist

### Daily Tab (merged from a separate "Jay's Day" artifact)
- Three tracks — Money / House / Her — each a quick add/toggle/delete list
  with natural-language due-date parsing ("pay rent by 20 sep", "bins
  tomorrow")
- **Cloud-synced** via the `db` capability when opened through the
  published Artifact URL; falls back to local-only with a visible sync
  status indicator otherwise
- "Import From Jay's Day" panel: paste that other app's export JSON for a
  one-time copy-in (each Artifact has its own isolated database — there is
  no way for two separately-published Artifacts to share one live
  collection, so this is a copy, not an ongoing sync)

### Security
- Optional PIN lock (header lock icon): encrypts the whole local state with
  AES-GCM (key derived via PBKDF2/SHA-256) instead of storing plain JSON.
  No recovery if the PIN is forgotten — that's inherent to client-side
  encryption with no server. The Daily tab's cloud data is unaffected by
  this lock either way (see Gotchas).
- Backup/restore via a copyable/pasteable JSON textarea (not a file
  download — Claude Artifacts block `<a download>` for viewers, so this is
  the actual working mechanism, not a nicety)

### Design System
- Neubrutalist: flat colors (acid lime, violet, hot pink, red, yellow —
  no gradients), 3px borders, hard offset shadows (no blur), buttons/cards
  that visually "press" toward their own shadow on hover/active
  - This replaced an earlier dark-glass/gradient version — if you see
    `backdrop-filter`, `var(--grad)`, or `var(--stroke)` anywhere, that's
    leftover from the old design and should be updated to the current
    tokens (`--surface`, `--border`, `--shadow*`)
- Custom hand-built SVG icon set (`icon(name)` JS helper, ~40 icons) —
  **no emoji anywhere** in the UI; this was a deliberate pass to remove a
  strongly "generic AI-built app" signal
- Corner background accents (ring/triangle/square/circle in the app's own
  accent colors, fixed to the viewport, low opacity) instead of a plain
  background
- Responsive: tabs collapse to icon-only under 600px so all five fit
  without horizontal scroll (this broke once during development when a
  4th tab was added — verified fixed by checking `scrollWidth <=
  clientWidth` on the tab nav, not just eyeballing a screenshot)

## Data Format

State lives in `localStorage['homeBase.v1']` as plain JSON, **or** in
`localStorage['homeBase.vault']` (AES-GCM encrypted) if a PIN is set — in
that case `homeBase.v1` does not exist and the driver's `get-state` will
say so explicitly rather than silently returning nothing.

```json
{
  "children": { "<id>": { "id": "...", "name": "Emma", "birthYear": 2018 } },
  "routines": [{ "id": "...", "childId": "...", "task": "Brush teeth", "completed": false, "completedAt": "", "date": "2024-01-15" }],
  "habits": [],
  "transactions": [{ "id": "...", "type": "income", "desc": "Monthly salary", "amount": 2500, "category": "Personal", "date": "2024-01-01" }],
  "budgets": [{ "id": "...", "category": "Groceries", "limit": 500 }],
  "loans": [{ "id": "...", "name": "Car loan", "total": 25000, "remaining": 18000, "rate": 4.5 }],
  "bills": [{ "id": "...", "name": "Rent", "amount": 1200, "category": "Utilities", "dueDate": "2026-10-01", "frequency": "monthly", "autoDetected": false }],
  "investments": [{ "id": "...", "name": "Super", "type": "Super / Retirement", "value": 40000 }],
  "dismissedRecurring": ["spotify|entertainment"],
  "savingsGoals": [{ "id": "...", "title": "Emergency Fund", "targetAmount": 5000, "currentAmount": 1250, "targetDate": "2026-12-01" }],
  "householdGoals": [{ "id": "...", "title": "Bedtime routine", "notes": "", "completed": false }]
}
```

The Daily tab's items live separately, in `localStorage['homeBase.daily.v1']`
as a local cache, and in the Artifact's `db.collection("items")` as the
source of truth when cloud sync is active — each item:
`{ id, section: "money"|"house"|"her", text, due, done, doneAt, createdAt }`.

**Export/Import (in-app, works regardless of PIN lock):** the header's
sync icon opens Backup/Restore — a textarea with the full decrypted JSON
and a Copy button, plus a paste-to-import field. This is the only reliable
export path for a published Artifact; a DevTools `localStorage` read still
works when self-hosting via `file://`/a local server.

## Gotchas

### 1. Driver needs a persistent profile, and it's gitignored
See "Important: persistent browser profile" above. If chained commands
seem to lose state, check `.claude/skills/run-home-base/.browser-profile/`
actually exists and isn't being deleted between runs.

### 2. `get-state` can't read PIN-locked data
If a PIN has been set in the UI, `localStorage['homeBase.v1']` no longer
exists (data moved to encrypted `homeBase.vault`). `get-state` detects this
and throws a clear error instead of returning `null` silently — use the
in-app Backup/Restore export instead, or don't set a PIN on the driver's
test profile.

### 3. The Daily tab's live cloud sync only works in the real Artifact viewer
`window.claude` (and therefore `db`) is `undefined` under `file://`, a
plain local server, or a static host — there is no way around this for
local dev/testing. The tab still fully works locally in that case (adds/
edits/deletes all persist to `localStorage['homeBase.daily.v1']`), it just
shows "Saved on this device only" instead of "Synced across your devices."
Don't mistake this for a bug when testing via `file://`.

### 4. Two separately-published Artifacts can never share one live database
Each Artifact gets its own isolated `db` store — confirmed against the
platform's own capability docs before this was built. "Import From Jay's
Day" (in both the Money tab and Daily tab) is necessarily a one-time copy,
never an ongoing sync, no matter how it's phrased in the UI.

### 5. Ambiguous selectors are a recurring trap in this file
Several buttons across different tabs share the exact same `onclick`
attribute (e.g. `openModal('transaction')` appears on both the Home tab's
"Log Transaction" quick action and the Money tab's own "+ Transaction"
button — both exist in the DOM at once, just one is `display:none`).
A bare `button[onclick="..."]` selector will match multiple elements and
either throw (Playwright strict mode) or silently click the wrong one.
Always scope to the active tab's container, e.g. `#money-tab
button[onclick="..."]`. This bit the driver itself (fixed this session)
and bit ad-hoc test scripts multiple times during this project's
development — assume any new automation will hit it too.

### 6. Legacy field names may appear in older exported/imported JSON
`bills[].recurring` (boolean) was the field before `frequency` (string:
none/weekly/fortnightly/monthly/yearly) replaced it. The app normalizes
this automatically on load/import (`recurring:true` → `frequency:
"monthly"`), so hand-edited or old exported JSON still works, but don't
write new code that reads `.recurring` — read `.frequency`.

### 7. File URLs sandbox localStorage on some browsers
Safari and some Firefox configs restrict `file://` localStorage. Use a
local server (Option 2 above) if data isn't persisting when self-hosting.

### 8. Budgets are per-category, not per-month
A "Groceries" budget applies to every month. Edit it to change the limit.

## Troubleshooting

### "App fails to load" (blank page)
Check DevTools console for script errors. Confirm you're opening
`/home/user/HacxGPT-CLI/home-base.html` specifically (not a stale copy),
and try a local server instead of `file://`.

### "localStorage is empty after refresh"
- Confirm the same file path/origin is used every time (localStorage is
  per-origin)
- Not in incognito/private mode
- Check DevTools → Application → Local Storage for `homeBase.v1` (or
  `homeBase.vault` if PIN-locked)

### Driver: "Cannot find Playwright"
```bash
cd /home/user/HacxGPT-CLI && npm install playwright
```

### Driver: chained commands don't see earlier commands' data
Almost always the persistent-profile issue (Gotcha #1) — confirm
`.browser-profile/` exists between runs and isn't being wiped by some
outer cleanup script.

### Driver: "Timeout ... waiting for locator" / "element is not visible"
The target button is very likely on a different tab than the one active
by default (Home), and the driver function didn't switch tabs first —
check whether the function you're calling includes a tab-switch (like
`addTransaction`/`addRoutine`/`addChild` all now do) before the click, or
add one. Also check for the ambiguous-selector trap (Gotcha #5).

## Human Path (Manual)

1. Open `home-base.html` (or the published Artifact URL) in a browser
2. Use the five tabs — Home, Children, Money, Goals, Daily
3. Optionally set a PIN (header lock icon) to encrypt local data at rest
4. Data saves automatically; use the header sync icon for backup/restore

## Next Steps

- **Backup:** header sync icon → copy the export JSON somewhere safe
  (especially before setting a PIN — there's no recovery if it's forgotten)
- **Deploy elsewhere:** the file is fully self-contained and portable to
  any static host; the Daily tab's cloud sync is Artifact-specific and
  won't follow it — that tab degrades to local-only elsewhere
- **Customize:** colors/shadows live in the `:root` CSS custom properties
  near the top of the file; icons live in the `ICON_PATHS` JS object

---

Neubrutalist design, custom SVG icons, local-first with optional PIN
encryption, one cloud-synced tab. Pure HTML + CSS + JavaScript, verified
end-to-end with Playwright throughout its development.
