"use client";

import { useState, useEffect, use } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { calculateInvoiceTotal } from "@/lib/data";
import { addGuest, getGuestById, getGuests } from "@/lib/guests";
import { getSavedItems, addSavedItem } from "@/lib/invoice-items";
import { formatCurrency } from "@/lib/currency";
import { InvoiceItem, Guest, Currency, Title } from "@/types/invoice";
import { useRouter } from "next/navigation";
import { BookOpen, CreditCard, Building2, FileText, Wallet, Globe, Banknote } from "lucide-react";
import { CountrySelector } from "@/components/country-selector";
import { Checkbox } from "@/components/ui/checkbox";
import { getBankDetails, getBankDetailById, addBankDetail, deleteBankDetail, type BankDetail } from "@/lib/bank-details";
import { PaymentMethod } from "@/types/invoice";
import { getInvoiceById, updateInvoice } from "@/lib/invoices";
import { Invoice } from "@/types/invoice";

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  
  // All the same state variables as NewInvoicePage
  const [currency, setCurrency] = useState<Currency>("USD");
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
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, total: 0 },
  ]);
  const [taxRate, setTaxRate] = useState(10);
  const [serviceChargeRate, setServiceChargeRate] = useState(10);
  const [damageCharge, setDamageCharge] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [priceAdjustment, setPriceAdjustment] = useState(0);
  const [priceAdjustmentReason, setPriceAdjustmentReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaveItemDialogOpen, setIsSaveItemDialogOpen] = useState(false);
  const [itemToSave, setItemToSave] = useState<InvoiceItem | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedBankDetailId, setSelectedBankDetailId] = useState<string>("");
  const [checksPayableTo, setChecksPayableTo] = useState<string>("PHOENIX GLOBAL SOLUTIONS");
  const [cardLast4Digits, setCardLast4Digits] = useState<string>("");
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [isAddBankDialogOpen, setIsAddBankDialogOpen] = useState(false);
  const [newBankDetail, setNewBankDetail] = useState<Omit<BankDetail, "id" | "createdAt" | "updatedAt">>({
    accountName: "",
    bankName: "",
    branch: "",
    accountNumber: "",
    bankAddress: "",
    swiftCode: "",
  });
  const [savedItems, setSavedItems] = useState<InvoiceItem[]>([]);
  const [savedItemsSearchTerm, setSavedItemsSearchTerm] = useState("");

  // Load invoice data
  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const data = await getInvoiceById(id);
        if (data) {
          setInvoice(data);
          // Populate all form fields with invoice data
          setCurrency(data.currency);
          setGuest(data.guest);
          setSelectedGuestId(data.guest.id || "");
          setCheckIn(data.checkIn);
          setCheckOut(data.checkOut);
          setItems(data.items);
          setTaxRate(data.taxRate);
          setServiceChargeRate(data.serviceChargeRate);
          setDamageCharge(data.damageCharge);
          setDiscount(data.discount);
          setDiscountType(data.discountType);
          setPriceAdjustment(data.priceAdjustment);
          setPriceAdjustmentReason(data.priceAdjustmentReason || "");
          setNotes(data.notes || "");
          setPaymentMethods(data.paymentMethods);
          setSelectedBankDetailId(data.selectedBankDetailId || "");
          setChecksPayableTo(data.checksPayableTo || "PHOENIX GLOBAL SOLUTIONS");
          setCardLast4Digits(data.cardLast4Digits || "");
        }
      } catch (error) {
        console.error("Error loading invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    // Load supporting data
    const loadSupportingData = async () => {
      const [banks, guests, savedItemsData] = await Promise.all([
        getBankDetails(),
        getGuests(),
        getSavedItems(),
      ]);
      setBankDetails(banks);
      setAvailableGuests(guests);
      setSavedItems(savedItemsData);
    };

    loadInvoice();
    loadSupportingData();
  }, [id]);

  const calculations = calculateInvoiceTotal(
    items,
    taxRate,
    discount,
    discountType,
    serviceChargeRate,
    damageCharge,
    priceAdjustment
  );

  // All the same handler functions as NewInvoicePage
  const handleGuestSelect = async (guestId: string) => {
    if (guestId === "new") {
      setIsAddGuestDialogOpen(true);
      return;
    }
    const selectedGuest = await getGuestById(guestId);
    if (selectedGuest) {
      setGuest(selectedGuest);
      setSelectedGuestId(guestId);
    }
  };

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
    const guests = await getGuests();
    setAvailableGuests(guests);
  };

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
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const addItemFromSaved = (savedItem: InvoiceItem) => {
    if (savedItem.currency && savedItem.currency !== currency) {
      const confirmAdd = confirm(
        `This item was saved with ${savedItem.currency}, but your invoice is in ${currency}. ` +
        `The price will be used as-is (${formatCurrency(savedItem.unitPrice, savedItem.currency)}). ` +
        `Do you want to continue?`
      );
      if (!confirmAdd) return;
    }
    
    setItems((prev) => [
      ...prev,
      {
        ...savedItem,
        id: Date.now().toString(),
      },
    ]);
  };

  const handleSaveItem = (item: InvoiceItem) => {
    setItemToSave(item);
    setIsSaveItemDialogOpen(true);
  };

  const confirmSaveItem = async () => {
    if (itemToSave) {
      await addSavedItem({
        description: itemToSave.description,
        quantity: 1,
        unitPrice: itemToSave.unitPrice,
        total: itemToSave.unitPrice,
        currency: currency,
      });
      setIsSaveItemDialogOpen(false);
      setItemToSave(null);
      const items = await getSavedItems();
      setSavedItems(items);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!guest.name || !guest.name.trim()) {
      alert("Full Name is required in Guest Information");
      return;
    }
    
    if (!invoice) return;
    
    try {
      await updateInvoice(id, {
        guest,
        currency,
        checkIn,
        checkOut,
        items,
        subtotal: calculations.subtotal,
        serviceCharge: calculations.serviceCharge,
        serviceChargeRate,
        damageCharge,
        taxRate,
        taxAmount: calculations.taxAmount,
        discount,
        discountType,
        priceAdjustment,
        priceAdjustmentReason: priceAdjustmentReason || undefined,
        total: calculations.total,
        paymentMethods,
        selectedBankDetailId: selectedBankDetailId || undefined,
        checksPayableTo: paymentMethods.includes("cheque") ? checksPayableTo : undefined,
        cardLast4Digits: paymentMethods.includes("card") && cardLast4Digits ? cardLast4Digits : undefined,
        notes: notes || undefined,
      });
      
      alert("Invoice updated successfully!");
      router.push(`/invoices/${id}`);
    } catch (error) {
      console.error("Error updating invoice:", error);
      alert("Error updating invoice. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Invoice Not Found</h1>
          <Link href="/invoices">
            <Button>Back to Invoices</Button>
          </Link>
        </div>
      </div>
    );
  }

  // The rest of the component JSX is identical to NewInvoicePage
  // For brevity, I'll include a note that the JSX should be copied from NewInvoicePage
  // but with "Create New Invoice" changed to "Edit Invoice" and "Create Invoice" button changed to "Update Invoice"
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/invoices/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Invoice</h1>
          <p className="text-muted-foreground">Invoice #{invoice.invoiceNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Guest Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="selectGuest">Select Customer/Guest</Label>
                <div className="flex gap-2">
                  <Select value={selectedGuestId} onValueChange={handleGuestSelect}>
                    <SelectTrigger id="selectGuest" className="flex-1">
                      <SelectValue placeholder="Select or add guest" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGuests.map((g) => (
                        <SelectItem key={g.id} value={g.id!}>
                          {g.name} - {g.email}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Add New Guest
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Dialog open={isAddGuestDialogOpen} onOpenChange={setIsAddGuestDialogOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon">
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Guest</DialogTitle>
                        <DialogDescription>
                          Add a new customer/guest to the system
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="newGuestTitle">Title</Label>
                            <Select
                              value={newGuest.title || undefined}
                              onValueChange={(value) =>
                                setNewGuest({ ...newGuest, title: value as Title })
                              }
                            >
                              <SelectTrigger id="newGuestTitle">
                                <SelectValue placeholder="Select title (optional)" />
                              </SelectTrigger>
                              <SelectContent>
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
                            <Label htmlFor="newGuestName">Full Name *</Label>
                            <Input
                              id="newGuestName"
                              value={newGuest.name || ""}
                              onChange={(e) =>
                                setNewGuest({ ...newGuest, name: e.target.value })
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newGuestBirthday">Birthday</Label>
                          <Input
                            id="newGuestBirthday"
                            type="date"
                            value={newGuest.birthday || ""}
                            onChange={(e) =>
                              setNewGuest({ ...newGuest, birthday: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newGuestEmail">Email</Label>
                          <Input
                            id="newGuestEmail"
                            type="email"
                            value={newGuest.email || ""}
                            onChange={(e) =>
                              setNewGuest({ ...newGuest, email: e.target.value })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="newGuestPhone">Phone</Label>
                            <Input
                              id="newGuestPhone"
                              value={newGuest.phone || ""}
                              onChange={(e) =>
                                setNewGuest({ ...newGuest, phone: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newGuestPhone2">Phone 2</Label>
                            <Input
                              id="newGuestPhone2"
                              value={newGuest.phone2 || ""}
                              onChange={(e) =>
                                setNewGuest({ ...newGuest, phone2: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newGuestPhone3">Phone 3</Label>
                            <Input
                              id="newGuestPhone3"
                              value={newGuest.phone3 || ""}
                              onChange={(e) =>
                                setNewGuest({ ...newGuest, phone3: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newGuestAddress">Address</Label>
                          <Input
                            id="newGuestAddress"
                            value={newGuest.address}
                            onChange={(e) =>
                              setNewGuest({ ...newGuest, address: e.target.value })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="newGuestCity">City</Label>
                            <Input
                              id="newGuestCity"
                              value={newGuest.city}
                              onChange={(e) =>
                                setNewGuest({ ...newGuest, city: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newGuestCountry">Country</Label>
                            <CountrySelector
                              id="newGuestCountry"
                              value={newGuest.country}
                              onValueChange={(value) =>
                                setNewGuest({ ...newGuest, country: value })
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newGuestIdNumber">ID or Passport Number</Label>
                          <Input
                            id="newGuestIdNumber"
                            value={newGuest.idNumber || ""}
                            onChange={(e) =>
                              setNewGuest({ ...newGuest, idNumber: e.target.value })
                            }
                            placeholder="Enter ID or Passport number"
                          />
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
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guestTitle">Title</Label>
                  <Select
                    value={guest.title || undefined}
                    onValueChange={(value) =>
                      setGuest({ ...guest, title: value as Title })
                    }
                  >
                    <SelectTrigger id="guestTitle">
                      <SelectValue placeholder="Select title (optional)" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Label htmlFor="guestName">Full Name *</Label>
                  <Input
                    id="guestName"
                    value={guest.name || ""}
                    onChange={(e) => setGuest({ ...guest, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestBirthday">Birthday</Label>
                <Input
                  id="guestBirthday"
                  type="date"
                  value={guest.birthday || ""}
                  onChange={(e) => setGuest({ ...guest, birthday: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestEmail">Email</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  value={guest.email || ""}
                  onChange={(e) => setGuest({ ...guest, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guestPhone">Phone</Label>
                  <Input
                    id="guestPhone"
                    value={guest.phone || ""}
                    onChange={(e) => setGuest({ ...guest, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestPhone2">Phone 2</Label>
                  <Input
                    id="guestPhone2"
                    value={guest.phone2 || ""}
                    onChange={(e) => setGuest({ ...guest, phone2: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestPhone3">Phone 3</Label>
                  <Input
                    id="guestPhone3"
                    value={guest.phone3 || ""}
                    onChange={(e) => setGuest({ ...guest, phone3: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestAddress">Address</Label>
                <Input
                  id="guestAddress"
                  value={guest.address}
                  onChange={(e) => setGuest({ ...guest, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guestCity">City</Label>
                  <Input
                    id="guestCity"
                    value={guest.city}
                    onChange={(e) => setGuest({ ...guest, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestCountry">Country</Label>
                  <CountrySelector
                    id="guestCountry"
                    value={guest.country}
                    onValueChange={(value) => setGuest({ ...guest, country: value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestIdNumber">ID or Passport Number</Label>
                <Input
                  id="guestIdNumber"
                  value={guest.idNumber || ""}
                  onChange={(e) => setGuest({ ...guest, idNumber: e.target.value })}
                  placeholder="Enter ID or Passport number"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Select value={currency} onValueChange={(value) => setCurrency(value as Currency)} required>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="USD">USD - US Dollar</SelectItem>
                     <SelectItem value="LKR">LKR - Sri Lankan Rupee</SelectItem>
                   </SelectContent>
                </Select>
              </div>
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
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Invoice Items</CardTitle>
               <div className="flex gap-2">
                 <Select 
                   onValueChange={(value) => {
                     const selectedItem = savedItems.find(i => i.id === value);
                     if (selectedItem) {
                       addItemFromSaved(selectedItem);
                       setSavedItemsSearchTerm("");
                     }
                   }}
                 >
                   <SelectTrigger className="w-[200px]">
                     <SelectValue placeholder="Add from saved items" />
                   </SelectTrigger>
                   <SelectContent>
                     <div className="p-2">
                       <Input
                         placeholder="Search items..."
                         value={savedItemsSearchTerm}
                         onChange={(e) => setSavedItemsSearchTerm(e.target.value)}
                         className="mb-2"
                         onClick={(e) => e.stopPropagation()}
                         onKeyDown={(e) => e.stopPropagation()}
                       />
                     </div>
                     <div className="max-h-[300px] overflow-y-auto">
                       {savedItems
                         .filter((item) =>
                           item.description.toLowerCase().includes(savedItemsSearchTerm.toLowerCase()) ||
                           formatCurrency(item.unitPrice, item.currency || currency).toLowerCase().includes(savedItemsSearchTerm.toLowerCase())
                         )
                         .map((item) => {
                           const currencyMatch = !item.currency || item.currency === currency;
                           return (
                             <SelectItem key={item.id} value={item.id}>
                               <div className="flex items-center justify-between w-full">
                                 <span>
                                   {item.description} - {formatCurrency(item.unitPrice, item.currency || currency)}
                                 </span>
                                 {!currencyMatch && (
                                   <span className="ml-2 text-xs text-amber-600 font-medium">
                                     ({item.currency})
                                   </span>
                                 )}
                               </div>
                             </SelectItem>
                           );
                         })}
                       {savedItems.filter((item) =>
                         item.description.toLowerCase().includes(savedItemsSearchTerm.toLowerCase()) ||
                         formatCurrency(item.unitPrice, item.currency || currency).toLowerCase().includes(savedItemsSearchTerm.toLowerCase())
                       ).length === 0 && (
                         <div className="px-2 py-1.5 text-sm text-muted-foreground">
                           No items found
                         </div>
                       )}
                     </div>
                   </SelectContent>
                 </Select>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24">Quantity</TableHead>
                  <TableHead className="w-32">Unit Price</TableHead>
                  <TableHead className="w-32">Total</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(item.id, "description", e.target.value)
                        }
                        placeholder="Item description"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(item.id, "quantity", Number(e.target.value))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleItemChange(item.id, "unitPrice", Number(e.target.value))
                        }
                      />
                    </TableCell>
                    <TableCell>{formatCurrency(item.total, currency)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveItem(item)}
                          title="Save item for future use"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Charges & Adjustments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceChargeRate">Service Charge Rate (%)</Label>
                <Input
                  id="serviceChargeRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={serviceChargeRate}
                  onChange={(e) => setServiceChargeRate(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="damageCharge">Damage Charge</Label>
                <Input
                  id="damageCharge"
                  type="number"
                  min="0"
                  step="0.01"
                  value={damageCharge}
                  onChange={(e) => setDamageCharge(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type</Label>
                <Select value={discountType} onValueChange={(value) => setDiscountType(value as "percentage" | "fixed")}>
                  <SelectTrigger id="discountType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">
                  Discount {discountType === "percentage" ? "(%)" : `(${currency})`}
                </Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  step={discountType === "percentage" ? "0.1" : "0.01"}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="priceAdjustment">Price Adjustment ({currency})</Label>
                <Input
                  id="priceAdjustment"
                  type="number"
                  step="0.01"
                  value={priceAdjustment}
                  onChange={(e) => setPriceAdjustment(Number(e.target.value))}
                  placeholder="Positive for addition, negative for deduction"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceAdjustmentReason">Adjustment Reason</Label>
                <Input
                  id="priceAdjustmentReason"
                  value={priceAdjustmentReason}
                  onChange={(e) => setPriceAdjustmentReason(e.target.value)}
                  placeholder="Reason for price adjustment"
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(calculations.subtotal, currency)}</span>
                </div>
                {calculations.serviceCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Charge ({serviceChargeRate}%)</span>
                    <span>{formatCurrency(calculations.serviceCharge, currency)}</span>
                  </div>
                )}
                {calculations.damageCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Damage Charge</span>
                    <span className="text-red-600">{formatCurrency(calculations.damageCharge, currency)}</span>
                  </div>
                )}
                {calculations.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Discount {discountType === "percentage" ? `(${discount}%)` : `(Fixed)`}
                    </span>
                    <span className="text-green-600">
                      -{formatCurrency(calculations.discount, currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                  <span>{formatCurrency(calculations.taxAmount, currency)}</span>
                </div>
                {calculations.priceAdjustment !== 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Price Adjustment {priceAdjustmentReason && `(${priceAdjustmentReason})`}
                    </span>
                    <span className={calculations.priceAdjustment > 0 ? "text-red-600" : "text-green-600"}>
                      {calculations.priceAdjustment > 0 ? "+" : ""}{formatCurrency(calculations.priceAdjustment, currency)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(calculations.total, currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods & Bank Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>Select Payment Methods</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="payment-bank"
                    checked={paymentMethods.includes("bank_account")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPaymentMethods([...paymentMethods, "bank_account"]);
                      } else {
                        setPaymentMethods(paymentMethods.filter((m) => m !== "bank_account"));
                        if (selectedBankDetailId) setSelectedBankDetailId("");
                      }
                    }}
                  />
                  <Label
                    htmlFor="payment-bank"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Building2 className="h-4 w-4" />
                    Bank Account
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="payment-cheque"
                    checked={paymentMethods.includes("cheque")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPaymentMethods([...paymentMethods, "cheque"]);
                      } else {
                        setPaymentMethods(paymentMethods.filter((m) => m !== "cheque"));
                      }
                    }}
                  />
                  <Label
                    htmlFor="payment-cheque"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="h-4 w-4" />
                    Cheque Payment
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="payment-offline"
                    checked={paymentMethods.includes("offline")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPaymentMethods([...paymentMethods, "offline"]);
                      } else {
                        setPaymentMethods(paymentMethods.filter((m) => m !== "offline"));
                      }
                    }}
                  />
                  <Label
                    htmlFor="payment-offline"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Wallet className="h-4 w-4" />
                    Offline Payment
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="payment-online"
                    checked={paymentMethods.includes("online")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPaymentMethods([...paymentMethods, "online"]);
                      } else {
                        setPaymentMethods(paymentMethods.filter((m) => m !== "online"));
                      }
                    }}
                    disabled
                  />
                  <Label
                    htmlFor="payment-online"
                    className="flex items-center gap-2 cursor-pointer text-muted-foreground"
                  >
                    <Globe className="h-4 w-4" />
                    Online Payment <span className="text-xs">(Coming Soon)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="payment-cash"
                    checked={paymentMethods.includes("cash")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPaymentMethods([...paymentMethods, "cash"]);
                      } else {
                        setPaymentMethods(paymentMethods.filter((m) => m !== "cash"));
                      }
                    }}
                  />
                  <Label
                    htmlFor="payment-cash"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Banknote className="h-4 w-4" />
                    Cash Payment
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="payment-card"
                    checked={paymentMethods.includes("card")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPaymentMethods([...paymentMethods, "card"]);
                      } else {
                        setPaymentMethods(paymentMethods.filter((m) => m !== "card"));
                        setCardLast4Digits("");
                      }
                    }}
                  />
                  <Label
                    htmlFor="payment-card"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="h-4 w-4" />
                    Card Payment
                  </Label>
                </div>
              </div>
            </div>

            {paymentMethods.includes("bank_account") && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bankDetail">Select Bank Account</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddBankDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Bank Account
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={selectedBankDetailId}
                    onValueChange={setSelectedBankDetailId}
                  >
                    <SelectTrigger id="bankDetail" className="flex-1">
                      <SelectValue placeholder="Select bank account from saved list" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankDetails.map((bank) => (
                        <SelectItem key={bank.id} value={bank.id}>
                          {bank.bankName} - {bank.accountNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedBankDetailId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this bank account?")) {
                          await deleteBankDetail(selectedBankDetailId);
                          const banks = await getBankDetails();
                          setBankDetails(banks);
                          setSelectedBankDetailId(""); // Clear selection after deletion
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {selectedBankDetailId && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    {(() => {
                      const bank = bankDetails.find((b) => b.id === selectedBankDetailId);
                      if (!bank) return null;
                      return (
                        <>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Account Name:</span>
                              <p className="text-muted-foreground">{bank.accountName}</p>
                            </div>
                            <div>
                              <span className="font-medium">Bank Name:</span>
                              <p className="text-muted-foreground">{bank.bankName}</p>
                            </div>
                            <div>
                              <span className="font-medium">Branch:</span>
                              <p className="text-muted-foreground">{bank.branch}</p>
                            </div>
                            <div>
                              <span className="font-medium">Account Number:</span>
                              <p className="text-muted-foreground">{bank.accountNumber}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium">Bank Address:</span>
                              <p className="text-muted-foreground">{bank.bankAddress}</p>
                            </div>
                            <div>
                              <span className="font-medium">SWIFT Code:</span>
                              <p className="text-muted-foreground">{bank.swiftCode}</p>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {paymentMethods.includes("cheque") && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="checksPayableTo">Checks Payable To *</Label>
                  <Input
                    id="checksPayableTo"
                    value={checksPayableTo}
                    onChange={(e) => setChecksPayableTo(e.target.value)}
                    placeholder="Enter name for checks payable to"
                    required={paymentMethods.includes("cheque")}
                  />
                </div>
              </div>
            )}

            {paymentMethods.includes("card") && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="cardLast4Digits">Card Last 4 Digits *</Label>
                  <Input
                    id="cardLast4Digits"
                    type="text"
                    maxLength={4}
                    value={cardLast4Digits}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setCardLast4Digits(value);
                    }}
                    placeholder="1234"
                    required={paymentMethods.includes("card")}
                    className="w-32"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the last 4 digits of the card used for payment
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href={`/invoices/${id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit">Update Invoice</Button>
        </div>
      </form>

      {/* Save Item Dialog */}
      <Dialog open={isSaveItemDialogOpen} onOpenChange={setIsSaveItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Item for Future Use</DialogTitle>
            <DialogDescription>
              Save this item to your catalog for quick access in future invoices
            </DialogDescription>
          </DialogHeader>
           {itemToSave && (
             <div className="space-y-4 py-4">
               <div className="space-y-2">
                 <Label>Description</Label>
                 <p className="text-sm text-muted-foreground">{itemToSave.description}</p>
               </div>
               <div className="space-y-2">
                 <Label>Unit Price</Label>
                 <p className="text-sm text-muted-foreground">
                   {formatCurrency(itemToSave.unitPrice, currency)} ({currency})
                 </p>
                 <p className="text-xs text-muted-foreground">
                   This item will be saved with {currency} currency
                 </p>
               </div>
             </div>
           )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSaveItemDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={confirmSaveItem}>
              Save Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bank Account Dialog */}
      <Dialog open={isAddBankDialogOpen} onOpenChange={setIsAddBankDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bank Account</DialogTitle>
            <DialogDescription>
              Add a new bank account to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newBankAccountName">Account Name *</Label>
              <Input
                id="newBankAccountName"
                value={newBankDetail.accountName}
                onChange={(e) =>
                  setNewBankDetail({ ...newBankDetail, accountName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newBankName">Bank Name *</Label>
              <Input
                id="newBankName"
                value={newBankDetail.bankName}
                onChange={(e) =>
                  setNewBankDetail({ ...newBankDetail, bankName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newBankBranch">Branch *</Label>
              <Input
                id="newBankBranch"
                value={newBankDetail.branch}
                onChange={(e) =>
                  setNewBankDetail({ ...newBankDetail, branch: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newBankAccountNumber">Account Number *</Label>
              <Input
                id="newBankAccountNumber"
                value={newBankDetail.accountNumber}
                onChange={(e) =>
                  setNewBankDetail({ ...newBankDetail, accountNumber: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newBankAddress">Bank Address *</Label>
              <Input
                id="newBankAddress"
                value={newBankDetail.bankAddress}
                onChange={(e) =>
                  setNewBankDetail({ ...newBankDetail, bankAddress: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newBankSwiftCode">SWIFT Code *</Label>
              <Input
                id="newBankSwiftCode"
                value={newBankDetail.swiftCode}
                onChange={(e) =>
                  setNewBankDetail({ ...newBankDetail, swiftCode: e.target.value })
                }
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddBankDialogOpen(false);
                setNewBankDetail({
                  accountName: "",
                  bankName: "",
                  branch: "",
                  accountNumber: "",
                  bankAddress: "",
                  swiftCode: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {
                if (
                  !newBankDetail.accountName ||
                  !newBankDetail.bankName ||
                  !newBankDetail.branch ||
                  !newBankDetail.accountNumber ||
                  !newBankDetail.bankAddress ||
                  !newBankDetail.swiftCode
                ) {
                  alert("Please fill in all required fields");
                  return;
                }
                const addedBank = await addBankDetail(newBankDetail);
                setBankDetails([...bankDetails, addedBank]);
                setSelectedBankDetailId(addedBank.id);
                setIsAddBankDialogOpen(false);
                setNewBankDetail({
                  accountName: "",
                  bankName: "",
                  branch: "",
                  accountNumber: "",
                  bankAddress: "",
                  swiftCode: "",
                });
              }}
            >
              Add Bank Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
