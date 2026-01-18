export type Title = "Mr" | "Mrs" | "Miss" | "Ms" | "Dr" | "Prof" | "Rev" | "Sir" | "Madam";

export interface Guest {
  id?: string;
  title?: Title;
  name?: string;
  email?: string;
  phone?: string;
  phone2?: string;
  phone3?: string;
  address?: string;
  city?: string;
  country?: string;
  idNumber?: string;
  birthday?: string; // Date in YYYY-MM-DD format
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  quantityType?: "quantity" | "days"; // Whether quantity represents quantity or days
  unitPrice: number;
  total: number;
  currency?: Currency; // Currency when item was saved
}

export type Currency = "USD" | "LKR";
export type PaymentMethod = "bank_account" | "cheque" | "online" | "cash" | "card";

export interface Payment {
  id: string;
  amount: number;
  date: string;
  notes?: string;
  cardLast4Digits?: string; // Last 4 digits of card for card payment
  createdAt: string;
}

export type BillingType = "guest" | "company";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  guest: Guest; // Primary guest (for backward compatibility and billing)
  guests?: Guest[]; // Multiple guests (optional - for display only, shows names to save space)
  billingType?: BillingType; // "guest" or "company" - defaults to "guest" for backward compatibility
  travelCompanyId?: string; // ID of travel company when billingType is "company"
  currency: Currency;
  checkIn: string;
  checkOut: string;
  roomType?: string;
  adults?: number; // Optional: Number of adults
  children?: number; // Optional: Number of children
  babies?: number; // Optional: Number of babies
  items: InvoiceItem[];
  subtotal: number;
  serviceCharge: number;
  serviceChargeRate: number;
  damageCharge: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  discountType: "percentage" | "fixed";
  priceAdjustment: number;
  priceAdjustmentReason?: string;
  total: number;
  paymentMethods: PaymentMethod[];
  selectedBankDetailId?: string; // Deprecated: use selectedBankDetailIds instead
  selectedBankDetailIds?: string[]; // Array of bank detail IDs for multiple bank accounts
  checksPayableTo?: string;
  cardLast4Digits?: string; // Last 4 digits of card for card payment
  status: "draft" | "sent" | "pending" | "partially_paid" | "paid" | "cancelled";
  payments?: Payment[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomType {
  id: string;
  name: string;
  basePrice: number;
}
