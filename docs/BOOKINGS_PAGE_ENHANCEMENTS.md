# Bookings Page – Enhancement Ideas

Practical ideas to improve the **All Bookings** page (`/bookings`). Each includes **what**, **why**, and **effort** (S/M/L).

---

## ✅ Implemented

- **Refresh button** – Reload list; spinner while loading.
- **Link stats to filters** – Click Total / Confirmed / Checked In / Checked Out to set status filter.
- **Quick filters** – Arrivals today, Departures today, This week, Next 7 days, This month.
- **Debounced search** – 300 ms delay; search by booking #, guest, email, phone.
- **Clear search (X)** – Button in search field when non-empty.
- **"Has invoice" filter** – All / Has invoice / No invoice.
- **Nights column** – Stay length (check-out − check-in).
- **Invoice indicator** – FileText icon (green when has invoice, muted when not).
- **Guest title** – Shown before name when present.
- **Additional guests (+N)** – e.g. "John +2" when `guests` has extras.
- **Room type badge** – Chip for room type.
- **Sort by column** – Booking #, Guest, Check-in, Check-out, Nights, Room, Status (toggle asc/desc).
- **Pagination** – 20 per page; Previous / Next.
- **Row click → detail** – Click row to open booking; actions cell stops propagation.
- **Sticky table header** – Header stays visible when scrolling.
- **Arrivals / Departures today banners** – Counts when > 0.
- **Highlight arriving today** – Blue left border; **departing today** – Amber left border.
- **Zebra rows** – Alternating row background.
- **Loading skeleton** – Skeleton rows instead of "Loading...".
- **Empty state** – Message + "Reset filters" when no results.
- **Export CSV** – Download filtered (and sorted) bookings as CSV.
- **View on calendar** – Link per row to `/bookings/calendar`.
- **Keyboard shortcuts** – N = New booking, R = Refresh, / = Focus search.

---

## 1. UX & Navigation

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 1.1 | **Refresh button** | Reload list after creating/editing without leaving the page | S |
| 1.2 | **Quick filters / preset dates** | e.g. "Today", "This week", "Next 7 days", "This month" for check-in/check-out | S |
| 1.3 | **Link stats cards to filters** | Click "Checked In" → filter by checked_in; "Confirmed" → confirmed, etc. | S |
| 1.4 | **Sort by column** | Sort by Check-in, Check-out, Guest, Booking #, Status (toggle asc/desc) | M |
| 1.5 | **Saved filter presets** | e.g. "Arrivals today", "In-house", "Departures tomorrow" (stored in localStorage or user prefs) | M |
| 1.6 | **View toggle: Table / Cards** | Optional card layout for smaller screens or preference | M |

---

## 2. Data & Display

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 2.1 | **Pagination or virtualisation** | Avoid loading 100s of rows; faster render and scroll | M |
| 2.2 | **Show additional guests count** | e.g. "John Doe +2" when `guests` array has extra guests | S |
| 2.3 | **Guest title** | Show title (Mr/Mrs/etc.) next to guest name if present | S |
| 2.4 | **Room type badge or chip** | Visual distinction for room types | S |
| 2.5 | **"Nights" column** | Show stay length (check-out − check-in) | S |
| 2.6 | **Invoice status** | Icon or badge: "Has invoice" / "No invoice" (especially for checked-out) | S |
| 2.7 | **Travel company** | If billing to company, show company name in table or tooltip | M |
| 2.8 | **Last updated** | Show `updatedAt` or "Modified X ago" for recent changes | S |

---

## 3. Search & Filters

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 3.1 | **Search by phone** | Include guest phone in search | S |
| 3.2 | **Search by room type** | Filter by room type | S |
| 3.3 | **Search by travel company** | Filter when billing to company | M |
| 3.4 | **Filter by "Has invoice"** | Show only bookings with / without invoice | S |
| 3.5 | **"Check-in today" / "Check-out today"** | One-click filters for front desk | S |
| 3.6 | **Clear search (X) in search field** | Quick reset when search is active | S |
| 3.7 | **Debounced search** | Avoid filter thrashing while typing | S |

---

