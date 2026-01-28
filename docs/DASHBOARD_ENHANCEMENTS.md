# Dashboard Page – Enhancement Ideas

Practical ideas to improve the **Dashboard** (`/`). The dashboard currently focuses on invoices; the app also has **bookings**, **guests**, **payments**, and **reports**. Ideas are grouped by area, with **effort** (S/M/L).

---

## ✅ Implemented

- **Refresh button** – Reload dashboard data; loading spinner.
- **Loading skeleton** – Skeleton rows for stats, revenue, and lists while fetching.
- **Error state** – Message + “Retry” when fetch fails.
- **Parallel fetch** – Invoices, bookings, and guests loaded via `Promise.all`.
- **Stat cards clickable** – Total → /invoices; Paid → /invoices?status=paid; Due → /invoices?status=due.
- **Status breakdown clickable** – Each status links to /invoices?status=X.
- **Overdue banner** – “X overdue invoices” at top when > 0; link to /invoices?status=overdue.
- **Arrivals / Departures today banners** – When > 0; link to /bookings?arrivals_today or /bookings?departures_today.
- **Due card always visible** – Shows “0 due” when none; USD/LKR due, “due this week” note, View Due link.
- **Revenue by period** – Tabs: All / This month / Last month; USD and LKR revenue + paid-invoice count.
- **USD vs LKR revenue** – Shown separately in Revenue by Currency card.
- **Outstanding (due) amount** – In Due stat subtitle and Due card (USD + LKR).
- **Overdue count** – Overdue banner and distinct from “Due”.
- **Booking stats** – Today widget: Arrivals today, Departures today, Checked in now; upcoming check-ins (next 7 days).
- **“Today” widget** – Arrivals, Departures, Checked in, Guests count, View Calendar.
- **Guest count** – In Today widget; links to /settings/guests.
- **Recent invoices** – Balance or “Paid” per row; guest title; empty state + “Create invoice” CTA.
- **Recent bookings** – Last 5; link to detail; empty state + “New booking” CTA.
- **Recent payments** – Last 5 (flattened from invoices); invoice link; empty state.
- **Quick Actions** – New Invoice, New Booking, Invoices, Bookings, Calendar, Guests, Reports, Payments.
- **“View on calendar”** – View Calendar in Today widget; Calendar in Quick Actions.
- **Keyboard shortcuts** – N = New invoice, R = Refresh.
- **Due this week** – Shown in Due card when any check-out in next 7 days has balance due.
- **Empty states** – Recent Invoices, Recent Bookings, Recent Payments each have message + CTA.
- **Invoices URL sync** – /invoices?status=, ?currency= applied on load.
- **Bookings URL sync** – /bookings?arrivals_today, ?departures_today set quick filter on load.

---

## Current State (Summary)

- **Header:** Title, LiveClock (Sri Lanka time), Create New Invoice
- **4 stat cards:** Total Invoices, Paid Invoices, Due Invoices, Total Revenue (USD + LKR combined)
- **Revenue by Currency:** USD / LKR revenue, paid-invoice counts
- **Due Invoices card** (when due > 0): count, USD/LKR due, “View Due Invoices” → `/invoices?status=due`
- **Status Breakdown:** Paid, Partially Paid, Pending, Sent, Draft, Cancelled
- **Recent Invoices:** First 5, link to detail; “View All” → `/invoices`
- **Quick Actions:** New Invoice, All Invoices, Reports, Payments

---

## 1. Data & Metrics

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 1.1 | **Revenue by period** | “This month” vs “Last month” vs “All time”; toggle or tabs | M |
| 1.2 | **USD vs LKR revenue separately** | Total Revenue card currently combines; show split or separate cards | S |
| 1.3 | **Outstanding (due) amount** | Sum of remaining balance (USD + LKR) in a dedicated stat or subtitle | S |
| 1.4 | **Overdue count** | Invoices with check-out passed + balance due; distinct from “Due” | S |
| 1.5 | **Booking stats** | Total bookings, Checked in today, Arrivals today, Departures today | M |
| 1.6 | **Occupancy snapshot** | e.g. “X rooms occupied” if you track room inventory | L |
| 1.7 | **Guest count** | Total guests (from guests table) | S |
| 1.8 | **Payment stats** | Total payments count, or “Payments this month” | M |

---

## 2. UX & Navigation

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 2.1 | **Refresh button** | Reload dashboard data without full page refresh | S |
| 2.2 | **Loading state** | Skeleton or spinner while fetching invoices (and bookings if added) | S |
| 2.3 | **Stat cards clickable** | e.g. “Due Invoices” → `/invoices` with due filter; “Paid” → paid filter | S |
| 2.4 | **Status breakdown clickable** | Each status links to filtered invoices list | S |
| 2.5 | **Keyboard shortcut** | e.g. N → New invoice, R → Refresh | S |
| 2.6 | **“View on calendar”** | Link to Booking Calendar from header or Quick Actions | S |
| 2.7 | **Bookings / Guests in Quick Actions** | Add “Bookings”, “Calendar”, “Guests” | S |
| 2.8 | **Date range selector** | “Show stats for: Today / This week / This month / All time” | M |

