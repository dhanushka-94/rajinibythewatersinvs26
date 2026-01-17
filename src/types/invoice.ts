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
  unitPrice: number;
  total: number;
  currency?: Currency; // Currency when item was saved
}

export type Currency = "USD" | "LKR";
export type PaymentMethod = "bank_account" | "cheque" | "offline" | "online" | "cash" | "card";

export interface Payment {
  id: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  guest: Guest;
  currency: Currency;
  checkIn: string;
  checkOut: string;
  roomType?: string;
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
  selectedBankDetailId?: string;
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
