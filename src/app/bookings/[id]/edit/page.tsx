"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Calendar, Users, Plus, Trash2, Copy, FileText } from "lucide-react";
import Link from "next/link";
import { Booking, BookingStatus } from "@/types/booking";
import { getBookingById } from "@/lib/bookings";
import { useRouter } from "next/navigation";
import { InvoiceItem, Currency } from "@/types/invoice";
import { getSavedItems } from "@/lib/invoice-items";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomType, setRoomType] = useState("");
  const [adults, setAdults] = useState<number | undefined>(undefined);
  const [children, setChildren] = useState<number | undefined>(undefined);
  const [babies, setBabies] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<BookingStatus>("confirmed");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [savedItems, setSavedItems] = useState<InvoiceItem[]>([]);
  // Early check-in and late checkout
  const [earlyCheckIn, setEarlyCheckIn] = useState(false);
  const [earlyCheckInTime, setEarlyCheckInTime] = useState("");
  const [earlyCheckInNotes, setEarlyCheckInNotes] = useState("");
  const [lateCheckOut, setLateCheckOut] = useState(false);
  const [lateCheckOutTime, setLateCheckOutTime] = useState("");
  const [lateCheckOutNotes, setLateCheckOutNotes] = useState("");

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const data = await getBookingById(id);
        if (data) {
          setBooking(data);
          setCheckIn(data.checkIn);
          setCheckOut(data.checkOut);
          setRoomType(data.roomType || "");
          setAdults(data.adults);
          setChildren(data.children);
          setBabies(data.babies);
          setStatus(data.status);
          setNotes(data.notes || "");
          // Ensure items have currency set (default to USD if not set)
          setItems((data.items || []).map(item => ({
            ...item,
            currency: item.currency || "USD",
          })));
          // Early check-in and late checkout
          setEarlyCheckIn(data.earlyCheckIn || false);
          setEarlyCheckInTime(data.earlyCheckInTime || "");
          setEarlyCheckInNotes(data.earlyCheckInNotes || "");
          setLateCheckOut(data.lateCheckOut || false);
          setLateCheckOutTime(data.lateCheckOutTime || "");
          setLateCheckOutNotes(data.lateCheckOutNotes || "");
        }
      } catch (error) {
        console.error("Error loading booking:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const loadSavedItems = async () => {
      try {
        const saved = await getSavedItems();
        setSavedItems(saved);
      } catch (error) {
        console.error("Error loading saved items:", error);
      }
    };
    
    loadBooking();
    loadSavedItems();
  }, [id]);

  // Handle invoice items
  const handleItemChange = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        quantityType: "quantity" as const,
        unitPrice: 0,
        total: 0,
        currency: "USD" as Currency,
      },
    ]);
  };

  const addItemFromSaved = (savedItem: InvoiceItem) => {
    setItems((prev) => [
      ...prev,
      {
        ...savedItem,
        id: Date.now().toString(),
      },
    ]);
  };

  const duplicateItem = (item: InvoiceItem) => {
    setItems((prev) => [
      ...prev,
      {
        ...item,
        id: Date.now().toString(),
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!booking) return;

    if (!checkIn || !checkOut) {
      alert("Check-in and Check-out dates are required");
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      alert("Check-out date must be after check-in date");
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Check if status is changing to checked_out
      const isChangingToCheckedOut = status === "checked_out" && booking.status !== "checked_out";
      
      // Update booking via API
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkIn,
          checkOut,
          roomType: roomType || undefined,
          adults: adults || undefined,
          children: children || undefined,
          babies: babies || undefined,
          status,
          items: items.length > 0 ? items : undefined,
          notes: notes || undefined,
          earlyCheckIn,
          earlyCheckInTime: earlyCheckIn && earlyCheckInTime ? earlyCheckInTime : undefined,
          earlyCheckInNotes: earlyCheckIn && earlyCheckInNotes ? earlyCheckInNotes : undefined,
          lateCheckOut,
          lateCheckOutTime: lateCheckOut && lateCheckOutTime ? lateCheckOutTime : undefined,
          lateCheckOutNotes: lateCheckOut && lateCheckOutNotes ? lateCheckOutNotes : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update booking");
      }

      const result = await response.json();
      
      // If invoice was created, show a message
      if (isChangingToCheckedOut && result.booking?.invoiceId) {
        alert(`Booking checked out successfully! Invoice ${result.booking.invoiceId ? 'has been created' : 'creation attempted'}.`);
      }
      
      router.push(`/bookings/${id}`);
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Error updating booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/bookings/${id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Booking</h1>
          <p className="text-muted-foreground">
            {booking.bookingNumber}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">Check-in Date *</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut">Check-out Date *</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomType">Room Type</Label>
                  <Input
                    id="roomType"
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    placeholder="e.g., Deluxe Room, Suite"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value: BookingStatus) => setStatus(value)}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="checked_in">Checked In</SelectItem>
                      <SelectItem value="checked_out">Checked Out</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adults">Adults</Label>
                  <Input
                    id="adults"
                    type="number"
                    min="0"
                    value={adults || ""}
                    onChange={(e) => setAdults(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="children">Children</Label>
                  <Input
                    id="children"
                    type="number"
                    min="0"
                    value={children || ""}
                    onChange={(e) => setChildren(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="babies">Babies</Label>
                  <Input
                    id="babies"
                    type="number"
                    min="0"
                    value={babies || ""}
                    onChange={(e) => setBabies(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items - Only editable when checked_in */}
          {(status === "checked_in" || booking.status === "checked_in") && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Invoice Items
                  </CardTitle>
                  <div className="flex gap-2">
                    {savedItems.length > 0 && (
                      <Select onValueChange={(value) => {
                        const savedItem = savedItems.find(item => item.id === value);
                        if (savedItem) {
                          addItemFromSaved(savedItem);
                        }
                      }}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Add from saved" />
                        </SelectTrigger>
                        <SelectContent>
                          {savedItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <Button type="button" variant="outline" onClick={addItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No items added. Click "Add Item" to add invoice items while guests are staying.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Input
                              value={item.description}
                              onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                              placeholder="Item description"
                            />
                          </TableCell>
                          <TableCell className="w-[100px]">
                            <Input
                              type="number"
                              min="0"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, "quantity", parseFloat(e.target.value) || 0)}
                            />
                          </TableCell>
                          <TableCell className="w-[120px]">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                            />
                          </TableCell>
                          <TableCell className="w-[100px]">
                            <Select
                              value={item.currency || "USD"}
                              onValueChange={(value: Currency) => {
                                handleItemChange(item.id, "currency", value);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="USD" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="LKR">LKR</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="w-[120px]">
                            <Input
                              type="number"
                              value={item.total}
                              readOnly
                              className="bg-muted"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => duplicateItem(item)}
                                title="Duplicate"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                title="Remove"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {items.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-end">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Subtotal</p>
                        <p className="text-lg font-bold">
                          {items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Early Check-in and Late Check-out */}
          <Card>
            <CardHeader>
              <CardTitle>Check-in/Check-out Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Early Check-in */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="earlyCheckIn"
                    checked={earlyCheckIn}
                    onCheckedChange={(checked) => setEarlyCheckIn(checked === true)}
                  />
                  <Label htmlFor="earlyCheckIn" className="font-semibold cursor-pointer">
                    Early Check-in
                  </Label>
                </div>
                {earlyCheckIn && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="earlyCheckInTime">Check-in Time</Label>
                      <Input
                        id="earlyCheckInTime"
                        type="time"
                        value={earlyCheckInTime}
                        onChange={(e) => setEarlyCheckInTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="earlyCheckInNotes">Notes</Label>
                      <Textarea
                        id="earlyCheckInNotes"
                        value={earlyCheckInNotes}
                        onChange={(e) => setEarlyCheckInNotes(e.target.value)}
                        placeholder="Notes about early check-in..."
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Late Check-out */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="lateCheckOut"
                    checked={lateCheckOut}
                    onCheckedChange={(checked) => setLateCheckOut(checked === true)}
                  />
                  <Label htmlFor="lateCheckOut" className="font-semibold cursor-pointer">
                    Late Check-out
                  </Label>
                </div>
                {lateCheckOut && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="lateCheckOutTime">Check-out Time</Label>
                      <Input
                        id="lateCheckOutTime"
                        type="time"
                        value={lateCheckOutTime}
                        onChange={(e) => setLateCheckOutTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="lateCheckOutNotes">Notes</Label>
                      <Textarea
                        id="lateCheckOutNotes"
                        value={lateCheckOutNotes}
                        onChange={(e) => setLateCheckOutNotes(e.target.value)}
                        placeholder="Notes about late check-out..."
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes or special requests..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Guest Information (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle>Guest Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{booking.guest.name}</p>
                {booking.guest.email && (
                  <p className="text-sm text-muted-foreground">{booking.guest.email}</p>
                )}
                {booking.guest.phone && (
                  <p className="text-sm text-muted-foreground">{booking.guest.phone}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Guest information cannot be edited here. Please edit the guest profile in Settings.
              </p>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href={`/bookings/${id}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
