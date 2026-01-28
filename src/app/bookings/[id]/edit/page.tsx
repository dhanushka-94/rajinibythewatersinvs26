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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Calendar, Users, Plus, Trash2, Copy, FileText, UserPlus } from "lucide-react";
import Link from "next/link";
import { Booking, BookingStatus } from "@/types/booking";
import { getBookingById } from "@/lib/bookings";
import { useRouter } from "next/navigation";
import { InvoiceItem, Currency } from "@/types/invoice";
import { Guest, Title } from "@/types/invoice";
import { getSavedItems } from "@/lib/invoice-items";
import { addGuest, getGuestById, getGuests } from "@/lib/guests";
import { CountrySelector } from "@/components/country-selector";
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
  // Guest state
  const [selectedGuestId, setSelectedGuestId] = useState<string>("");
  const [guest, setGuest] = useState<Guest>({
    title: undefined,
    name: "",
    email: "",
    phone: "",
    phone2: "",
    phone3: "",
    address: "",
    city: "",
    country: "",
    idNumber: "",
    birthday: "",
  });
  const [availableGuests, setAvailableGuests] = useState<Guest[]>([]);
  const [newGuest, setNewGuest] = useState<Omit<Guest, "id">>({
    title: undefined,
    name: "",
    email: "",
    phone: "",
    phone2: "",
    phone3: "",
    address: "",
    city: "",
    country: "",
    idNumber: "",
    birthday: "",
  });
  const [isAddGuestDialogOpen, setIsAddGuestDialogOpen] = useState(false);
  const [additionalGuests, setAdditionalGuests] = useState<Guest[]>([]);
  const [selectedAdditionalGuestId, setSelectedAdditionalGuestId] = useState<string>("");
  const [isQuickAddGuestDialogOpen, setIsQuickAddGuestDialogOpen] = useState(false);
  const [quickAddGuest, setQuickAddGuest] = useState<Omit<Guest, "id">>({
    title: undefined,
    name: "",
    email: "",
    phone: "",
    phone2: "",
    phone3: "",
    address: "",
    city: "",
    country: "",
    idNumber: "",
    birthday: "",
  });

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
          setItems((data.items || []).map(item => ({
            ...item,
            currency: item.currency || "USD",
          })));
          setEarlyCheckIn(data.earlyCheckIn || false);
          setEarlyCheckInTime(data.earlyCheckInTime || "");
          setEarlyCheckInNotes(data.earlyCheckInNotes || "");
          setLateCheckOut(data.lateCheckOut || false);
          setLateCheckOutTime(data.lateCheckOutTime || "");
          setLateCheckOutNotes(data.lateCheckOutNotes || "");
          setGuest({
            title: data.guest?.title,
            name: data.guest?.name ?? "",
            email: data.guest?.email ?? "",
            phone: data.guest?.phone ?? "",
            phone2: data.guest?.phone2 ?? "",
            phone3: data.guest?.phone3 ?? "",
            address: data.guest?.address ?? "",
            city: data.guest?.city ?? "",
            country: data.guest?.country ?? "",
            idNumber: data.guest?.idNumber ?? "",
            birthday: data.guest?.birthday ?? "",
            id: data.guest?.id,
          });
          setSelectedGuestId(data.guestId ?? "");
          setAdditionalGuests(data.guests ?? []);
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
    const loadGuests = async () => {
      try {
        const list = await getGuests();
        setAvailableGuests(list);
      } catch (error) {
        console.error("Error loading guests:", error);
      }
    };
    loadBooking();
    loadSavedItems();
    loadGuests();
  }, [id]);

  useEffect(() => {
    if (!selectedGuestId) {
      return;
    }
    const loadSelectedGuest = async () => {
      try {
        const g = await getGuestById(selectedGuestId);
        if (g) setGuest(g);
      } catch (error) {
        console.error("Error loading guest:", error);
      }
    };
    loadSelectedGuest();
  }, [selectedGuestId]);

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

  const handleAddGuest = async () => {
    if (!newGuest.name?.trim()) {
      alert("Full Name is required");
      return;
    }
    const added = await addGuest(newGuest);
    setGuest(added);
    setSelectedGuestId(added.id!);
    setIsAddGuestDialogOpen(false);
    setNewGuest({ title: undefined, name: "", email: "", phone: "", phone2: "", phone3: "", address: "", city: "", country: "", idNumber: "", birthday: "" });
    const list = await getGuests();
    setAvailableGuests(list);
  };

  const handleAddAdditionalGuest = async () => {
    if (!selectedAdditionalGuestId || selectedAdditionalGuestId === "quick-add") return;
    try {
      const g = await getGuestById(selectedAdditionalGuestId);
      if (!g) {
        alert("Guest not found.");
        return;
      }
      const isPrimary = guest.id && g.id && guest.id === g.id;
      const already = additionalGuests.some((ag) => ag.id === g.id);
      if (isPrimary) {
        alert("This guest is already the primary guest.");
        return;
      }
      if (already) {
        alert("This guest is already added.");
        return;
      }
      setAdditionalGuests((prev) => [...prev, g]);
      setSelectedAdditionalGuestId("");
    } catch (e) {
      console.error(e);
      alert("Error adding guest.");
    }
  };

  const handleRemoveAdditionalGuest = (guestId: string) => {
    setAdditionalGuests((prev) => prev.filter((g) => g.id !== guestId));
  };

  const handleQuickAddAdditionalGuest = async () => {
    if (!quickAddGuest.name?.trim()) {
      alert("Full Name is required");
      return;
    }
    try {
      const added = await addGuest(quickAddGuest);
      const already = additionalGuests.some((ag) => ag.id === added.id);
      if (already) {
        alert("This guest is already added.");
        setIsQuickAddGuestDialogOpen(false);
        setQuickAddGuest({ title: undefined, name: "", email: "", phone: "", phone2: "", phone3: "", address: "", city: "", country: "", idNumber: "", birthday: "" });
        return;
      }
      setAdditionalGuests((prev) => [...prev, added]);
      setIsQuickAddGuestDialogOpen(false);
      setQuickAddGuest({ title: undefined, name: "", email: "", phone: "", phone2: "", phone3: "", address: "", city: "", country: "", idNumber: "", birthday: "" });
      const list = await getGuests();
      setAvailableGuests(list);
    } catch (e) {
      console.error(e);
      alert("Error adding guest.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!booking) return;

    if (!guest.name?.trim()) {
      alert("Guest Name is required");
      return;
    }

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
      
      const isChangingToCheckedOut = status === "checked_out" && booking.status !== "checked_out";
      
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestId: guest.id || null,
          guest,
          guests: additionalGuests.length > 0 ? additionalGuests : undefined,
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

          {/* Guest Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Guest Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-guest">Select Guest</Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedGuestId || undefined}
                      onValueChange={(v) => {
                        if (v === "new") {
                          setSelectedGuestId("");
                          setGuest({ title: undefined, name: "", email: "", phone: "", phone2: "", phone3: "", address: "", city: "", country: "", idNumber: "", birthday: "" });
                        } else {
                          setSelectedGuestId(v);
                        }
                      }}
                    >
                      <SelectTrigger id="edit-guest">
                        <SelectValue placeholder="Select or add guest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New Guest</SelectItem>
                        {availableGuests.map((g) => (
                          <SelectItem key={g.id} value={g.id!}>
                            {g.name} {g.email ? `(${g.email})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" onClick={() => setIsAddGuestDialogOpen(true)}>
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              {selectedGuestId && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Selected Guest: {guest.name}</p>
                  {guest.email && <p className="text-sm text-muted-foreground">{guest.email}</p>}
                </div>
              )}
              {!selectedGuestId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-guest-title">Title</Label>
                    <Select
                      value={guest.title ?? "none"}
                      onValueChange={(v) => setGuest({ ...guest, title: v === "none" ? undefined : (v as Title) })}
                    >
                      <SelectTrigger id="edit-guest-title">
                        <SelectValue placeholder="Select title (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="Mr">Mr</SelectItem>
                        <SelectItem value="Mrs">Mrs</SelectItem>
                        <SelectItem value="Miss">Miss</SelectItem>
                        <SelectItem value="Ms">Ms</SelectItem>
                        <SelectItem value="Dr">Dr</SelectItem>
                        <SelectItem value="Prof">Prof</SelectItem>
                        <SelectItem value="Rev">Rev</SelectItem>
                        <SelectItem value="Sir">Sir</SelectItem>
                        <SelectItem value="Madam">Madam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-guest-name">Full Name *</Label>
                    <Input
                      id="edit-guest-name"
                      value={guest.name || ""}
                      onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-guest-email">Email</Label>
                    <Input
                      id="edit-guest-email"
                      type="email"
                      value={guest.email || ""}
                      onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-guest-phone">Phone</Label>
                    <Input
                      id="edit-guest-phone"
                      value={guest.phone || ""}
                      onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-guest-address">Address</Label>
                    <Input
                      id="edit-guest-address"
                      value={guest.address || ""}
                      onChange={(e) => setGuest({ ...guest, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-guest-city">City</Label>
                    <Input
                      id="edit-guest-city"
                      value={guest.city || ""}
                      onChange={(e) => setGuest({ ...guest, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-guest-country">Country</Label>
                    <CountrySelector
                      value={guest.country || ""}
                      onValueChange={(v) => setGuest({ ...guest, country: v })}
                    />
                  </div>
                </div>
              )}
              {/* Additional Guests + Quick Add */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Label className="text-base font-semibold">Additional Guests</Label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => setIsQuickAddGuestDialogOpen(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Quick Add Guest
                    </Button>
                    <Select
                      value={selectedAdditionalGuestId === "quick-add" ? undefined : (selectedAdditionalGuestId || undefined)}
                      onValueChange={(v) => {
                        if (v === "quick-add") setIsQuickAddGuestDialogOpen(true);
                        else setSelectedAdditionalGuestId(v);
                      }}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Or select existing guest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quick-add">Quick Add Guest</SelectItem>
                        {availableGuests
                          .filter((g) => {
                            const isPrimary = g.id === selectedGuestId;
                            const isAlready = additionalGuests.some((ag) => ag.id === g.id);
                            return !isPrimary && !isAlready;
                          })
                          .map((g) => (
                            <SelectItem key={g.id} value={g.id!}>
                              {g.name} {g.email ? `(${g.email})` : ""}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddAdditionalGuest}
                      disabled={!selectedAdditionalGuestId || selectedAdditionalGuestId === "quick-add"}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
                {additionalGuests.length > 0 && (
                  <div className="space-y-2">
                    {additionalGuests.map((ag, idx) => (
                      <div key={ag.id ?? idx} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <p className="text-sm font-medium">{ag.name}</p>
                          {ag.email && <p className="text-xs text-muted-foreground">{ag.email}</p>}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAdditionalGuest(ag.id!)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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

      {/* Add New Guest Dialog */}
      <Dialog open={isAddGuestDialogOpen} onOpenChange={setIsAddGuestDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Guest</DialogTitle>
            <DialogDescription>
              Add a new guest to the system. Same fields as main guest form.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-new-guest-title">Title</Label>
                <Select
                  value={newGuest.title ?? "none"}
                  onValueChange={(v) => setNewGuest({ ...newGuest, title: v === "none" ? undefined : (v as Title) })}
                >
                  <SelectTrigger id="edit-new-guest-title">
                    <SelectValue placeholder="Select title (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Miss">Miss</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                    <SelectItem value="Prof">Prof</SelectItem>
                    <SelectItem value="Rev">Rev</SelectItem>
                    <SelectItem value="Sir">Sir</SelectItem>
                    <SelectItem value="Madam">Madam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-new-guest-name">Full Name *</Label>
                <Input
                  id="edit-new-guest-name"
                  value={newGuest.name || ""}
                  onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                  placeholder="Full name"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-new-guest-email">Email</Label>
                <Input
                  id="edit-new-guest-email"
                  type="email"
                  value={newGuest.email || ""}
                  onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                  placeholder="Email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-new-guest-phone">Phone</Label>
                <Input
                  id="edit-new-guest-phone"
                  value={newGuest.phone || ""}
                  onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                  placeholder="Phone"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-new-guest-phone2">Phone 2</Label>
                <Input id="edit-new-guest-phone2" value={newGuest.phone2 || ""} onChange={(e) => setNewGuest({ ...newGuest, phone2: e.target.value })} placeholder="Phone 2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-new-guest-phone3">Phone 3</Label>
                <Input id="edit-new-guest-phone3" value={newGuest.phone3 || ""} onChange={(e) => setNewGuest({ ...newGuest, phone3: e.target.value })} placeholder="Phone 3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-new-guest-idNumber">ID / Passport</Label>
                <Input id="edit-new-guest-idNumber" value={newGuest.idNumber || ""} onChange={(e) => setNewGuest({ ...newGuest, idNumber: e.target.value })} placeholder="ID or Passport" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-new-guest-birthday">Birthday</Label>
              <Input id="edit-new-guest-birthday" type="date" value={newGuest.birthday || ""} onChange={(e) => setNewGuest({ ...newGuest, birthday: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-new-guest-address">Address</Label>
              <Input id="edit-new-guest-address" value={newGuest.address || ""} onChange={(e) => setNewGuest({ ...newGuest, address: e.target.value })} placeholder="Address" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-new-guest-city">City</Label>
                <Input id="edit-new-guest-city" value={newGuest.city || ""} onChange={(e) => setNewGuest({ ...newGuest, city: e.target.value })} placeholder="City" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-new-guest-country">Country</Label>
                <CountrySelector value={newGuest.country || ""} onValueChange={(v) => setNewGuest({ ...newGuest, country: v })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddGuestDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleAddGuest}>Add Guest</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Add Additional Guest Dialog */}
      <Dialog open={isQuickAddGuestDialogOpen} onOpenChange={setIsQuickAddGuestDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quick Add Additional Guest</DialogTitle>
            <DialogDescription>
              Add a guest directly to this booking. Same fields as main guest.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quick-guest-title">Title</Label>
                <Select
                  value={quickAddGuest.title ?? "none"}
                  onValueChange={(v) => setQuickAddGuest({ ...quickAddGuest, title: v === "none" ? undefined : (v as Title) })}
                >
                  <SelectTrigger id="edit-quick-guest-title">
                    <SelectValue placeholder="Select title (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Miss">Miss</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                    <SelectItem value="Prof">Prof</SelectItem>
                    <SelectItem value="Rev">Rev</SelectItem>
                    <SelectItem value="Sir">Sir</SelectItem>
                    <SelectItem value="Madam">Madam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quick-guest-name">Full Name *</Label>
                <Input
                  id="edit-quick-guest-name"
                  value={quickAddGuest.name || ""}
                  onChange={(e) => setQuickAddGuest({ ...quickAddGuest, name: e.target.value })}
                  placeholder="Full name"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quick-guest-email">Email</Label>
                <Input id="edit-quick-guest-email" type="email" value={quickAddGuest.email || ""} onChange={(e) => setQuickAddGuest({ ...quickAddGuest, email: e.target.value })} placeholder="Email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quick-guest-phone">Phone</Label>
                <Input id="edit-quick-guest-phone" value={quickAddGuest.phone || ""} onChange={(e) => setQuickAddGuest({ ...quickAddGuest, phone: e.target.value })} placeholder="Phone" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quick-guest-phone2">Phone 2</Label>
                <Input id="edit-quick-guest-phone2" value={quickAddGuest.phone2 || ""} onChange={(e) => setQuickAddGuest({ ...quickAddGuest, phone2: e.target.value })} placeholder="Phone 2" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quick-guest-phone3">Phone 3</Label>
                <Input id="edit-quick-guest-phone3" value={quickAddGuest.phone3 || ""} onChange={(e) => setQuickAddGuest({ ...quickAddGuest, phone3: e.target.value })} placeholder="Phone 3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quick-guest-idNumber">ID / Passport</Label>
                <Input id="edit-quick-guest-idNumber" value={quickAddGuest.idNumber || ""} onChange={(e) => setQuickAddGuest({ ...quickAddGuest, idNumber: e.target.value })} placeholder="ID or Passport" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-quick-guest-birthday">Birthday</Label>
              <Input id="edit-quick-guest-birthday" type="date" value={quickAddGuest.birthday || ""} onChange={(e) => setQuickAddGuest({ ...quickAddGuest, birthday: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-quick-guest-address">Address</Label>
              <Input id="edit-quick-guest-address" value={quickAddGuest.address || ""} onChange={(e) => setQuickAddGuest({ ...quickAddGuest, address: e.target.value })} placeholder="Address" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quick-guest-city">City</Label>
                <Input id="edit-quick-guest-city" value={quickAddGuest.city || ""} onChange={(e) => setQuickAddGuest({ ...quickAddGuest, city: e.target.value })} placeholder="City" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-quick-guest-country">Country</Label>
                <CountrySelector value={quickAddGuest.country || ""} onValueChange={(v) => setQuickAddGuest({ ...quickAddGuest, country: v })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsQuickAddGuestDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleQuickAddAdditionalGuest}>Add Guest</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