---

## 3. Layout & Visual

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 3.1 | **Overdue banner** | “X overdue invoices” at top when > 0; link to filtered list | S |
| 3.2 | **Arrivals / Departures today banners** | “X arrivals today”, “X departures today” when > 0; link to bookings | M |
| 3.3 | **Recent invoices: show balance** | Add “Balance” or “Paid” next to total for quick scan | S |
| 3.4 | **Recent invoices: guest title** | Show guest title (Mr/Mrs etc.) when present | S |
| 3.5 | **Recent items: limit configurable** | e.g. 5 vs 10 recent invoices | S |
| 3.6 | **Due card always visible** | Show “0 due” when none, instead of hiding card | S |
| 3.7 | **Revenue chart** | Simple bar/line chart: revenue by month or by status | L |
| 3.8 | **Compact mode** | Optional denser layout for smaller screens | M |

---

## 4. Bookings Integration

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 4.1 | **“Today” widget** | Arrivals today, Departures today, Checked in (from bookings) | M |
| 4.2 | **Recent bookings** | Last 5 bookings with link to detail; “View all” → /bookings | M |
| 4.3 | **Upcoming check-ins** | Next 7 days check-ins (from bookings) | M |
| 4.4 | **Quick “New booking”** | Button in Quick Actions or header | S |
| 4.5 | **Calendar link** | Prominent link to Booking Calendar | S |

---

## 5. Invoices & Payments

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 5.1 | **Fix “View Due” link** | Use `/invoices?status=due` or ensure query works with new filters | S |
| 5.2 | **Due by currency** | Already in Due card; ensure visible and correct | - |
| 5.3 | **“Recent payments”** | Last 5 payments with amount, date, invoice link | M |
| 5.4 | **Draft reminder** | “X drafts” with link to filter drafts | S |
| 5.5 | **Sent vs Pending** | Optional “Awaiting payment” (sent + pending) count | S |

---

## 6. Alerts & Notifications

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 6.1 | **Overdue alert** | Banner or highlighted card when overdue > 0 | S |
| 6.2 | **Due this week** | Invoices due (check-out) in next 7 days | S |
| 6.3 | **Empty states** | “No invoices yet” / “No bookings” with CTA to create | S |
| 6.4 | **Error state** | If fetch fails, show message + “Retry” | S |

---

## 7. Performance & Data

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 7.1 | **Parallel fetch** | Load invoices and bookings (if used) in parallel | S |
| 7.2 | **Cache / revalidate** | Consider stale-while-revalidate for dashboard data | M |
| 7.3 | **Lazy load charts** | If you add charts, load after above-the-fold content | M |

---

## Quick Wins (recommended first)

1. **Refresh button** – Reload dashboard data; optional loading state.
2. **Loading skeleton** – For stats and recent invoices while fetching.
3. **Stat cards clickable** – Total → /invoices; Paid → paid filter; Due → due filter.
4. **Status breakdown clickable** – Each row links to /invoices with that status filter.
5. **Overdue banner** – “X overdue” when > 0; link to /invoices?status=overdue (or equivalent).
6. **Due card always visible** – Show “0 due” when none.
7. **Quick Actions:** Add **Bookings**, **Calendar**, **Guests**.
8. **“View on calendar”** – Link to /bookings/calendar.
9. **Recent invoices:** **Balance** or “Paid” indicator.
10. **Keyboard shortcut** – N = New invoice, R = Refresh.
11. **Fix / verify “View Due” link** – Ensure it works with current Invoices page filters.

---

## Next Phase

- **Booking stats** – Arrivals today, Departures today, Checked in.
- **“Today” widget** – Combined arrivals/departures/checked-in.
- **Revenue by period** – This month / Last month / All time.
- **Recent bookings** – List + “View all”.
- **Date range selector** – For stats.
- **Overdue count** – Separate from “Due”.
- **Recent payments** – Last 5 with links.
- **Revenue chart** – By month or similar.

---

## Out of Scope / Notes

- **Auth / roles** – Dashboard may later vary by role; not covered here.
- **Real-time updates** – WebSockets/polling for live stats; possible future enhancement.
- **Customisable widgets** – Drag-and-drop layout; likely L effort.
- **Export dashboard** – PDF/print summary; possible later.

---

## Implementation Notes

- Use **Sri Lankan time** for “today” and any date-based stats (`todaySL`, `formatDateSL`).
- Reuse **invoice helpers** from Invoices page (`calculateRemainingBalance`, `isDueInvoice`, `isOverdueInvoice`).
- For **bookings**, use `getBookings()` or `/api/bookings`; filter by check-in/check-out vs `todaySL()` for “today” metrics.
- **Currency:** Keep USD and LKR explicit; avoid misleading “combined” totals where possible.
- **Links:** Use query params that match the enhanced Invoices page filters (e.g. `?status=due`, `?status=overdue`).
