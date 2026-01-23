"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Booking, BookingStatus } from "@/types/booking";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from "lucide-react";
import Link from "next/link";
import { getBookings } from "@/lib/bookings";
import { getHolidayForDate, type Holiday } from "@/lib/sri-lankan-holidays";
import { getTodaySLParts } from "@/lib/date-sl";

export default function BookingCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentDate, setCurrentDate] = useState(() => {
    const t = getTodaySLParts();
    return new Date(t.year, t.month, 1);
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await getBookings();
      setBookings(data);
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get first day of month and number of days
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Adjust to start week on Monday (0 = Monday, 6 = Sunday)
  const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date): Booking[] => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter((booking) => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const current = new Date(dateStr);
      
      // Check if date is between check-in and check-out (inclusive)
      return current >= checkIn && current <= checkOut;
    });
  };

  // Check if date is a check-in date
  const isCheckInDate = (date: Date, booking: Booking): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return booking.checkIn === dateStr;
  };

  // Check if date is a check-out date
  const isCheckOutDate = (date: Date, booking: Booking): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return booking.checkOut === dateStr;
  };

  // Get status color
  const getStatusColor = (status: BookingStatus): string => {
    const colors: Record<BookingStatus, string> = {
      booked: "bg-purple-100 border-purple-300 text-purple-800",
      confirmed: "bg-blue-100 border-blue-300 text-blue-800",
      checked_in: "bg-green-100 border-green-300 text-green-800",
      checked_out: "bg-gray-100 border-gray-300 text-gray-800",
      cancelled: "bg-red-100 border-red-300 text-red-800",
    };
    return colors[status] || "bg-gray-100 border-gray-300 text-gray-800";
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const { year: y, month: m } = getTodaySLParts();
    setCurrentDate(new Date(y, m, 1));
  };

  // Generate calendar days
  const calendarDays: (Date | null)[] = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < adjustedStartingDay; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  // Fill remaining cells to complete the grid (6 rows × 7 days = 42 cells)
  const totalCells = 42;
  while (calendarDays.length < totalCells) {
    calendarDays.push(null);
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const todaySL = getTodaySLParts();
  const isToday = (date: Date | null): boolean => {
    if (!date) return false;
    return (
      date.getDate() === todaySL.day &&
      date.getMonth() === todaySL.month &&
      date.getFullYear() === todaySL.year
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Calendar</h1>
          <p className="text-muted-foreground">
            View bookings and check availability
          </p>
        </div>
        <Link href="/bookings/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </Link>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {monthNames[month]} {year}
            </CardTitle>
            <div className="flex gap-2">
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
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading calendar...</div>
          ) : (
            <div className="space-y-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-sm font-semibold text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={index} className="aspect-square" />;
                  }

                  const dayBookings = getBookingsForDate(date);
                  const holiday = getHolidayForDate(date);
                  const isCurrentDay = isToday(date);
                  const isPastMonth = date.getMonth() !== month;
                  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
                  const isSaturday = dayOfWeek === 6;
                  const isSunday = dayOfWeek === 0;

                  return (
                    <div
                      key={index}
                      className={`
                        aspect-square border rounded-lg p-1 min-h-[100px]
                        ${isPastMonth ? "bg-muted/30 opacity-50" : ""}
                        ${!isPastMonth && !holiday && isSaturday ? "bg-blue-50 border-blue-200" : ""}
                        ${!isPastMonth && !holiday && isSunday ? "bg-indigo-50 border-indigo-200" : ""}
                        ${!isPastMonth && !holiday && !isSaturday && !isSunday ? "bg-card" : ""}
                        ${isCurrentDay ? "ring-2 ring-primary" : ""}
                        ${dayBookings.length > 0 ? "border-primary/50" : ""}
                        ${holiday ? "bg-amber-50 border-amber-200" : ""}
                      `}
                    >
                      <div className="flex flex-col h-full">
                        {/* Date Number */}
                        <div className={`
                          text-sm font-medium mb-1
                          ${isCurrentDay ? "text-primary font-bold" : ""}
                          ${isPastMonth ? "text-muted-foreground" : ""}
                          ${holiday ? "text-amber-700 font-semibold" : ""}
                          ${!isPastMonth && !holiday && isSaturday ? "text-blue-700 font-semibold" : ""}
                          ${!isPastMonth && !holiday && isSunday ? "text-indigo-700 font-semibold" : ""}
                        `}>
                          {date.getDate()}
                        </div>
                        
                        {/* Holiday Indicator */}
                        {holiday && (
                          <div className="mb-1">
                            <div className="text-[10px] px-1 py-0.5 bg-amber-200 text-amber-900 rounded font-medium truncate" title={holiday.name}>
                              🎉 {holiday.name.length > 15 ? holiday.name.substring(0, 15) + "..." : holiday.name}
                            </div>
                          </div>
                        )}

                        {/* Bookings */}
                        <div className="flex-1 overflow-y-auto space-y-0.5">
                          {dayBookings.slice(0, 3).map((booking) => {
                            const isCheckIn = isCheckInDate(date, booking);
                            const isCheckOut = isCheckOutDate(date, booking);
                            
                            return (
                              <Link
                                key={booking.id}
                                href={`/bookings/${booking.id}`}
                                className="block"
                              >
                                <div
                                  className={`
                                    text-xs p-1 rounded border cursor-pointer hover:opacity-80
                                    ${getStatusColor(booking.status)}
                                    ${isCheckIn ? "border-l-4 border-l-blue-600" : ""}
                                    ${isCheckOut ? "border-r-4 border-r-blue-600" : ""}
                                  `}
                                  title={`${booking.bookingNumber} - ${booking.guest.name} (${booking.checkIn} to ${booking.checkOut})`}
                                >
                                  <div className="truncate font-medium">
                                    {isCheckIn && "🔑 "}
                                    {isCheckOut && "🚪 "}
                                    {booking.guest.name}
                                  </div>
                                  <div className="truncate text-[10px] opacity-75">
                                    {booking.bookingNumber}
                                  </div>
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
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-purple-100 border border-purple-300"></div>
                  <span className="text-sm">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
                  <span className="text-sm">Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
                  <span className="text-sm">Checked In</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
                  <span className="text-sm">Checked Out</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
                  <span className="text-sm">Cancelled</span>
                </div>
              </div>
            </div>
             <div>
               <p className="text-sm font-semibold mb-2">Holidays & Indicators</p>
               <div className="space-y-2">
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded bg-amber-50 border border-amber-200"></div>
                   <span className="text-sm">Sri Lankan Holiday</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded bg-blue-50 border border-blue-200"></div>
                   <span className="text-sm">Saturday</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded bg-indigo-50 border border-indigo-200"></div>
                   <span className="text-sm">Sunday</span>
                 </div>
                 <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                   <div className="flex items-center gap-2">
                     <span className="text-blue-600 font-bold">|</span>
                     <span>Check-in date</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-blue-600 font-bold">|</span>
                     <span>Check-out date</span>
                   </div>
                 </div>
               </div>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
