"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Pencil, LogIn, LogOut, User, Calendar, Users, FileText } from "lucide-react";
import Link from "next/link";
import { Booking, BookingStatus } from "@/types/booking";
import { getBookingById } from "@/lib/bookings";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/currency";
import { formatDateSL, formatDateTimeSL } from "@/lib/date-sl";

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const data = await getBookingById(id);
        setBooking(data || null);
      } catch (error) {
        console.error("Error loading booking:", error);
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };
    loadBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading booking...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Booking Not Found</h1>
          <Link href="/bookings">
            <Button>Back to Bookings</Button>
          </Link>
        </div>
      </div>
    );
  }

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

  const totalGuests = (booking.adults || 0) + (booking.children || 0) + (booking.babies || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/bookings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Booking Details</h1>
            <p className="text-muted-foreground">
              {booking.bookingNumber}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {booking.status !== "cancelled" && (
            <Link href={`/bookings/${booking.id}/edit`}>
              <Button variant="outline">
                <Pencil className="mr-2 h-4 w-4" />
                {booking.status === "checked_in" ? "Update Items" : "Edit"}
              </Button>
            </Link>
          )}
          {booking.invoiceId ? (
            <Link href={`/invoices/${booking.invoiceId}`}>
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                View Invoice
              </Button>
            </Link>
          ) : booking.status === "checked_out" && (
            <div className="text-sm text-muted-foreground">
              No invoice created yet
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Booking Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Booking Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Booking Number</p>
                <p className="font-medium">{booking.bookingNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(booking.status)}</div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <LogIn className="h-3 w-3" />
                  Check-in
                </p>
                <p className="font-medium">
                  {formatDateSL(booking.checkIn)}
                </p>
                {booking.earlyCheckIn && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⏰ Early check-in
                    {booking.earlyCheckInTime && ` at ${booking.earlyCheckInTime}`}
                  </p>
                )}
                {booking.checkedInAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Checked in: {formatDateTimeSL(booking.checkedInAt)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <LogOut className="h-3 w-3" />
                  Check-out
                </p>
                <p className="font-medium">
                  {formatDateSL(booking.checkOut)}
                </p>
                {booking.lateCheckOut && (
                  <p className="text-xs text-orange-600 mt-1">
                    ⏰ Late check-out
                    {booking.lateCheckOutTime && ` at ${booking.lateCheckOutTime}`}
                  </p>
                )}
                {booking.checkedOutAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Checked out: {formatDateTimeSL(booking.checkedOutAt)}
                  </p>
                )}
              </div>
              {booking.roomType && (
                <div>
                  <p className="text-sm text-muted-foreground">Room Type</p>
                  <p className="font-medium">{booking.roomType}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {formatDateSL(booking.createdAt)}
                </p>
              </div>
            </div>
            {/* Status Timestamps */}
            {(booking.bookedAt || booking.confirmedAt || booking.checkedInAt || booking.checkedOutAt || booking.cancelledAt) && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-semibold mb-2">Status History</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {booking.bookedAt && (
                    <p>📅 Booked: {formatDateTimeSL(booking.bookedAt)}</p>
                  )}
                  {booking.confirmedAt && (
                    <p>✅ Confirmed: {formatDateTimeSL(booking.confirmedAt)}</p>
                  )}
                  {booking.checkedInAt && (
                    <p>🔑 Checked In: {formatDateTimeSL(booking.checkedInAt)}</p>
                  )}
                  {booking.checkedOutAt && (
                    <p>🚪 Checked Out: {formatDateTimeSL(booking.checkedOutAt)}</p>
                  )}
                  {booking.cancelledAt && (
                    <p>❌ Cancelled: {formatDateTimeSL(booking.cancelledAt)}</p>
                  )}
                </div>
              </div>
            )}
            {/* Early Check-in Notes */}
            {booking.earlyCheckIn && booking.earlyCheckInNotes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-semibold mb-1">Early Check-in Notes</p>
                <p className="text-sm text-muted-foreground">{booking.earlyCheckInNotes}</p>
              </div>
            )}
            {/* Late Check-out Notes */}
            {booking.lateCheckOut && booking.lateCheckOutNotes && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-semibold mb-1">Late Check-out Notes</p>
                <p className="text-sm text-muted-foreground">{booking.lateCheckOutNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guest Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Guest Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Primary Guest</p>
              <p className="font-medium">{booking.guest.name}</p>
              {booking.guest.email && (
                <p className="text-sm text-muted-foreground">{booking.guest.email}</p>
              )}
              {booking.guest.phone && (
                <p className="text-sm text-muted-foreground">{booking.guest.phone}</p>
              )}
            </div>
            {booking.guest.address && (
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="text-sm">
                  {booking.guest.address}
                  {booking.guest.city && `, ${booking.guest.city}`}
                  {booking.guest.country && `, ${booking.guest.country}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guest Count */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Guest Count
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {booking.adults && booking.adults > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Adults</span>
                  <span className="font-medium">{booking.adults}</span>
                </div>
              )}
              {booking.children && booking.children > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Children</span>
                  <span className="font-medium">{booking.children}</span>
                </div>
              )}
              {booking.babies && booking.babies > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Babies</span>
                  <span className="font-medium">{booking.babies}</span>
                </div>
              )}
              {totalGuests === 0 && (
                <p className="text-sm text-muted-foreground">No guest count specified</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Guests */}
        {booking.guests && booking.guests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Guests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {booking.guests.map((guest, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium">{guest.name}</p>
                    {guest.email && (
                      <p className="text-muted-foreground">{guest.email}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice Items */}
        {booking.items && booking.items.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {booking.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {item.currency ? formatCurrency(item.unitPrice, item.currency) : item.unitPrice}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.currency ? formatCurrency(item.total, item.currency) : item.total}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-lg font-bold">
                      {booking.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {booking.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{booking.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
