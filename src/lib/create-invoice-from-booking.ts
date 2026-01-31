import { Booking } from "@/types/booking";
import { Invoice, InvoiceItem, Currency } from "@/types/invoice";
import { createInvoice } from "./invoices";
import { generateInvoiceNumber, calculateInvoiceTotal } from "./data";
import { getBookingRooms } from "./booking-rooms";
import { getRoomById } from "./rooms";
import { getRoomRate } from "./room-rates";

/**
 * Creates an invoice from a booking when checking out
 * @param booking The booking to create an invoice from
 * @param currency The currency for the invoice (defaults to USD)
 * @returns The created invoice
 */
export async function createInvoiceFromBooking(
  booking: Booking,
  currency: Currency = "USD"
): Promise<Invoice> {
  // Use booking items if available, otherwise create a default item
  let items: InvoiceItem[] = [];
  
  if (booking.items && booking.items.length > 0) {
    // Use booking items, ensuring they have proper IDs
    items = booking.items.map((item, index) => ({
      ...item,
      id: item.id || `item-${Date.now()}-${index}`,
    }));
  } else {
    // Create default items based on rooms and stay duration
    const checkInDate = new Date(booking.checkIn);
    const checkOutDate = new Date(booking.checkOut);
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get rooms with rate info: booking.rooms, or build from roomAssignments, or fetch from DB
    let rooms = booking.rooms ?? [];
    if (rooms.length === 0 && (booking.roomIds?.length || booking.roomAssignments?.length)) {
      if (booking.roomAssignments?.length) {
        // Use roomAssignments (e.g. from pending update during checkout) - get rate per type
        const withRates = await Promise.all(
          booking.roomAssignments.map(async (a) => {
            const room = await getRoomById(a.roomId);
            if (!room) return null;
            let ratePerNight = room.ratePerNight;
            let currency = room.currency;
            if (a.rateTypeId) {
              const rr = await getRoomRate(a.roomId, a.rateTypeId);
              if (rr) {
                ratePerNight = rr.ratePerNight;
                currency = rr.currency;
              }
            }
            return { ...room, ratePerNight, currency };
          })
        );
        rooms = withRates.filter((r): r is NonNullable<typeof r> => r != null);
      } else if (booking.id && booking.roomIds?.length) {
        rooms = await getBookingRooms(booking.id);
      }
    }

    if (rooms.length > 0) {
      items = rooms.map((room, i) => {
        const ratePerNight = (room as { ratePerNight?: number }).ratePerNight ?? room.ratePerNight;
        const roomCurrency = (room as { currency?: string }).currency ?? room.currency;
        return {
          id: `item-${Date.now()}-${i}`,
          description: `${room.roomNumber} - ${room.roomType} - ${nights} night${nights !== 1 ? "s" : ""}`,
          quantity: nights,
          quantityType: "days" as const,
          unitPrice: ratePerNight,
          total: ratePerNight * nights,
          currency: roomCurrency,
        };
      });
    } else {
      // No rooms: fallback to roomType or "Accommodation"
      const roomDescription = booking.roomType
        ? `${booking.roomType} - ${nights} night${nights !== 1 ? "s" : ""}`
        : `Accommodation - ${nights} night${nights !== 1 ? "s" : ""}`;
      items = [
        {
          id: `item-${Date.now()}`,
          description: roomDescription,
          quantity: nights,
          quantityType: "days" as const,
          unitPrice: 100,
          total: 100 * nights,
          currency,
        },
      ];
    }
  }

  // Default rates (can be customized)
  const serviceChargeRate = 10; // 10%
  const taxRate = 10; // 10%
  const discount = 0;
  const discountType: "percentage" | "fixed" = "percentage";
  const damageCharge = 0;
  const priceAdjustment = 0;

  // Calculate totals
  const calculations = calculateInvoiceTotal(
    items,
    taxRate,
    discount,
    discountType,
    serviceChargeRate,
    damageCharge,
    priceAdjustment
  );

  // Create invoice data
  const invoiceData: Omit<Invoice, "id" | "createdAt" | "updatedAt"> = {
    invoiceNumber: generateInvoiceNumber(),
    guest: booking.guest,
    guests: booking.guests && booking.guests.length > 0 ? booking.guests : undefined,
    billingType: "guest", // Default to guest billing
    currency,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    roomType: booking.roomType,
    adults: booking.adults,
    children: booking.children,
    babies: booking.babies,
    items,
    subtotal: calculations.subtotal,
    serviceCharge: calculations.serviceCharge,
    serviceChargeRate,
    damageCharge: calculations.damageCharge,
    taxRate,
    taxAmount: calculations.taxAmount,
    discount: calculations.discount,
    discountType,
    priceAdjustment: calculations.priceAdjustment,
    total: calculations.total,
    paymentMethods: ["bank_account"], // Default payment method
    status: "draft", // Start as draft so it can be reviewed
    notes: booking.notes || `Invoice generated from booking ${booking.bookingNumber}`,
  };

  // Create the invoice
  const invoice = await createInvoice(invoiceData);
  
  return invoice;
}
