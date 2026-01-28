# Booking Calendar – Enhancement Suggestions

Practical ideas to improve the Booking Calendar, grouped by area. Each includes **what**, **why**, and **effort** (S/M/L).

---

## ✅ Implemented (current release)

- **Refresh button** – Reload bookings for the visible month.
- **Month/year jump** – Select dropdowns for month and year.
- **Status filter** – "Show status" checkboxes (hide e.g. Cancelled).
- **Toggle holidays** – "Show Sri Lankan holidays" checkbox.
- **Room type on chip** – Booking chips show room type when set.
- **Richer tooltips** – Tooltip includes status, room, nights, phone.
- **Invoice link on chip** – FileText icon links to invoice when `invoiceId` exists.
- **Click day → Day agenda** – Dialog with full list for that day, "New booking" (check-in prefilled), View/Edit/View invoice actions.
- **Load by date range** – Uses `getBookingsByDateRange` for the visible month.
- **Occupancy summary** – Check-ins, check-outs, and active bookings in view for the month.
- **Keyboard shortcuts** – ← / → change month, T = Today (when agenda closed).
- **New booking prefill** – `/bookings/new?checkIn=YYYY-MM-DD` prefills check-in and check-out (+1 day).

---

## 1. Navigation & UX

| # | Suggestion | Why | Effort |
|---|------------|-----|--------|
| 1.1 | **Refresh button** | Reload bookings after creating/editing without leaving the page | S |
| 1.2 | **Month/year dropdown or date picker** | Jump directly to any month/year instead of clicking prev/next many times | S |
| 1.3 | **Keyboard shortcuts** | e.g. ←/→ for prev/next month, T for Today, N for New Booking | S |
| 1.4 | **Click day → “View all” / day agenda** | See full list for that day (not just 3 + “+N more”), with links to each booking | M |
| 1.5 | **Week view** | Optional view: one week with more space per day for bookings | M |

---

## 2. Data & Performance

| # | Suggestion | Why | Effort |
|---|------------|-----|--------|
| 2.1 | **Load by date range** | Fetch only bookings for visible month (±1) instead of all bookings. Add `getBookingsByDateRange(start, end)` if needed | M |
| 2.2 | **Reload on focus** | When user returns to the tab/window, optionally refresh bookings (e.g. `visibilitychange`) | S |
| 2.3 | **Pagination or virtualisation** | If you add week/list views with many items, avoid rendering hundreds of nodes at once | M |

---

## 3. Visual & Display

