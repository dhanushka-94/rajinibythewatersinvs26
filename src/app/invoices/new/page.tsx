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
import { ArrowLeft, Plus, Trash2, UserPlus, Copy, User } from "lucide-react";
import Link from "next/link";
import { generateInvoiceNumber, calculateInvoiceTotal } from "@/lib/data";
import { addGuest, getGuestById, getGuests } from "@/lib/guests";
import { getSavedItems, addSavedItem } from "@/lib/invoice-items";
import { formatCurrency } from "@/lib/currency";
import { InvoiceItem, Guest, Currency, Title } from "@/types/invoice";
import { useRouter } from "next/navigation";
import { BookOpen, CreditCard, Building2, FileText, Wallet, Globe, Banknote } from "lucide-react";
import { CountrySelector } from "@/components/country-selector";
import { Checkbox } from "@/components/ui/checkbox";
import { getBankDetails, getBankDetailById, addBankDetail, deleteBankDetail, type BankDetail } from "@/lib/bank-details";
import { PaymentMethod, BillingType } from "@/types/invoice";
import { getTravelCompanies } from "@/lib/travel-companies";
import { type TravelCompany } from "@/types/travel-company";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

export default function NewInvoicePage() {
  const router = useRouter();
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");

  useEffect(() => {
    // Generate invoice number only on client to avoid hydration mismatch
    setInvoiceNumber(generateInvoiceNumber());
    
    // Load bank details
    const loadBankDetails = async () => {
      const banks = await getBankDetails();
      setBankDetails(banks);
      // Don't auto-select bank - let user choose when needed
    };
    
    // Load guests
    const loadGuests = async () => {
      const guests = await getGuests();
      setAvailableGuests(guests);
    };
    
    // Load travel companies
    const loadTravelCompanies = async () => {
      const companies = await getTravelCompanies();
      setAvailableTravelCompanies(companies);
    };
    
    // Load saved invoice items
    const loadSavedItems = async () => {
      const items = await getSavedItems();
      setSavedItems(items);
    };
    
    loadBankDetails();
    loadGuests();
    loadTravelCompanies();
    loadSavedItems();
  }, []);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [selectedGuestId, setSelectedGuestId] = useState<string>("");
  const [isAddGuestDialogOpen, setIsAddGuestDialogOpen] = useState(false);
  const [availableGuests, setAvailableGuests] = useState<Guest[]>([]);
  const [additionalGuests, setAdditionalGuests] = useState<Guest[]>([]); // Multiple guests array
  const [selectedAdditionalGuestId, setSelectedAdditionalGuestId] = useState<string>(""); // For adding additional guests
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
  const [billingType, setBillingType] = useState<BillingType>("guest");
  const [selectedTravelCompanyId, setSelectedTravelCompanyId] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [availableTravelCompanies, setAvailableTravelCompanies] = useState<TravelCompany[]>([]);
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
  const [adults, setAdults] = useState<number | undefined>(undefined);
  const [children, setChildren] = useState<number | undefined>(undefined);
  const [babies, setBabies] = useState<number | undefined>(undefined);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, total: 0 },
  ]);
  const [taxRate, setTaxRate] = useState(10);
  const [serviceChargeRate, setServiceChargeRate] = useState(10);
  const [damageCharge, setDamageCharge] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    discountId: string;
    couponCodeId?: string;
    discountAmount: number;
    discountType: "percentage" | "fixed";
    discountValueUsed: number;
    guestId?: string;
  } | null>(null);
  const [priceAdjustment, setPriceAdjustment] = useState(0);
  const [priceAdjustmentReason, setPriceAdjustmentReason] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaveItemDialogOpen, setIsSaveItemDialogOpen] = useState(false);
  const [itemToSave, setItemToSave] = useState<InvoiceItem | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedBankDetailId, setSelectedBankDetailId] = useState<string>(""); // Deprecated: for backward compatibility
  const [selectedBankDetailIds, setSelectedBankDetailIds] = useState<string[]>([]);
  const [checksPayableTo, setChecksPayableTo] = useState<string>("PHOENIX GLOBAL SOLUTIONS");
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [deleteBankConfirm, setDeleteBankConfirm] = useState<BankDetail | null>(null);
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
  const [selectedSavedItemId, setSelectedSavedItemId] = useState<string>("");
  const calculations = calculateInvoiceTotal(
    items,
    taxRate,
    discount,
    discountType,
    serviceChargeRate,
    damageCharge,
    priceAdjustment
  );

  // Handle guest selection
  const handleGuestSelect = async (guestId: string) => {
    if (guestId === "new") {
      setIsAddGuestDialogOpen(true);
      return;
    }
    
    if (!guestId || guestId.trim() === '') {
      return;
    }
    
    try {
      const selectedGuest = await getGuestById(guestId);
      if (selectedGuest) {
        setGuest(selectedGuest);
        setSelectedGuestId(guestId);
      } else {
        console.warn(`Guest with ID "${guestId}" not found`);
        // Optionally show a user-friendly message
        // You could set an error state here if needed
      }
    } catch (error) {
      console.error('Error selecting guest:', error);
      // Optionally show a user-friendly error message
    }
  };

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
          setSelectedAdditionalGuestId(""); // Reset selector
          return;
        }
        
        if (isAlreadyAdded) {
          alert("This guest is already added");
          setSelectedAdditionalGuestId(""); // Reset selector
          return;
        }
        
        setAdditionalGuests([...additionalGuests, selectedGuest]);
        setSelectedAdditionalGuestId(""); // Reset selector
      } else {
        alert("Guest not found. Please select a valid guest.");
        setSelectedAdditionalGuestId(""); // Reset selector
      }
    } catch (error) {
      console.error('Error adding additional guest:', error);
      alert("Error adding guest. Please try again.");
      setSelectedAdditionalGuestId(""); // Reset selector
    }
  };

  // Handle removing additional guest
  const handleRemoveAdditionalGuest = (guestId: string) => {
    setAdditionalGuests(additionalGuests.filter(g => g.id !== guestId));
  };

  const handleDeleteBankConfirm = async () => {
    if (!deleteBankConfirm) return;
    try {
      await deleteBankDetail(deleteBankConfirm.id);
      const banks = await getBankDetails();
      setBankDetails(banks);
      setSelectedBankDetailIds(selectedBankDetailIds.filter((id) => id !== deleteBankConfirm.id));
      setDeleteBankConfirm(null);
    } catch (error) {
      console.error("Error deleting bank account:", error);
      alert("Failed to delete bank account.");
    }
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
        // Refresh guests list
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
        // Refresh guests list
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
      // Refresh guests list
      const guests = await getGuests();
      setAvailableGuests(guests);
    } catch (error) {
      console.error("Error adding guest:", error);
      alert("Error adding guest. Please try again.");
    }
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
        quantityType: "quantity" as const,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const addItemFromSaved = (savedItem: InvoiceItem) => {
    // Check if currency matches
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
        // Don't copy currency - it will use the invoice's currency for display
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
        currency: currency, // Save the current invoice currency
      });
      setIsSaveItemDialogOpen(false);
      setItemToSave(null);
      // Refresh saved items list
      const items = await getSavedItems();
      setSavedItems(items);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!guest.name || !guest.name.trim()) {
      alert("Guest Name is required in Guest Information");
      return;
    }

    if (billingType === "company" && !selectedTravelCompanyId) {
      alert("Please select a Travel Company when billing to company");
      return;
    }
    
    try {
       const invoiceData = {
         invoiceNumber,
         guest,
         guests: additionalGuests.length > 0 ? additionalGuests : undefined, // Multiple guests
         billingType: billingType,
         travelCompanyId: billingType === "company" && selectedTravelCompanyId ? selectedTravelCompanyId : undefined,
         referenceNumber: billingType === "company" && referenceNumber ? referenceNumber : undefined,
         currency,
         checkIn,
         checkOut,
         roomType: "",
         adults: adults || undefined,
         children: children || undefined,
         babies: babies || undefined,
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
         selectedBankDetailId: selectedBankDetailId || undefined, // For backward compatibility
         selectedBankDetailIds: selectedBankDetailIds.length > 0 ? selectedBankDetailIds : undefined,
         checksPayableTo: paymentMethods.includes("cheque") ? checksPayableTo : undefined,
         status: "draft" as const,
         notes: notes || undefined,
       };

      // Import and use the createInvoice function
      const { createInvoice } = await import("@/lib/invoices");
      await createInvoice(invoiceData, {
        appliedDiscount: appliedDiscount && calculations.discount > 0
          ? { ...appliedDiscount, discountAmount: calculations.discount }
          : undefined,
      });
      
      alert("Invoice created successfully!");
      router.push("/invoices");
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Error creating invoice. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Invoice</h1>
          <p className="text-muted-foreground">Invoice #{invoiceNumber}</p>
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
                <Label htmlFor="billingType">Bill To *</Label>
                <Select
                  value={billingType}
                  onValueChange={(value: BillingType) => {
                    setBillingType(value);
                    if (value === "guest") {
                      setSelectedTravelCompanyId("");
                    }
                  }}
                >
                  <SelectTrigger id="billingType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="guest">Guest</SelectItem>
                    <SelectItem value="company">Travel Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {billingType === "company" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="selectTravelCompany">Select Travel Company *</Label>
                    <Select
                      value={selectedTravelCompanyId}
                      onValueChange={setSelectedTravelCompanyId}
                    >
                      <SelectTrigger id="selectTravelCompany">
                        <SelectValue placeholder="Select travel company" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTravelCompanies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {availableTravelCompanies.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        No travel companies found. <Link href="/settings/travel-companies" className="text-primary underline">Add one here</Link>.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referenceNumber">Reference Number</Label>
                    <Input
                      id="referenceNumber"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="Enter reference number"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="selectGuest">Guest Information {billingType === "company" && "(for display)"}</Label>
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

              {/* Additional Guests Section */}
              <div className="space-y-2">
                <Label>Additional Guests (Optional)</Label>
                <div className="flex gap-2">
                  <Select value={selectedAdditionalGuestId} onValueChange={setSelectedAdditionalGuestId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select additional guest" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableGuests
                        .filter(g => {
                          // Only include guests with IDs
                          if (!g.id) return false;
                          // Filter out primary guest if it has an id
                          if (selectedGuestId && g.id === selectedGuestId) {
                            return false;
                          }
                          // Filter out already added additional guests
                          if (additionalGuests.some(ag => ag.id === g.id)) {
                            return false;
                          }
                          // Include all other guests with IDs
                          return true;
                        })
                        .map((g) => (
                          <SelectItem key={g.id!} value={g.id!}>
                            {g.name} {g.email ? `- ${g.email}` : ""}
                          </SelectItem>
                        ))}
                      {availableGuests.filter(g => {
                        if (!g.id) return false;
                        if (selectedGuestId && g.id === selectedGuestId) return false;
                        if (additionalGuests.some(ag => ag.id === g.id)) return false;
                        return true;
                      }).length === 0 && (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                          No additional guests available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddAdditionalGuest}
                    disabled={!selectedAdditionalGuestId}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Dialog open={isQuickAddGuestDialogOpen} onOpenChange={setIsQuickAddGuestDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsQuickAddGuestDialogOpen(true)}
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Quick Add Guest</DialogTitle>
                        <DialogDescription>
                          Create a new guest and add them as an additional guest
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="quick-add-title">Title</Label>
                            <Select
                              value={quickAddGuest.title || "none"}
                              onValueChange={(value) =>
                                setQuickAddGuest({ ...quickAddGuest, title: value === "none" ? undefined : (value as Title) })
                              }
                            >
                              <SelectTrigger id="quick-add-title">
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
                            <Label htmlFor="quick-add-name">Full Name *</Label>
                            <Input
                              id="quick-add-name"
                              value={quickAddGuest.name || ""}
                              onChange={(e) =>
                                setQuickAddGuest({ ...quickAddGuest, name: e.target.value })
                              }
                              placeholder="Enter full name"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quick-add-birthday">Birthday</Label>
                          <Input
                            id="quick-add-birthday"
                            type="date"
                            value={quickAddGuest.birthday || ""}
                            onChange={(e) =>
                              setQuickAddGuest({ ...quickAddGuest, birthday: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quick-add-email">Email</Label>
                          <Input
                            id="quick-add-email"
                            type="email"
                            value={quickAddGuest.email || ""}
                            onChange={(e) =>
                              setQuickAddGuest({ ...quickAddGuest, email: e.target.value })
                            }
                            placeholder="Enter email address"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="quick-add-phone">Phone</Label>
                            <Input
                              id="quick-add-phone"
                              value={quickAddGuest.phone || ""}
                              onChange={(e) =>
                                setQuickAddGuest({ ...quickAddGuest, phone: e.target.value })
                              }
                              placeholder="Enter phone number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="quick-add-phone2">Phone 2</Label>
                            <Input
                              id="quick-add-phone2"
                              value={quickAddGuest.phone2 || ""}
                              onChange={(e) =>
                                setQuickAddGuest({ ...quickAddGuest, phone2: e.target.value })
                              }
                              placeholder="Enter phone number"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="quick-add-phone3">Phone 3</Label>
                            <Input
                              id="quick-add-phone3"
                              value={quickAddGuest.phone3 || ""}
                              onChange={(e) =>
                                setQuickAddGuest({ ...quickAddGuest, phone3: e.target.value })
                              }
                              placeholder="Enter phone number"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quick-add-address">Address</Label>
                          <Input
                            id="quick-add-address"
                            value={quickAddGuest.address || ""}
                            onChange={(e) =>
                              setQuickAddGuest({ ...quickAddGuest, address: e.target.value })
                            }
                            placeholder="Enter address"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="quick-add-city">City</Label>
                            <Input
                              id="quick-add-city"
                              value={quickAddGuest.city || ""}
                              onChange={(e) =>
                                setQuickAddGuest({ ...quickAddGuest, city: e.target.value })
                              }
                              placeholder="Enter city"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="quick-add-country">Country</Label>
                            <CountrySelector
                              id="quick-add-country"
                              value={quickAddGuest.country}
                              onValueChange={(value) =>
                                setQuickAddGuest({ ...quickAddGuest, country: value })
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quick-add-idNumber">ID or Passport Number</Label>
                          <Input
                            id="quick-add-idNumber"
                            value={quickAddGuest.idNumber || ""}
                            onChange={(e) =>
                              setQuickAddGuest({ ...quickAddGuest, idNumber: e.target.value })
                            }
                            placeholder="Enter ID or Passport number"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
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
                          }}
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
                
                {/* Display added additional guests */}
                {additionalGuests.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {additionalGuests.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md border"
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{g.name}</span>
                          {g.email && (
                            <span className="text-xs text-muted-foreground">({g.email})</span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAdditionalGuest(g.id!)}
                          className="h-6 w-6"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
               <Separator />
               <div className="grid grid-cols-3 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="adults">Adults (Optional)</Label>
                   <Input
                     id="adults"
                     type="number"
                     min="0"
                     value={adults || ""}
                     onChange={(e) => setAdults(e.target.value ? Number(e.target.value) : undefined)}
                     placeholder="0"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="children">Children (Optional)</Label>
                   <Input
                     id="children"
                     type="number"
                     min="0"
                     value={children || ""}
                     onChange={(e) => setChildren(e.target.value ? Number(e.target.value) : undefined)}
                     placeholder="0"
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="babies">Babies (Optional)</Label>
                   <Input
                     id="babies"
                     type="number"
                     min="0"
                     value={babies || ""}
                     onChange={(e) => setBabies(e.target.value ? Number(e.target.value) : undefined)}
                     placeholder="0"
                   />
                 </div>
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
                   value={selectedSavedItemId}
                   onValueChange={(value) => {
                     const selectedItem = savedItems.find(i => i.id === value);
                     if (selectedItem) {
                       addItemFromSaved(selectedItem);
                       setSavedItemsSearchTerm(""); // Reset search after selection
                       setSelectedSavedItemId(""); // Reset select to allow adding same item again
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
                  <TableHead className="w-48">Quantity/Days</TableHead>
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
                      <div className="flex gap-2">
                        <Select
                          value={item.quantityType || "quantity"}
                          onValueChange={(value: "quantity" | "days") =>
                            handleItemChange(item.id, "quantityType", value)
                          }
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quantity">Qty</SelectItem>
                            <SelectItem value="days">Days</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(item.id, "quantity", Number(e.target.value))
                          }
                          className="w-24"
                        />
                      </div>
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
                          onClick={() => duplicateItem(item)}
                          title="Duplicate this item"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
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
                <Label>Coupon Code</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      if (!couponCode.trim()) return;
                      try {
                        const lookup = await fetch("/api/coupon-codes/lookup", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ code: couponCode.trim() }),
                        });
                        const lookupData = await lookup.json();
                        if (!lookupData.success || !lookupData.coupon?.discount) {
                          alert(lookupData.error || "Invalid coupon code");
                          return;
                        }
                        const nights = checkIn && checkOut ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (24 * 60 * 60 * 1000))) : 0;
                        const validate = await fetch("/api/discounts/validate", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            discountId: lookupData.coupon.discountId,
                            couponCode: couponCode.trim(),
                            subtotal: calculations.subtotal,
                            currency,
                            checkIn: checkIn || new Date().toISOString().slice(0, 10),
                            checkOut: checkOut || new Date().toISOString().slice(0, 10),
                            nights,
                            roomTypes: [],
                            rateTypeIds: [],
                            guestId: guest?.id,
                          }),
                        });
                        const valData = await validate.json();
                        if (!valData.valid) {
                          alert(valData.error || "Coupon cannot be applied");
                          return;
                        }
                        setDiscount(valData.discountType === "percentage" ? valData.discountValue : valData.discountAmount);
                        setDiscountType(valData.discountType);
                        setAppliedDiscount({
                          discountId: lookupData.coupon.discountId,
                          couponCodeId: lookupData.coupon.id,
                          discountAmount: valData.discountAmount,
                          discountType: valData.discountType,
                          discountValueUsed: valData.discountValue,
                          guestId: guest?.id,
                        });
                      } catch (e) {
                        alert("Failed to apply coupon");
                      }
                    }}
                  >
                    Apply
                  </Button>
                  {appliedDiscount && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setCouponCode(""); setAppliedDiscount(null); setDiscount(0); setDiscountType("percentage"); }}>
                      Clear
                    </Button>
                  )}
                </div>
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
                        setSelectedBankDetailIds([]);
                      }
                    }}
                  />
                  <Label
                    htmlFor="payment-bank"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Building2 className="h-4 w-4" />
                    Bank Transfer/Deposit
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
                  <Label>Select Bank Transfer/Deposit Accounts</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddBankDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Bank Transfer/Deposit
                  </Button>
                </div>
                <div className="space-y-2">
                  {bankDetails.map((bank) => (
                    <div key={bank.id} className="flex items-start space-x-2 p-3 border rounded-lg">
                      <Checkbox
                        id={`bank-${bank.id}`}
                        checked={selectedBankDetailIds.includes(bank.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedBankDetailIds([...selectedBankDetailIds, bank.id]);
                          } else {
                            setSelectedBankDetailIds(selectedBankDetailIds.filter((id) => id !== bank.id));
                          }
                        }}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`bank-${bank.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {bank.bankName} - {bank.accountNumber}
                        </Label>
                        {selectedBankDetailIds.includes(bank.id) && (
                          <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="font-medium text-muted-foreground">Account Name:</span>
                              <p className="text-foreground">{bank.accountName}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Bank Name:</span>
                              <p className="text-foreground">{bank.bankName}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Branch:</span>
                              <p className="text-foreground">{bank.branch}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">Account Number:</span>
                              <p className="text-foreground">{bank.accountNumber}</p>
                            </div>
                            <div>
                              <span className="font-medium text-muted-foreground">SWIFT Code:</span>
                              <p className="text-foreground">{bank.swiftCode}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteBankConfirm(bank)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {bankDetails.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No bank accounts available. Click "Add Bank Transfer/Deposit" to create one.
                    </p>
                  )}
                </div>
              </div>
            )}

            {paymentMethods.includes("cheque") && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="checksPayableTo">Make Checks Payable To *</Label>
                  <Input
                    id="checksPayableTo"
                    value={checksPayableTo}
                    onChange={(e) => setChecksPayableTo(e.target.value)}
                    placeholder="Enter name to make checks payable to"
                    required={paymentMethods.includes("cheque")}
                  />
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/invoices">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit">Create Invoice</Button>
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

      <ConfirmDeleteDialog
        open={!!deleteBankConfirm}
        onOpenChange={(open) => !open && setDeleteBankConfirm(null)}
        title="Delete Bank Account"
        description="Are you sure you want to delete this bank transfer/deposit account? This cannot be undone."
        onConfirm={handleDeleteBankConfirm}
      />
    </div>
  );
}
