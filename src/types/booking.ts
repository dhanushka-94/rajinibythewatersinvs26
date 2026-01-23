import { Guest, InvoiceItem } from "./invoice";

export type BookingStatus = "booked" | "confirmed" | "checked_in" | "checked_out" | "cancelled";

export interface Booking {
  id: string;
  bookingNumber: string;
  guestId?: string; // Reference to guests table (optional)
  guest: Guest; // Primary guest information
  guests?: Guest[]; // Additional guests array (optional)
  checkIn: string; // Date in YYYY-MM-DD format
  checkOut: string; // Date in YYYY-MM-DD format
  roomType?: string;
  adults?: number;
  children?: number;
  babies?: number;
  status: BookingStatus;
  items?: InvoiceItem[]; // Invoice items for the booking
  invoiceId?: string; // Link to invoice if created
  notes?: string;
  // Status change timestamps
  bookedAt?: string;
  confirmedAt?: string;
  checkedInAt?: string;
  checkedOutAt?: string;
  cancelledAt?: string;
  // Early check-in and late checkout
  earlyCheckIn?: boolean;
  earlyCheckInTime?: string; // Time in HH:MM format
  earlyCheckInNotes?: string;
  lateCheckOut?: boolean;
  lateCheckOutTime?: string; // Time in HH:MM format
  lateCheckOutNotes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}