## 4. Actions & Workflows

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 4.1 | **Bulk actions** | Select multiple → e.g. export, bulk status update (if you reintroduce it), or tag | M |
| 4.2 | **"Create invoice" from list** | For checked-out without invoice; quick action without opening detail | M |
| 4.3 | **"Check in" / "Check out" from list** | Optional quick status change from table (you previously removed it; could be reintroduced as opt‑in) | M |
| 4.4 | **Row click → detail** | Click row (not just View) to open booking detail | S |
| 4.5 | **Keyboard shortcuts** | e.g. N = New booking, R = Refresh, / = focus search | S |
| 4.6 | **Export filtered list** | CSV/Excel of current filtered bookings | M |

---

## 5. Visual & Layout

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 5.1 | **Sticky table header** | Keep column headers visible when scrolling | S |
| 5.2 | **Zebra rows** | Alternating row background for readability | S |
| 5.3 | **Compact / comfortable density** | Toggle between tight and relaxed row height | S |
| 5.4 | **Highlight "arriving today" / "departing today"** | Soft background or icon for same-day check-in/check-out | S |
| 5.5 | **Empty state illustration** | Friendly empty state when no bookings match filters | S |
| 5.6 | **Loading skeleton** | Table skeleton instead of "Loading bookings..." | S |

---

## 6. Mobile & Responsiveness

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 6.1 | **Responsive table** | Horizontal scroll or card layout on small screens | M |
| 6.2 | **Hide less critical columns on mobile** | e.g. show Guest, Check-in, Check-out, Status, Actions only | S |
| 6.3 | **Floating "New booking" button** | Always visible on mobile | S |
| 6.4 | **Collapsible filters** | Filters in a drawer or accordion on mobile | S |

---

## 7. Alerts & Notifications

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 7.1 | **"X arrivals today" banner** | Prominent count at top when filter includes today | S |
| 7.2 | **"X departures today"** | Same for check-outs | S |
| 7.3 | **Early check-in / late checkout indicator** | Icon or badge in table for bookings with early check-in or late checkout | M |
| 7.4 | **Overdue check-out** | Highlight stayed past check-out date | M |

---

## 8. Integration

| # | Idea | Why | Effort |
|---|------|-----|--------|
| 8.1 | **Direct link to Calendar** | "View on calendar" per booking → open calendar focused on that date | S |
| 8.2 | **Print / PDF list** | Print or export current filtered list as PDF | M |
| 8.3 | **Activity log link** | Link to activity log filtered by booking ID (if supported) | S |

---

## 9. Suggested "Quick Wins" (Low Effort, High Value)

1. **Refresh button** (1.1)  
2. **Link stats cards to filters** (1.3)  
3. **"Nights" column** (2.5)  
4. **Invoice status indicator** (2.6)  
5. **Search by phone** (3.1)  
6. **Row click → detail** (4.4)  
7. **Sticky table header** (5.1)  
8. **"X arrivals today" banner** (7.1)  
9. **"Check-in today" / "Check-out today" quick filters** (3.5)  
10. **Loading skeleton** (5.6)  

---

## 10. Suggested "Next Phase" (Medium Effort)

1. **Sort by column** (1.4)  
2. **Pagination** (2.1)  
3. **Quick date presets** (1.2)  
4. **Export filtered list** (4.6)  
5. **"Create invoice" from list** (4.2)  
6. **Responsive table / cards** (6.1, 1.6)  
7. **Debounced search** (3.7)  

---

## 11. Out of Scope (For Reference)

- **Status change from list** – You chose to remove this; keep status updates on detail/edit only unless you decide otherwise.
- **Inline edit** – Full editing remains on the edit page; these ideas focus on list UX, filters, and quick actions.

---

## 12. Implementation Notes

- **Date handling:** Use `formatDateSL` and Sri Lanka timezone for all displayed dates.  
- **Filters:** Stats and "arrivals today" etc. can use `filteredBookings` or a dedicated derived list.  
- **API:** Existing `/api/bookings` returns all bookings; pagination would require API support (e.g. `?limit=&offset=` or cursor).  
- **Sorting:** Can be done client-side on `filteredBookings` before render.

Use this as a backlog and tick off items as you implement them.
