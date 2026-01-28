"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Booking, BookingStatus } from "@/types/booking";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  RefreshCw,
  FileText,
  Eye,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBookingsByDateRange } from "@/lib/bookings";
import { getHolidayForDate } from "@/lib/sri-lankan-holidays";
import { getTodaySLParts, toDateStrLocal, formatDateSL } from "@/lib/date-sl";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const ALL_STATUSES: BookingStatus[] = [
  "booked",
  "confirmed",
  "checked_in",
  "checked_out",
  "cancelled",
];

function getStatusColor(status: BookingStatus): string {
  const colors: Record<BookingStatus, string> = {
    booked: "bg-purple-100 border-purple-300 text-purple-800",
    confirmed: "bg-blue-100 border-blue-300 text-blue-800",
    checked_in: "bg-green-100 border-green-300 text-green-800",
    checked_out: "bg-gray-100 border-gray-300 text-gray-800",
    cancelled: "bg-red-100 border-red-300 text-red-800",
  };
  return colors[status] || "bg-gray-100 border-gray-300 text-gray-800";
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  return Math.max(0, Math.ceil((b - a) / (24 * 60 * 60 * 1000)));
}

export default function BookingCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentDate, setCurrentDate] = useState(() => {
    const t = getTodaySLParts();
    return new Date(t.year, t.month, 1);
  });
  const [loading, setLoading] = useState(true);
  const [showHolidays, setShowHolidays] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BookingStatus[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [agendaOpen, setAgendaOpen] = useState(false);
  const router = useRouter();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month + 1, 0);
      const data = await getBookingsByDateRange(
        toDateStrLocal(start),
        toDateStrLocal(end)
      );
      setBookings(data);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (agendaOpen) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).closest("button")?.getAttribute("role") === "combobox"
      )
        return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentDate(new Date(year, month - 1, 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentDate(new Date(year, month + 1, 1));
      } else if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        const { year: y, month: m } = getTodaySLParts();
        setCurrentDate(new Date(y, m, 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [agendaOpen, year, month]);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  const filteredByStatus = (list: Booking[]): Booking[] => {
    if (statusFilter.length === 0) return list;
    return list.filter((b) => !statusFilter.includes(b.status));
  };

  const getBookingsForDate = useCallback(
    (date: Date): Booking[] => {
      const dateStr = toDateStrLocal(date);
      return filteredByStatus(bookings).filter((b) => {
        const checkIn = new Date(b.checkIn);
        const checkOut = new Date(b.checkOut);
        const current = new Date(dateStr);
        return current >= checkIn && current <= checkOut;
      });
    },
    [bookings, statusFilter]
  );

  const isCheckInDate = (date: Date, b: Booking): boolean =>
    b.checkIn === toDateStrLocal(date);
  const isCheckOutDate = (date: Date, b: Booking): boolean =>
    b.checkOut === toDateStrLocal(date);

  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const { year: y, month: m } = getTodaySLParts();
    setCurrentDate(new Date(y, m, 1));
  };

  const todaySL = getTodaySLParts();
  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    return (
      date.getDate() === todaySL.day &&
      date.getMonth() === todaySL.month &&
      date.getFullYear() === todaySL.year
    );
  };

  const openAgenda = (date: Date) => {
    setSelectedDate(date);
    setAgendaOpen(true);
  };

  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < adjustedStartingDay; i++) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day++)
    calendarDays.push(new Date(year, month, day));
  const totalCells = 42;
  while (calendarDays.length < totalCells) calendarDays.push(null);

  // Occupancy this month
  const filtered = filteredByStatus(bookings);
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const checkInsThisMonth = filtered.filter((b) => {
    const d = new Date(b.checkIn);
    return d >= monthStart && d <= monthEnd;
  }).length;
  const checkOutsThisMonth = filtered.filter((b) => {
    const d = new Date(b.checkOut);
    return d >= monthStart && d <= monthEnd;
  }).length;
  const activeInMonth = filtered.filter((b) => {
    const in_ = new Date(b.checkIn);
    const out = new Date(b.checkOut);
    return in_ <= monthEnd && out >= monthStart;
  }).length;

  const years = [year - 2, year - 1, year, year + 1, year + 2];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Calendar</h1>
          <p className="text-muted-foreground">
            View bookings and check availability
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => loadBookings()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/bookings/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Occupancy summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-6 text-sm">
            <span>
              <strong>Check-ins this month:</strong> {checkInsThisMonth}
            </span>
            <span>
              <strong>Check-outs this month:</strong> {checkOutsThisMonth}
            </span>
            <span>
              <strong>Active bookings in view:</strong> {activeInMonth}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {MONTH_NAMES[month]} {year}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={String(month)}
                onValueChange={(v) =>
                  setCurrentDate(new Date(year, parseInt(v, 10), 1))
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((name, i) => (
                    <SelectItem key={name} value={String(i)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={String(year)}
                onValueChange={(v) =>
                  setCurrentDate(new Date(parseInt(v, 10), month, 1))
                }
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-6 border-t pt-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-holidays"
                checked={showHolidays}
                onCheckedChange={(c) => setShowHolidays(c === true)}
              />
              <label htmlFor="show-holidays" className="text-sm cursor-pointer">
                Show Sri Lankan holidays
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium">Show status:</span>
              {ALL_STATUSES.map((s) => {
                const shown = !statusFilter.includes(s);
                return (
                  <div key={s} className="flex items-center gap-1.5">
                    <Checkbox
                      id={`status-${s}`}
                      checked={shown}
                      onCheckedChange={(c) => {
                        if (c === true)
                          setStatusFilter((prev) => prev.filter((x) => x !== s));
                        else
                          setStatusFilter((prev) =>
                            prev.includes(s) ? prev : [...prev, s]
                          );
                      }}
                    />
                    <label
                      htmlFor={`status-${s}`}
                      className="text-sm cursor-pointer capitalize"
                    >
                      {s.replace("_", " ")}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading calendar...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-1">
                {DAY_NAMES.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-semibold text-muted-foreground p-2"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={index} className="aspect-square" />;
                  }
                  const dayBookings = getBookingsForDate(date);
                  const holiday = showHolidays ? getHolidayForDate(date) : undefined;
                  const isCurrentDay = isToday(date);
                  const isPastMonth = date.getMonth() !== month;
                  const dayOfWeek = date.getDay();
                  const isSaturday = dayOfWeek === 6;
                  const isSunday = dayOfWeek === 0;
                  const inMonth = !isPastMonth;

                  return (
                    <div
                      key={index}
                      role="button"
                      tabIndex={0}
                      onClick={() => inMonth && openAgenda(date)}
                      onKeyDown={(e) =>
                        inMonth && (e.key === "Enter" || e.key === " ") && openAgenda(date)
                      }
                      aria-label={`${date.getDate()} ${MONTH_NAMES[month]} ${year}, ${dayBookings.length} bookings`}
                      className={`
                        aspect-square border rounded-lg p-1 min-h-[100px] cursor-pointer
                        transition-colors hover:bg-accent/50
                        ${isPastMonth ? "bg-muted/30 opacity-50 cursor-default" : ""}
                        ${inMonth && !holiday && isSaturday ? "bg-blue-50 border-blue-200" : ""}
                        ${inMonth && !holiday && isSunday ? "bg-indigo-50 border-indigo-200" : ""}
                        ${inMonth && !holiday && !isSaturday && !isSunday ? "bg-card" : ""}
                        ${isCurrentDay ? "ring-2 ring-primary" : ""}
                        ${dayBookings.length > 0 ? "border-primary/50" : ""}
                        ${holiday ? "bg-amber-50 border-amber-200" : ""}
                      `}
                    >
                      <div className="flex flex-col h-full">
                        <div
                          className={`
                            text-sm font-medium mb-1
                            ${isCurrentDay ? "text-primary font-bold" : ""}
                            ${isPastMonth ? "text-muted-foreground" : ""}
                            ${holiday ? "text-amber-700 font-semibold" : ""}
                            ${inMonth && !holiday && isSaturday ? "text-blue-700 font-semibold" : ""}
                            ${inMonth && !holiday && isSunday ? "text-indigo-700 font-semibold" : ""}
                          `}
                        >
                          {date.getDate()}
                        </div>
                        {holiday && (
                          <div className="mb-1">
                            <div
                              className="text-[10px] px-1 py-0.5 bg-amber-200 text-amber-900 rounded font-medium truncate"
                              title={holiday.name}
                            >
                              🎉{" "}
                              {holiday.name.length > 15
                                ? holiday.name.slice(0, 15) + "..."
                                : holiday.name}
                            </div>
                          </div>
                        )}
                        <div className="flex-1 overflow-y-auto space-y-0.5">
                          {dayBookings.slice(0, 3).map((booking) => {
                            const isCheckIn = isCheckInDate(date, booking);
                            const isCheckOut = isCheckOutDate(date, booking);
                            const nights = nightsBetween(
                              booking.checkIn,
                              booking.checkOut
                            );
                            const tooltip = [
                              `${booking.bookingNumber}`,
                              booking.guest.name,
                              `${booking.checkIn} – ${booking.checkOut}`,
                              `${nights} night(s)`,
                              booking.roomType
                                ? `Room: ${booking.roomType}`
                                : null,
                              booking.guest.phone ? `Phone: ${booking.guest.phone}` : null,
                              `Status: ${booking.status.replace("_", " ")}`,
                            ]
                              .filter(Boolean)
                              .join("\n");

                            return (
                              <Link
                                key={booking.id}
                                href={`/bookings/${booking.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className={`
                                  block text-xs p-1 rounded border cursor-pointer hover:opacity-90
                                  ${getStatusColor(booking.status)}
                                  ${isCheckIn ? "border-l-4 border-l-blue-600" : ""}
                                  ${isCheckOut ? "border-r-4 border-r-blue-600" : ""}
                                `}
                                title={tooltip}
                              >
                                <div className="flex items-start justify-between gap-0.5">
                                  <span className="flex-1 min-w-0 truncate font-medium">
                                    {isCheckIn && "🔑 "}
                                    {isCheckOut && "🚪 "}
                                    {booking.guest.name}
                                  </span>
                                  {booking.invoiceId && (
                                    <button
                                      type="button"
                                      className="shrink-0 text-muted-foreground hover:text-foreground p-0.5 -m-0.5 rounded"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        router.push(`/invoices/${booking.invoiceId}`);
                                      }}
                                      title="View invoice"
                                    >
                                      <FileText className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                                <div className="truncate text-[10px] opacity-75">
                                  {booking.bookingNumber}
                                  {booking.roomType ? ` · ${booking.roomType}` : ""}
                                </div>
                              </Link>
                            );
                          })}
                          {dayBookings.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center p-1">
                              +{dayBookings.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Day agenda dialog */}
      <Dialog open={agendaOpen} onOpenChange={setAgendaOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDate
                ? formatDateSL(selectedDate, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Day agenda"}
            </DialogTitle>
          </DialogHeader>
          {selectedDate && (
            <div className="space-y-4">
              <Link
                href={`/bookings/new?checkIn=${toDateStrLocal(selectedDate)}`}
                onClick={() => setAgendaOpen(false)}
              >
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  New booking (check-in {toDateStrLocal(selectedDate)})
                </Button>
              </Link>
              {getBookingsForDate(selectedDate).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No bookings this day.
                </p>
              ) : (
                <div className="space-y-2">
                  {getBookingsForDate(selectedDate).map((b) => {
                    const isCheckIn = isCheckInDate(selectedDate, b);
                    const isCheckOut = isCheckOutDate(selectedDate, b);
                    return (
                      <div
                        key={b.id}
                        className={`
                          flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border
                          ${getStatusColor(b.status)}
                        `}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {isCheckIn && "🔑 "}
                            {isCheckOut && "🚪 "}
                            {b.guest.name}
                          </div>
                          <div className="text-xs opacity-80">
                            {b.bookingNumber}
                            {b.roomType ? ` · ${b.roomType}` : ""} ·{" "}
                            {b.checkIn} – {b.checkOut}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Link href={`/bookings/${b.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/bookings/${b.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          {b.invoiceId && (
                            <Link href={`/invoices/${b.invoiceId}`}>
                              <Button variant="outline" size="sm">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-2">Booking Status</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {ALL_STATUSES.map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded ${
                        s === "booked"
                          ? "bg-purple-100 border border-purple-300"
                          : s === "confirmed"
                          ? "bg-blue-100 border border-blue-300"
                          : s === "checked_in"
                          ? "bg-green-100 border border-green-300"
                          : s === "checked_out"
                          ? "bg-gray-100 border border-gray-300"
                          : "bg-red-100 border border-red-300"
                      }`}
                    />
                    <span className="text-sm capitalize">
                      {s.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2">Holidays &amp; Indicators</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-50 border border-amber-200" />
                  <span className="text-sm">Sri Lankan Holiday</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-50 border border-blue-200" />
                  <span className="text-sm">Saturday</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-indigo-50 border border-indigo-200" />
                  <span className="text-sm">Sunday</span>
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground pt-2">
                  <span className="text-blue-600 font-bold">|</span>
                  <span>Check-in</span>
                  <span className="text-blue-600 font-bold">|</span>
                  <span>Check-out</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Click a day to open agenda. Use ← → to change month, T for Today.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
