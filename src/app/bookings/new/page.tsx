"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ArrowLeft, UserPlus, Calendar, Users, Plus, Trash2, Copy } from "lucide-react";
import Link from "next/link";
import { addGuest, getGuestById, getGuests } from "@/lib/guests";
import { Guest, Title, InvoiceItem } from "@/types/invoice";
import { BookingStatus } from "@/types/booking";
import { useRouter } from "next/navigation";
import { CountrySelector } from "@/components/country-selector";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSavedItems } from "@/lib/invoice-items";
import { formatCurrency } from "@/lib/currency";

export default function NewBookingPage() {
  const router = useRouter();
  const [selectedGuestId, setSelectedGuestId] = useState<string>("");
  const [isAddGuestDialogOpen, setIsAddGuestDialogOpen] = useState(false);
  const [availableGuests, setAvailableGuests] = useState<Guest[]>([]);
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
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [roomType, setRoomType] = useState("");
  const [adults, setAdults] = useState<number | undefined>(undefined);
  const [children, setChildren] = useState<number | undefined>(undefined);
  const [babies, setBabies] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<BookingStatus>("booked");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Additional guests
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
  
  // Invoice items
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [savedItems, setSavedItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    // Load guests
    const loadGuests = async () => {
      const guests = await getGuests();
      setAvailableGuests(guests);
    };
    
    // Load saved invoice items
    const loadSavedItems = async () => {
      const items = await getSavedItems();
      setSavedItems(items);
    };
    
    loadGuests();
    loadSavedItems();
  }, []);

  // Handle guest selection
  useEffect(() => {
    const loadSelectedGuest = async () => {
      if (!selectedGuestId || selectedGuestId.trim() === '') {
        setGuest({
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
        return;
      }

      try {
        const selectedGuest = await getGuestById(selectedGuestId);
        if (selectedGuest) {
          setGuest(selectedGuest);
        } else {
          console.warn(`Guest with ID "${selectedGuestId}" not found`);
        }
      } catch (error) {
        console.error('Error selecting guest:', error);
      }
    };
    loadSelectedGuest();
  }, [selectedGuestId]);

  // Handle adding new guest
  const handleAddGuest = async () => {
    if (!newGuest.name || !newGuest.name.trim()) {
      alert("Full Name is required");
      return;
    }
    const addedGuest = await addGuest(newGuest);
    setGuest(addedGuest);
    setSelectedGuestId(addedGuest.id!);
    setIsAddGuestDialogOpen(false);
    setNewGuest({
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
    // Refresh guests list
    const guests = await getGuests();
    setAvailableGuests(guests);
  };

  // Handle adding additional guest
  const handleAddAdditionalGuest = async () => {
    if (!selectedAdditionalGuestId || selectedAdditionalGuestId.trim() === '') {
      return;
    }
    
    try {
      const selectedGuest = await getGuestById(selectedAdditionalGuestId);
      if (selectedGuest) {
        // Check if guest is already added (as primary or additional)
        const isPrimaryGuest = guest.id && selectedGuest.id && guest.id === selectedGuest.id;
        const isAlreadyAdded = selectedGuest.id && additionalGuests.some(g => g.id && g.id === selectedGuest.id);
        
        if (isPrimaryGuest) {
          alert("This guest is already set as the primary guest");
          setSelectedAdditionalGuestId("");
          return;
        }
        
        if (isAlreadyAdded) {
          alert("This guest is already added");
          setSelectedAdditionalGuestId("");
          return;
        }
        
        setAdditionalGuests([...additionalGuests, selectedGuest]);
        setSelectedAdditionalGuestId("");
      } else {
        alert("Guest not found. Please select a valid guest.");
        setSelectedAdditionalGuestId("");
      }
    } catch (error) {
      console.error('Error adding additional guest:', error);
      alert("Error adding guest. Please try again.");
      setSelectedAdditionalGuestId("");
    }
  };

  // Handle removing additional guest
  const handleRemoveAdditionalGuest = (guestId: string) => {
    setAdditionalGuests(additionalGuests.filter(g => g.id !== guestId));
  };

  // Handle quick add additional guest
  const handleQuickAddAdditionalGuest = async () => {
    if (!quickAddGuest.name || !quickAddGuest.name.trim()) {
      alert("Full Name is required");
      return;
    }
    
    try {
      const addedGuest = await addGuest(quickAddGuest);
      
      // Check if this guest is already the primary guest
      const isPrimaryGuest = addedGuest.id === selectedGuestId;
      
      if (isPrimaryGuest) {
        alert("This guest is already set as the primary guest");
        setIsQuickAddGuestDialogOpen(false);
        setQuickAddGuest({
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
        const guests = await getGuests();
        setAvailableGuests(guests);
        return;
      }
      
      // Check if this guest is already in additional guests
      const isAlreadyAdded = addedGuest.id && additionalGuests.some(g => g.id && g.id === addedGuest.id);
      
      if (isAlreadyAdded) {
        alert("This guest is already added as an additional guest");
        setIsQuickAddGuestDialogOpen(false);
        setQuickAddGuest({
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
        const guests = await getGuests();
        setAvailableGuests(guests);
        return;
      }
      
      // Add to additional guests
      setAdditionalGuests([...additionalGuests, addedGuest]);
      setIsQuickAddGuestDialogOpen(false);
      setQuickAddGuest({
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
      const guests = await getGuests();
      setAvailableGuests(guests);
    } catch (error) {
      console.error("Error adding guest:", error);
      alert("Error adding guest. Please try again.");
    }
  };

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
    
    // Validate required fields
    if (!guest.name || !guest.name.trim()) {
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
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestId: guest.id,
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
        }),
      });

      const data = await response.json();
      if (data.success) {
        router.push(`/bookings/${data.booking.id}`);
      } else {
        alert(data.error || "Failed to create booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Error creating booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/bookings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Booking</h1>
          <p className="text-muted-foreground">
            Create a new guest booking
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
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
                  <Label htmlFor="guest">Select Guest</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={selectedGuestId || undefined} 
                      onValueChange={(value) => {
                        if (value === "new") {
                          setSelectedGuestId("");
                        } else {
                          setSelectedGuestId(value);
                        }
                      }}
                    >
                      <SelectTrigger id="guest">
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddGuestDialogOpen(true)}
                    >
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
                    <Label htmlFor="title">Title</Label>
                    <Select
                      value={guest.title || "none"}
                      onValueChange={(value) => setGuest({ ...guest, title: value === "none" ? undefined : (value as Title) })}
                    >
                      <SelectTrigger id="title">
                        <SelectValue placeholder="Select title" />
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
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={guest.name || ""}
                      onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={guest.email || ""}
                      onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={guest.phone || ""}
                      onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={guest.address || ""}
                      onChange={(e) => setGuest({ ...guest, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={guest.city || ""}
                      onChange={(e) => setGuest({ ...guest, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <CountrySelector
                      value={guest.country || ""}
                      onValueChange={(value) => setGuest({ ...guest, country: value })}
                    />
                  </div>
                </div>
              )}

              {/* Additional Guests */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Additional Guests</Label>
                  <div className="flex gap-2">
                    <Select 
                      value={selectedAdditionalGuestId || undefined}
                      onValueChange={(value) => {
                        if (value === "quick-add") {
                          setIsQuickAddGuestDialogOpen(true);
                        } else {
                          setSelectedAdditionalGuestId(value);
                        }
                      }}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Add guest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quick-add">Quick Add Guest</SelectItem>
                        {availableGuests
                          .filter(g => {
                            const isPrimary = g.id === selectedGuestId;
                            const isAlreadyAdded = additionalGuests.some(ag => ag.id === g.id);
                            return !isPrimary && !isAlreadyAdded;
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
                    {additionalGuests.map((ag, index) => (
                      <div key={ag.id || index} className="flex items-center justify-between p-2 bg-muted rounded">
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

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Invoice Items</CardTitle>
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
                  No items added. Click "Add Item" to add invoice items.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
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

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href="/bookings">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Booking"}
            </Button>
          </div>
        </div>
      </form>

      {/* Add Guest Dialog */}
      <Dialog open={isAddGuestDialogOpen} onOpenChange={setIsAddGuestDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Guest</DialogTitle>
            <DialogDescription>
              Add a new guest to the system
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-guest-title">Title</Label>
                <Select
                  value={newGuest.title || "none"}
                  onValueChange={(value) => setNewGuest({ ...newGuest, title: value === "none" ? undefined : (value as Title) })}
                >
                  <SelectTrigger id="new-guest-title">
                    <SelectValue placeholder="Select title" />
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
                <Label htmlFor="new-guest-name">Full Name *</Label>
                <Input
                  id="new-guest-name"
                  value={newGuest.name || ""}
                  onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-guest-email">Email</Label>
                <Input
                  id="new-guest-email"
                  type="email"
                  value={newGuest.email || ""}
                  onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-guest-phone">Phone</Label>
                <Input
                  id="new-guest-phone"
                  value={newGuest.phone || ""}
                  onChange={(e) => setNewGuest({ ...newGuest, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-guest-address">Address</Label>
                <Input
                  id="new-guest-address"
                  value={newGuest.address || ""}
                  onChange={(e) => setNewGuest({ ...newGuest, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-guest-city">City</Label>
                <Input
                  id="new-guest-city"
                  value={newGuest.city || ""}
                  onChange={(e) => setNewGuest({ ...newGuest, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-guest-country">Country</Label>
                <CountrySelector
                  value={newGuest.country || ""}
                  onValueChange={(value) => setNewGuest({ ...newGuest, country: value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddGuestDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleAddGuest}>
              Add Guest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Add Additional Guest Dialog */}
      <Dialog open={isQuickAddGuestDialogOpen} onOpenChange={setIsQuickAddGuestDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quick Add Additional Guest</DialogTitle>
            <DialogDescription>
              Add a guest directly to this booking
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quick-guest-title">Title</Label>
                <Select
                  value={quickAddGuest.title || "none"}
                  onValueChange={(value) => setQuickAddGuest({ ...quickAddGuest, title: value === "none" ? undefined : (value as Title) })}
                >
                  <SelectTrigger id="quick-guest-title">
                    <SelectValue placeholder="Select title" />
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
                <Label htmlFor="quick-guest-name">Full Name *</Label>
                <Input
                  id="quick-guest-name"
                  value={quickAddGuest.name || ""}
                  onChange={(e) => setQuickAddGuest({ ...quickAddGuest, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quick-guest-email">Email</Label>
                <Input
                  id="quick-guest-email"
                  type="email"
                  value={quickAddGuest.email || ""}
                  onChange={(e) => setQuickAddGuest({ ...quickAddGuest, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quick-guest-phone">Phone</Label>
                <Input
                  id="quick-guest-phone"
                  value={quickAddGuest.phone || ""}
                  onChange={(e) => setQuickAddGuest({ ...quickAddGuest, phone: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsQuickAddGuestDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleQuickAddAdditionalGuest}>
              Add Guest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
