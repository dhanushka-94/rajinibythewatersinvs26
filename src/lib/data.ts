import { Invoice, RoomType, Currency } from "@/types/invoice";

// Mock data - In production, this would come from an API/database
export const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2024-001",
    currency: "USD",
    guest: {
      id: "g1",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      address: "123 Main St",
      city: "New York",
      country: "USA",
    },
    checkIn: "2024-01-15",
    checkOut: "2024-01-18",
    roomType: "Deluxe Suite",
    items: [
      {
        id: "i1",
        description: "Deluxe Suite - 3 nights",
        quantity: 3,
        unitPrice: 150,
        total: 450,
      },
      {
        id: "i2",
        description: "Room Service",
        quantity: 1,
        unitPrice: 45,
        total: 45,
      },
      {
        id: "i3",
        description: "Laundry Service",
        quantity: 1,
        unitPrice: 25,
        total: 25,
      },
    ],
    subtotal: 520,
    serviceCharge: 52,
    serviceChargeRate: 10,
    damageCharge: 0,
    taxRate: 10,
    taxAmount: 57.2,
    discount: 0,
    discountType: "percentage",
    priceAdjustment: 0,
    total: 629.2,
    paymentMethods: ["bank_account"],
    selectedBankDetailId: "bank-1",
    checksPayableTo: "PHOENIX GLOBAL SOLUTIONS",
    status: "paid",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-18T12:00:00Z",
  },
  {
    id: "2",
    invoiceNumber: "INV-2024-002",
    currency: "LKR",
    guest: {
      id: "g2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1987654321",
      address: "456 Oak Ave",
      city: "Los Angeles",
      country: "USA",
    },
    checkIn: "2024-01-20",
    checkOut: "2024-01-22",
    roomType: "Standard Room",
    items: [
      {
        id: "i4",
        description: "Standard Room - 2 nights",
        quantity: 2,
        unitPrice: 100,
        total: 200,
      },
    ],
    subtotal: 200,
    serviceCharge: 20,
    serviceChargeRate: 10,
    damageCharge: 50,
    taxRate: 10,
    taxAmount: 27,
    discount: 10,
    discountType: "percentage",
    priceAdjustment: -10,
    total: 287,
    paymentMethods: ["cheque"],
    checksPayableTo: "PHOENIX GLOBAL SOLUTIONS",
    status: "pending",
    createdAt: "2024-01-20T14:00:00Z",
    updatedAt: "2024-01-20T14:00:00Z",
  },
];

export const roomTypes: RoomType[] = [
  { id: "standard", name: "Standard Room", basePrice: 100 },
  { id: "deluxe", name: "Deluxe Suite", basePrice: 150 },
  { id: "executive", name: "Executive Suite", basePrice: 200 },
  { id: "presidential", name: "Presidential Suite", basePrice: 500 },
];

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  // Generate a random alphanumeric code (6 characters) that's hard to guess
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded similar-looking chars (0, O, I, 1)
  let randomCode = '';
  for (let i = 0; i < 6; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `INV-${year}-${randomCode}`;
}

export function calculateInvoiceTotal(
  items: Invoice["items"],
  taxRate: number,
  discount: number,
  discountType: "percentage" | "fixed",
  serviceChargeRate: number,
  damageCharge: number,
  priceAdjustment: number
): {
  subtotal: number;
  serviceCharge: number;
  damageCharge: number;
  taxAmount: number;
  discount: number;
  priceAdjustment: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate service charge
  const serviceCharge = (subtotal * serviceChargeRate) / 100;
  const subtotalWithService = subtotal + serviceCharge;
  
  // Calculate discount
  const discountAmount = discountType === "percentage" 
    ? (subtotalWithService * discount) / 100 
    : discount;
  const subtotalAfterDiscount = subtotalWithService - discountAmount;
  
  // Add damage charge
  const subtotalWithDamage = subtotalAfterDiscount + damageCharge;
  
  // Calculate tax on subtotal after discounts and charges
  const taxAmount = (subtotalWithDamage * taxRate) / 100;
  
  // Apply price adjustment
  const finalSubtotal = subtotalWithDamage + taxAmount;
  const total = finalSubtotal + priceAdjustment;

  return {
    subtotal,
    serviceCharge,
    damageCharge,
    taxAmount,
    discount: discountAmount,
    priceAdjustment,
    total,
  };
}
