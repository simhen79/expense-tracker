# Expensa

A personal expense tracker built with Next.js 14 (App Router), TypeScript and Tailwind CSS.
Data is stored in the browser's `localStorage` — there is no backend and nothing leaves the machine.

## Running it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

If port 3000 is taken, use another: `npm run dev -- -p 3100`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build (run `build` first) |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run test:watch` | Unit tests in watch mode |

## What's where

```
app/
  layout.tsx          Root shell — mounts the providers, header and shared modal
  page.tsx            Dashboard: summary cards, charts, recent activity
  expenses/page.tsx   Full list with search, filters and CSV export
components/
  providers/          ExpenseProvider (state + persistence), ToastProvider
  dashboard/          Summary cards, donut, monthly bars, recent activity
  expenses/           List, filter bar, form, modal
  ui/                 Button, Card, Field, Modal, Badge, States
lib/                  Pure logic — no React imports, fully unit-tested
```

### Design notes

**Money is stored as integer cents.** Floats drift (`0.1 + 0.2 !== 0.3`), and that drift is
visible once you sum a few hundred rows. Conversion to and from a display string happens only at
the edges, in `lib/format.ts`.

**Amounts are displayed in rands via `en-ZA`** — `R 1 234,56`, grouped with non-breaking spaces
and a comma decimal. The input parser accepts both `42,50` and `42.50`; a trailing comma group is
read as a decimal separator rather than grouping, since treating it as grouping would turn
`42,50` into `R 4 250,00`.

**Dates are `'YYYY-MM-DD'` strings, not `Date` objects.** `new Date('2026-08-07')` parses as UTC
midnight and renders as August 6th in any negative-offset timezone. Fixed-width strings also sort
and range-filter correctly with plain comparison operators.

**All state lives in one client-side provider.** `localStorage` doesn't exist on the server, so the
provider starts empty on both server and client and loads real data in an effect after hydration.
Skeletons cover the gap — the SSR constraint and the loading-state requirement solve each other.

**`lib/` has no React imports.** That's what lets the logic be tested in milliseconds without a DOM.

## Testing it by hand

Start the dev server, then:

**Add**
1. Click **+ Add Expense**. The date defaults to today and focus lands on the amount field.
2. Submit empty — inline errors appear and the submit is blocked.
3. Enter `42.50`, category **Food**, description `Lunch`. Save. A toast confirms, and the summary
   cards, donut and recent list all update.
4. Try `R1 234,56` in the amount field — the currency symbol, grouping separators and a
   comma decimal are all accepted. `1234.56` works too.

**Persistence**
5. Reload the page. Your expenses are still there.

**Edit / delete**
6. Hover a row and click the pencil. The form opens pre-filled; change the amount and save — the
   totals move by exactly the difference.
7. Click the trash icon. The confirmation names the specific expense; cancel leaves it untouched.

**Filter, search, export**
8. Go to **Expenses**. Set Category to **Bills** and a From/To range. The header shows
   "N expenses of M" with the filtered total, and a **Clear filters** button appears.
9. Type in the search box — it matches description and category, case-insensitively.
10. Click **Export CSV**. The download contains only the filtered rows. Descriptions containing
    commas or quotes are escaped per RFC 4180 (try one containing `Cinema, "the good one"`).

**Keyboard and screen reader**
11. Open the modal and press `Tab` repeatedly — focus stays inside the dialog.
12. Press `Escape`. The modal closes and focus returns to the button that opened it.

**Responsive**
13. Narrow the window below 640px. The table becomes stacked cards, filters go single-column, and
    the page never scrolls horizontally.

**Empty and error states**
14. Clear storage (`localStorage.clear()` in the console) and reload for the empty state.
15. Write junk (`localStorage.setItem('expensa.expenses.v1', 'not json')`) and reload — the app
    recovers with an error toast instead of a blank screen.

## Automated tests

`npm test` covers the pure modules, where the bugs that matter live: cent rounding, timezone-safe
date formatting, month-boundary and year-boundary bucketing, inclusive date-range filtering, and
CSV escaping.