| # | Suggestion | Why | Effort |
|---|------------|-----|--------|
| 3.1 | **Room type or room label** | Show room type (or room #) on each booking chip so staff see *where* guests are | S |
| 3.2 | **Guest count** | e.g. “2 adults, 1 child” or “3 pax” on the chip | S |
| 3.3 | **Status filter** | Toggle visibility of statuses (e.g. hide Cancelled, or show only Checked In) | S |
| 3.4 | **Compact / expanded toggle** | Compact: fewer chips per cell, less scroll; expanded: more detail | S |
| 3.5 | **Colour by room type** | Different colour per room type instead of (or in addition to) status | M |
| 3.6 | **“Busy” indicator** | e.g. badge or colour intensity for “X check-ins today” or “X% occupancy” | M |

---

## 4. Functionality

| # | Suggestion | Why | Effort |
|---|------------|-----|--------|
| 4.1 | **Click empty cell → “New booking”** | Pre-fill check-in (and optionally check-out) when creating from that day | M |
| 4.2 | **Day agenda / side panel** | Click a day to open a drawer/panel: list of bookings, “New booking”, quick actions | M |
| 4.3 | **Quick actions on chip** | e.g. View, Edit, Check In, Create Invoice (for checked-out), without leaving calendar | M |
| 4.4 | **Occupancy summary** | For a selected day or month: “Y rooms occupied / Z total” or “N check-ins, M check-outs” | M |
| 4.5 | **Export** | Export month view or day agenda as PDF/CSV for front desk or management | L |
| 4.6 | **Tooltip improvements** | Add status, room type, nights, guest phone in tooltip for faster scanning | S |

---

## 5. Filters & Views

| # | Suggestion | Why | Effort |
|---|------------|-----|--------|
| 5.1 | **Filter by status** | Show only Booked, Confirmed, Checked In, etc. | S |
| 5.2 | **Filter by room type** | If you have room types, filter calendar to one or several | M |
| 5.3 | **Filter by guest/travel company** | Search by guest name or company and highlight those bookings | M |
| 5.4 | **Toggle holidays** | Option to hide Sri Lankan holidays to simplify the view | S |
| 5.5 | **Toggle weekend highlighting** | Option to turn off Sat/Sun colours | S |

---

## 6. Mobile & Responsiveness

| # | Suggestion | Why | Effort |
|---|------------|-----|--------|
| 6.1 | **Responsive grid** | On small screens: larger cells, fewer columns, or list-like layout per day | M |
| 6.2 | **Swipe months** | Swipe left/right to change month on touch devices | M |
| 6.3 | **Bottom sheet for day** | On mobile, tap day → bottom sheet with that day’s bookings and actions | M |
| 6.4 | **Sticky header** | Keep month + prev/today/next visible while scrolling | S |

---

## 7. Accessibility & i18n

| # | Suggestion | Why | Effort |
|---|------------|-----|--------|
| 7.1 | **ARIA labels** | `aria-label` on nav buttons, day cells, booking chips; `role` where it helps | S |
| 7.2 | **Focus management** | When opening day agenda or a modal, move focus there and trap it until closed | S |
| 7.3 | **High-contrast / reduced motion** | Respect `prefers-reduced-motion`; ensure status colours work with high contrast | S |
| 7.4 | **Sinhala date labels** | Optional Sinhala for day names or month names (if you support Sinhala elsewhere) | M |

---

## 8. Integration with Rest of System

| # | Suggestion | Why | Effort |
|---|------------|-----|--------|
| 8.1 | **Link to invoice** | If `booking.invoiceId` exists, show a small “Invoice” icon on chip → `/invoices/{id}` | S |
| 8.2 | **Check-in / Check-out actions** | From calendar: “Check in” / “Check out” → update status (and trigger invoice on checkout if you do that) | M |
| 8.3 | **“Create invoice” from calendar** | For checked-out bookings without invoice, quick action to create one | M |
| 8.4 | **Notifications / reminders** | e.g. “3 check-ins tomorrow” in dashboard or calendar header | L |

---

## 9. Suggested “Quick Wins” (Low Effort, High Value)

1. **Refresh button** (1.1)  
2. **Month/year jump** (1.2)  
3. **Room type on chip** (3.1)  
4. **Status filter** (3.3)  
5. **Toggle holidays** (5.4)  
6. **Richer tooltips** (4.6)  
7. **Invoice link on chip** (8.1)  

---

## 10. Suggested “Next Phase” (Medium Effort)

1. **Click day → day agenda / side panel** (1.4 + 4.2)  
2. **Click empty cell → New booking** with date pre-filled (4.1)  
3. **Load by date range** (2.1)  
4. **Occupancy summary** for day/month (4.4)  
5. **Quick actions on chip** – View, Edit, Check In, etc. (4.3)  

---

## 11. Implementation Notes

- **Date handling:** Keep using `getTodaySLParts()` and `Asia/Colombo` for “today” and any date-based logic.
- **Bookings API:** `getBookingsByDateRange(start, end)` already exists in `@/lib/bookings`; use it when you add range-based loading.
- **Holidays:** `getHolidayForDate` / `getHolidaysForYear` remain the source; add a simple boolean “show holidays” in UI state for 5.4.
- **Status colours:** Reuse existing `getStatusColor`; filters only hide/show, they don’t change how status is stored.

You can use this as a backlog and tick items off as you implement them.
