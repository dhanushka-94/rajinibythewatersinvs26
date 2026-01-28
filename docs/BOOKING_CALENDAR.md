# Booking Calendar – Overview

Everything about the **Booking Calendar** feature: route, UI, data, holidays, and behavior.

---

## 1. Route & Navigation

| Item | Value |
|------|--------|
| **URL** | `/bookings/calendar` |
| **Page file** | `src/app/bookings/calendar/page.tsx` |
| **Sidebar** | "Booking Calendar" under Bookings (icon: `CalendarDays`), roles: admin, manager, staff, viewer |
| **Bookings list** | "Calendar View" button → links to `/bookings/calendar` |

---

## 2. Page Layout & UI

### Header
- **Title:** "Booking Calendar"
- **Subtitle:** "View bookings and check availability"
- **Action:** "New Booking" button → `/bookings/new`

### Calendar card
- **Header:** Month + year (e.g. "January 2025")
- **Controls:**
  - **Previous month** (chevron left)
  - **Today** – jump to current month (Sri Lankan date)
  - **Next month** (chevron right)

### Day headers
- **Week starts:** Monday  
- **Labels:** Mon, Tue, Wed, Thu, Fri, Sat, Sun

### Calendar grid
- **Layout:** 7 columns × 6 rows (42 cells)
- **Cells:** Each day cell shows:
  - Day number
  - Sri Lankan holiday (if any) with 🎉 + name
  - Up to 3 bookings; "+N more" if there are more
- **Empty leading/trailing cells:** Faded, for days outside the current month

### Legend card
- **Booking status colors:** Booked, Confirmed, Checked In, Checked Out, Cancelled
- **Holidays & indicators:** Sri Lankan holiday, Saturday, Sunday, check-in / check-out markers

---

## 3. Data & Logic

### Data source
- **API:** None. Uses `getBookings()` from `@/lib/bookings`.
- **Storage:** Supabase `bookings` table (or in-memory fallback).
- **Load:** All bookings fetched once on mount; no month-based filtering.

### Date handling
- **Today:** `getTodaySLParts()` from `@/lib/date-sl` (Sri Lanka `Asia/Colombo`).
- **Month navigation:** `currentDate` is first day of month; `year` / `month` derived from it.
- **Week start:** Monday. `getDay()` adjusted: Sunday → 6, others shifted so Mon = 0.

### Booking–date logic
- **`getBookingsForDate(date)`:** Keeps bookings where `date` is **between** `checkIn` and `checkOut` (inclusive).
- **`isCheckInDate(date, booking)`:** `booking.checkIn === dateStr` (YYYY-MM-DD).
- **`isCheckOutDate(date, booking)`:** `booking.checkOut === dateStr`.

### Status colors (badges)
| Status      | Style (Tailwind) |
|------------|-------------------|
| Booked     | `bg-purple-100 border-purple-300 text-purple-800` |
| Confirmed  | `bg-blue-100 border-blue-300 text-blue-800` |
| Checked In | `bg-green-100 border-green-300 text-green-800` |
| Checked Out| `bg-gray-100 border-gray-300 text-gray-800` |
| Cancelled  | `bg-red-100 border-red-300 text-red-800` |

---

## 4. Day Cell Styling

| Condition | Effect |
|-----------|--------|
| Outside current month | `bg-muted/30 opacity-50` |
| Saturday (and not holiday) | `bg-blue-50 border-blue-200` |
| Sunday (and not holiday) | `bg-indigo-50 border-indigo-200` |
| Sri Lankan holiday | `bg-amber-50 border-amber-200` |
| Today | `ring-2 ring-primary` |
| Has bookings | `border-primary/50` |

---

## 5. Booking Chips in Cells

- **Link:** Each booking chip links to `/bookings/{id}`.
- **Check-in:** Left blue bar + 🔑 + guest name.
- **Check-out:** Right blue bar + 🚪 + guest name.
- **Tooltip:** `{bookingNumber} - {guest.name} ({checkIn} to {checkOut})`.
- **Display:** Guest name + booking number; max 3 per day, then "+N more".

---

## 6. Sri Lankan Holidays

**Source:** `@/lib/sri-lankan-holidays`

- **`getHolidayForDate(date)`** – returns holiday for a given date, if any.
- **`getHolidaysForYear(year)`** – all holidays for a year.
- **`getHolidaysForDateRange(start, end)`** – holidays in a date range.

**Types:** `national` | `religious` | `cultural`

**Fixed (same date each year):**
- Independence Day: Feb 4  
- Christmas Day: Dec 25  

**Other (year-specific, some approximate):**
- Sinhala and Tamil New Year: Apr 13–14  
- Full Moon Poya days (e.g. Duruthu, Navam, Vesak, Poson, etc.)  
- Day following Vesak  
- Good Friday  
- Deepavali  
- Maha Shivaratri  
- Tamil Thai Pongal Day: Jan 15  

Poya and other movable holidays use predefined dates per year (e.g. 2024 vs 2025) in the module.

---

## 7. Dependencies

| Import | Purpose |
|--------|---------|
| `getBookings` | `@/lib/bookings` – fetch all bookings |
| `getHolidayForDate`, `Holiday` | `@/lib/sri-lankan-holidays` – holiday for a day |
| `getTodaySLParts` | `@/lib/date-sl` – today in Sri Lanka |
| `Booking`, `BookingStatus` | `@/types/booking` |
| `Card`, `Button`, `Badge` | UI components |
| `ChevronLeft`, `ChevronRight`, `Calendar as CalendarIcon`, `Plus` | `lucide-react` |
| `Link` | `next/link` |

---

## 8. Files Touching the Booking Calendar

| File | Role |
|------|------|
| `src/app/bookings/calendar/page.tsx` | Calendar page (UI + logic) |
| `src/lib/bookings.ts` | `getBookings()` |
| `src/lib/sri-lankan-holidays.ts` | Holiday definitions + `getHolidayForDate` |
| `src/lib/date-sl.ts` | `getTodaySLParts()` for "today" |
| `src/types/booking.ts` | `Booking`, `BookingStatus` |
| `src/components/layout/sidebar.tsx` | "Booking Calendar" nav item |
| `src/app/bookings/page.tsx` | "Calendar View" button |

---

## 9. Quick Reference: Calendar Page Snippet

```tsx
// Key state
const [bookings, setBookings] = useState<Booking[]>([]);
const [currentDate, setCurrentDate] = useState(() => {
  const t = getTodaySLParts();
  return new Date(t.year, t.month, 1);
});
const [loading, setLoading] = useState(true);

// Load once on mount
useEffect(() => { loadBookings(); }, []);

// Navigate
goToPreviousMonth() → new Date(year, month - 1, 1)
goToNextMonth()    → new Date(year, month + 1, 1)
goToToday()        → getTodaySLParts() → new Date(y, m, 1)
```

---

## 10. Behaviour Summary

1. **Month view** – 7×6 grid, week starts Monday.  
2. **Today** – Highlighted with ring; uses Sri Lankan date.  
3. **Bookings** – Shown on every day between check-in and check-out; chips link to booking detail.  
4. **Check-in / check-out** – Visual markers (🔑 / 🚪, blue borders) on those exact dates.  
5. **Weekends** – Saturday (blue) and Sunday (indigo) backgrounds.  
6. **Holidays** – Amber background + holiday name.  
7. **Status** – Badge colors per booking status.  
8. **Navigation** – Prev/Next month, Today, plus "New Booking" in header.
