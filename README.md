# Student Finance Tracker

A vanilla HTML/CSS/JS, accessible, mobile-first web app for tracking student
spending: budgets, transactions, categories, currency conversion, and live
regex-powered search. Hope you enjoy!

**Live demo:** https://jmucyo-pixel.github.io/Student-Finance-Tracker
**Live demo video:** https://youtu.be/Jn9cwTHFnbY


---

## Features

- **Dashboard** with total records, total spent, top category, last-7-days
  spend, and a CSS-based 7-day trend chart.
- **Spending cap** with ARIA live remaining/over-budget messaging
  (polite when under, assertive when over).
- **Records table** (desktop) / **cards** (mobile) with sort by date,
  description (A–Z/Z–A), and amount (asc/desc).
- **Live regex search** across description, category, and date, with
  case-insensitive toggle, safe compilation (`try/catch`), and accessible
  `<mark>` highlighting.
- **Add / Edit / Delete** transactions with inline regex validation and
  error messages.
- **Multi-currency support**: base currency USD, with editable rates for
  EUR and RWF, and a display-currency selector.
- **Persistence** via `localStorage` — auto-saves every change.
- **JSON import/export** with structural validation, plus **CSV export**.
- **Light/Dark theme toggle** (persisted).
- Fully **keyboard accessible**, with skip link, visible focus states,
  semantic landmarks, and ARIA live regions.

---

## Project Structure

```
index.html
styles/
  main.css
scripts/
  app.js          # entry point, event wiring
  state.js        # in-memory state + CRUD + derived stats
  storage.js      # localStorage persistence + import validation
  validators.js   # regex validation rules + safe compiler + highlight
  search.js       # regex search + sorting
seed.json         # 12 sample records (edge cases included)
tests.html        # in-browser assertion tests
```

---

## Data Model

```json
{
  "id": "txn_0001",
  "description": "Lunch at cafeteria",
  "amount": 12.50,
  "category": "Food",
  "date": "2025-09-29",
  "createdAt": "2025-09-29T12:00:00.000Z",
  "updatedAt": "2025-09-29T12:00:00.000Z"
}
```

Default categories: `Food`, `Books`, `Transport`, `Entertainment`, `Fees`,
`Other` (editable via the category input's datalist).

---

## Regex Catalog

| Purpose | Pattern | Notes |
|---|---|---|
| Description validity | `/^\S(?:.*\S)?$/` | No leading/trailing spaces |
| No double spaces | `/^(?!.*\s{2}).*$/` | Negative lookahead |
| Amount format | `/^(0\|[1-9]\d*)(\.\d{1,2})?$/` | Up to 2 decimals, no leading zeros |
| Date format | `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/` | YYYY-MM-DD |
| Category format | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | Letters, single spaces/hyphens |
| **Advanced**: duplicate word | `/\b(\w+)\s+\1\b/i` | Back-reference; catches typos like "Lunch lunch" |

### Example search patterns (try these in the search box)

- `(coffee|tea)` — find beverage-related entries (case-insensitive)
- `\.\d{2}\b` — find entries whose date/description ends in two digits
- `^Lunch` — entries starting with "Lunch"
- `Food` with case-insensitive **off** — exact-case category match
- `(unclosed` — demonstrates safe handling of an invalid pattern (shows
  "Invalid regular expression" and zero results, no crash)

---

## Keyboard Map

| Key | Action |
|---|---|
| `Tab` / `Shift+Tab` | Move focus between interactive elements |
| `Enter` (on skip link) | Jump to main content |
| `Enter` / `Space` (on buttons) | Activate Edit / Delete / Export / Theme toggle |
| `Enter` (in search box) | No-op — search is live as you type |
| `Tab` to table action buttons | Edit and Delete are reachable per-row |
| Arrow keys (in `<select>`) | Change sort order / display currency |

All interactive elements have visible focus outlines (`:focus-visible`,
3px solid outline). The skip link becomes visible on focus and jumps to
`#main`.

---

## Accessibility Notes

- Semantic landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`.
- Proper heading hierarchy (`h1` → `h2` → `h3`).
- All form inputs have associated `<label>` elements.
- Errors announced via `role="alert"` next to each field.
- Form status messages use `role="status"` + `aria-live="polite"`.
- Search result count announced via a visually-hidden `aria-live="polite"`
  status region.
- Cap status uses `aria-live="polite"` when under budget and
  `aria-live="assertive"` when over.
- Trend chart has a descriptive `aria-label` summarizing all 7 days for
  screen reader users (it's not just a visual chart).
- Color contrast meets WCAG AA in both light and dark themes.
- `<mark>` highlighting in search results retains readable contrast in
  both themes.

---

## Running Tests

Open `tests.html` directly in a browser (or via GitHub Pages). It runs
in-browser assertions against the validators and search/sort modules and
prints a pass/fail summary.

---

## Running Locally

No build step required. Simply open `index.html` in a browser, or serve
the folder with any static server, e.g.:

```bash
npx serve .
```

---

## Notes on Currency

- Base currency is **USD**. All amounts are stored in USD internally.
- EUR and RWF rates are set manually in **Settings** (no external API).
- The **Display Currency** selector converts all displayed values
  (stats, table, cards, trend chart, cap status) on the fly.

---

## Author

- Name: Joel Mucyo
- GitHub: https://github.com/jmucyo-pixel
- Email: j.mucyo@alustudent.com
