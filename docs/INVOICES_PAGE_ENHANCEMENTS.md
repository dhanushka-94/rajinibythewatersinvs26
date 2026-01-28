# Invoices Page – Enhancement Ideas

Practical ideas to improve the **All Invoices** page (`/invoices`). Structured by area, with **what**, **why**, and **effort** (S/M/L).

---

## ✅ Implemented

- **Refresh button** – Reload list; spinner while loading.
- **Link stats to filters** – Click Total / Paid / Due / Draft to set status filter.
- **Quick date presets** – All, This month, Last 30 days, This quarter.
- **Debounced search** – 300 ms; search by invoice #, guest, email, phone, Ref.
- **Clear search (X)** – In search field when non-empty.
- **Overdue filter** – Status "Overdue" (check-out passed, balance due).
- **Overdue banner** – "X overdue invoices" when any exist.
- **Due summary card** – Retained; "View All Due" sets status filter.
- **Sort by column** – Invoice #, Guest, Check-in, Check-out, Nights, Total, Balance, Status (asc/desc).
- **Pagination** – 20 per page; Previous / Next.
- **Row click → detail** – Click row to open invoice; actions stop propagation.
- **Sticky table header** – When scrolling.
- **Export CSV** – Filtered (+ sorted) list as `invoices-YYYY-MM-DD.csv`.
- **Empty state** – Message + "Reset filters" when no results.
- **Loading skeleton** – Skeleton rows instead of "Loading…".
- **Keyboard shortcuts** – N = New invoice, R = Refresh, / = Focus search.
- **Guest title** – Shown before name when present.
- **Billing type indicator** – "Company" badge when `billingType === "company"`.
- **Currency badge** – USD/LKR chip per row.
- **Reference number** – "Ref: …" under invoice # when present.
- **Nights column** – Stay length (check-out − check-in).
- **Zebra rows** – Alternating row background.
- **Highlight due** – Orange left border; **overdue** – Red left border.
- **Payments link** – Header button to /payments.
- **Calendar link** – Header button to /bookings/calendar.
- **Mail link** – Per-row "View & send" (links to invoice detail).
- **Has active filters** – Includes search; Reset clears search.
- **Include search in reset** – Reset also clears search and debounced value.

---

## Current State (Summary)

