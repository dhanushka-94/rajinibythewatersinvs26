"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Booking, BookingStatus } from "@/types/booking";
import { formatDateSL } from "@/lib/date-sl";
import Link from "next/link";
import { Eye, Plus, Filter, X, Pencil, Trash2, Calendar, User, LogIn, LogOut, CalendarDays } from "lucide-react";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/bookings");
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookingId: string, bookingNumber: string) => {
    if (!confirm(`Are you sure you want to delete booking ${bookingNumber}? This action cannot be undone.`)) {
      return;
    }

    setDeletingBookingId(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        await loadBookings();
      } else {
        alert(data.error || "Failed to delete booking");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Error deleting booking. Please try again.");
    } finally {
      setDeletingBookingId(null);
    }
  };


  const filteredBookings = bookings.filter((booking) => {
    // Search filter
    const matchesSearch = 
      booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.guest.email?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

    // Date filters
    const matchesStartDate = !startDate || new Date(booking.checkIn) >= new Date(startDate);
    const matchesEndDate = !endDate || new Date(booking.checkOut) <= new Date(endDate);

    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
  });

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters = statusFilter !== "all" || startDate || endDate;

  const getStatusBadge = (status: BookingStatus) => {
    const statusStyles: Record<BookingStatus, string> = {
      booked: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
      checked_in: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
      checked_out: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
    };

    return (
      <Badge 
        variant="outline" 
        className={statusStyles[status] || "bg-gray-100 text-gray-800 border-gray-200"}
      >
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </Badge>
    );
  };

  // Calculate statistics
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const checkedInBookings = bookings.filter((b) => b.status === "checked_in").length;
  const checkedOutBookings = bookings.filter((b) => b.status === "checked_out").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            Manage guest bookings and reservations
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/bookings/calendar">
            <Button variant="outline">
              <CalendarDays className="mr-2 h-4 w-4" />
              Calendar View
            </Button>
          </Link>
          <Link href="/bookings/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{confirmedBookings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Checked In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{checkedInBookings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Checked Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{checkedOutBookings}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filters</CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                <X className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Booking #, Guest name, Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="checked_out">Checked Out</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Check-in From</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Check-out To</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Bookings ({filteredBookings.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading bookings...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking #</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No bookings found matching the selected filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => {
                    const totalGuests = (booking.adults || 0) + (booking.children || 0) + (booking.babies || 0);
                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {booking.bookingNumber}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{booking.guest.name}</span>
                            {booking.guest.email && (
                              <span className="text-xs text-muted-foreground">{booking.guest.email}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <LogIn className="h-3 w-3 text-muted-foreground" />
                            {formatDateSL(booking.checkIn)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <LogOut className="h-3 w-3 text-muted-foreground" />
                            {formatDateSL(booking.checkOut)}
                          </div>
                        </TableCell>
                        <TableCell>{booking.roomType || "-"}</TableCell>
                        <TableCell>
                          {totalGuests > 0 ? (
                            <div className="flex flex-col text-sm">
                              {booking.adults && booking.adults > 0 && (
                                <span>{booking.adults} Adult{booking.adults !== 1 ? 's' : ''}</span>
                              )}
                              {booking.children && booking.children > 0 && (
                                <span>{booking.children} Child{booking.children !== 1 ? 'ren' : ''}</span>
                              )}
                              {booking.babies && booking.babies > 0 && (
                                <span>{booking.babies} Bab{booking.babies !== 1 ? 'ies' : 'y'}</span>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(booking.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/bookings/${booking.id}`}>
                              <Button variant="ghost" size="sm" title="View">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {booking.status !== "checked_out" && booking.status !== "cancelled" && (
                              <>
                                <Link href={`/bookings/${booking.id}/edit`}>
                                  <Button variant="ghost" size="sm" title="Edit">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </Link>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(booking.id, booking.bookingNumber)}
                                  disabled={deletingBookingId === booking.id}
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            )}
                            {booking.invoiceId && (
                              <Link href={`/invoices/${booking.invoiceId}`}>
                                <Button variant="ghost" size="sm" title="View Invoice">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