- **Due Invoices** summary card (count, USD due, LKR due) with "View All Due" button
- **Filters:** Search (invoice #, guest, email), Status, Currency, Start/End date
- **Table:** Invoice #, Guest, Check-in, Check-out, Total, Balance, Status, Actions (View / Edit / Delete; paid = "Protected")
- Due rows highlighted (orange), due icon on invoice #
- Reset filters

---

## 1. UX & Navigation

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 1.1 | **Refresh button** | Reload list after creating/editing/sending without leaving the page | S |
| 1.2 | **Link stats to filters** | Add cards for Total / Paid / Due / Draft etc.; click to filter (like Bookings) | S |
| 1.3 | **Quick date presets** | "This month", "Last 30 days", "This quarter", "This year" for invoice date / check-in | S |
| 1.4 | **Sort by column** | Sort by Invoice #, Guest, Check-in, Check-out, Total, Balance, Status, Created (asc/desc) | M |
| 1.5 | **Row click → detail** | Click row to open invoice view; action buttons stop propagation | S |
| 1.6 | **Sticky table header** | Header stays visible when scrolling long lists | S |
| 1.7 | **Keyboard shortcuts** | e.g. N = New invoice, R = Refresh, / = Focus search | S |
| 1.8 | **View toggle: Table / Cards** | Optional card layout for smaller screens or preference | M |

---

## 2. Data & Display

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 2.1 | **Pagination** | 20–50 per page; avoid rendering 100s of rows | M |
| 2.2 | **Guest title** | Show title (Mr/Mrs/etc.) before guest name when present | S |
| 2.3 | **Billing type indicator** | Badge or icon: "Guest" vs "Company" (when `billingType === "company"`) | S |
| 2.4 | **Travel company name** | When billing to company, show company name in table or tooltip | M |
| 2.5 | **Reference number** | Show Ref # in table or tooltip when present | S |
| 2.6 | **Nights column** | Stay length (check-out − check-in) | S |
| 2.7 | **Created / Updated** | "Created X ago" or "Last updated …" for recent activity | S |
| 2.8 | **Currency badge** | Small USD/LKR chip per row for quick scan | S |
| 2.9 | **Zebra rows** | Alternating row background for readability | S |
| 2.10 | **Loading skeleton** | Skeleton rows instead of "Loading…" or blank | S |

---

## 3. Search & Filters

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 3.1 | **Search by phone** | Include guest phone (and phone2, phone3) in search | S |
| 3.2 | **Search by reference number** | Include `referenceNumber` in search | S |
| 3.3 | **Debounced search** | 300 ms delay; less thrashing while typing | S |
| 3.4 | **Clear search (X)** | Button in search field when non-empty | S |
| 3.5 | **Include search in "has active filters"** | Reset also clears search; "has active filters" includes search | S |
| 3.6 | **Filter by date type** | "Filter by: Invoice date / Check-in / Check-out" (currently implied check-in/out) | M |
| 3.7 | **"Overdue" filter** | Invoices with balance > 0 and check-out &lt; today | S |

---

## 4. Actions & Workflows

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 4.1 | **Export CSV** | Download filtered (and sorted) invoices as CSV | M |
| 4.2 | **Send email (from list)** | "Send" button per row for draft/sent; open modal or inline flow | M |
| 4.3 | **Print / PDF (from list)** | Quick print or PDF for selected invoice(s) | M |
| 4.4 | **Link to booking** | If invoice has `bookingId`, show "View booking" link | M |
| 4.5 | **Duplicate invoice** | "Duplicate" action to create a copy as draft | M |
| 4.6 | **Bulk actions** | Select multiple → Mark sent, Export, etc. (if needed) | L |

---

## 5. Alerts & Notifications

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 5.1 | **Overdue banner** | "X invoices overdue" (check-out past, balance > 0) when &gt; 0 | S |
| 5.2 | **Due-this-week** | Optional filter or banner for invoices due in next 7 days | S |
| 5.3 | **Highlight overdue rows** | Red left border or similar for overdue (vs orange for due) | S |

---

## 6. Visual & Layout

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 6.1 | **Empty state** | Friendly message + "Reset filters" / "Create first invoice" when no results | S |
| 6.2 | **Responsive table** | Horizontal scroll on small screens; consider hide columns on mobile | M |
| 6.3 | **Calendar link** | "View on calendar" per invoice (check-in date) | S |
| 6.4 | **Compact / comfortable density** | Toggle table row density (optional) | M |

---

## 7. Summary Stats (Expand Beyond Due)

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 7.1 | **Total count** | Total invoices (all or filtered) | S |
| 7.2 | **Paid count** | Number of paid invoices | S |
| 7.3 | **Draft count** | Number of drafts | S |
| 7.4 | **Total revenue (filtered)** | Sum of `total` for paid (or all) in USD and LKR | M |
| 7.5 | **Outstanding total** | Sum of remaining balance for due invoices (already have USD/LKR due) | S |

---

## 8. Integration

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 8.1 | **Create invoice from list** | Quick "Create invoice" that pre-fills from context (e.g. date range) | M |
| 8.2 | **Payments page link** | Link to payments filtered by invoice or date | S |
| 8.3 | **Reports link** | Link to revenue/invoice reports with same filters | S |

---

## Quick Wins (recommended first)

1. **Refresh button** – Reload list; spinner while loading.
2. **Loading skeleton** – Replace blank/loading text with skeleton rows.
3. **Debounced search** – 300 ms; include phone + reference number.
4. **Clear search (X)** – In search field when non-empty.
5. **Link stats to filters** – Add Total / Paid / Draft (etc.) cards; click to filter.
6. **Row click → detail** – Click row to open invoice view.
7. **Sticky table header** – When scrolling.
8. **Empty state** – Message + "Reset filters" when no results.
9. **Guest title** – Show when present.
10. **Sort by column** – At least Invoice #, Date, Total, Balance, Status.
11. **Pagination** – 20–30 per page.
12. **Export CSV** – Filtered (+ sorted) list.
13. **Keyboard shortcuts** – N, R, /.
14. **Overdue banner** – "X overdue" when check-out &lt; today and balance &gt; 0.
15. **Zebra rows** – Alternating background.

---

## Next Phase

- **Billing type / company indicator** – Badge or tooltip.
- **Travel company name** – When billing to company.
- **Quick date presets** – This month, Last 30 days, etc.
- **Send email from list** – Per-row "Send" for draft/sent.
- **Link to booking** – When invoice has `bookingId`.
- **Filter by date type** – Invoice date vs check-in vs check-out.
- **Revenue / outstanding summary** – Expand stats section.

---

## Out of Scope / Notes

- **Email layout** – Invoice email is separate; enhancements here are list-page only.
- **PDF export** – Handled on invoice detail view; "Print/PDF from list" could link there or open print dialog.
- **Bulk actions** – Likely L effort; add only if clearly needed.

---

## Implementation Notes

- Reuse patterns from **Bookings** page where applicable: `useDebouncedValue`, pagination, sort state, CSV export, keyboard shortcuts.
- Keep **Sri Lankan time** for dates (`formatDateSL`, `todaySL`).
- Ensure **currency** (USD/LKR) is always shown with amounts (already in place; preserve in new columns/stats).
