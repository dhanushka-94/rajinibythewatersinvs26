"use server";

import { NextRequest, NextResponse } from "next/server";
import {
  getBookingById,
  updateBooking,
  deleteBooking,
} from "@/lib/bookings";
import { getSession } from "@/lib/auth";
import { createInvoiceFromBooking } from "@/lib/create-invoice-from-booking";
import { createActivityLog } from "@/lib/activity-logs";
import { verifySecureEditPin, isSecureEditConfigured } from "@/lib/verify-secure-edit";
import { Booking } from "@/types/booking";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const booking = await getBookingById(id);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Error fetching booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to update bookings
    if (!["admin", "manager", "staff"].includes(session.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    
    // Get current booking to check if status is changing to checked_out
    const currentBooking = await getBookingById(id);
    if (!currentBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Checked-out bookings: require PIN + note to edit. Only PIN owner can edit.
    if (currentBooking.status === "checked_out") {
      const configured = await isSecureEditConfigured(session.userId);
      if (!configured) {
        return NextResponse.json(
          { error: "You do not have a secure edit PIN. Ask an admin to assign one." },
          { status: 403 }
        );
      }
      const pin = typeof body.secureEditPin === "string" ? body.secureEditPin.trim() : "";
      const reason = typeof body.editReason === "string" ? body.editReason.trim() : "";
      if (!pin || !reason) {
        return NextResponse.json(
          { error: "PIN and edit reason are required to edit a checked-out booking." },
          { status: 400 }
        );
      }
      const valid = await verifySecureEditPin(session.userId, pin);
      if (!valid) {
        return NextResponse.json(
          { error: "Invalid PIN. Cannot edit checked-out booking." },
          { status: 403 }
        );
      }
      // Store for logging after update; remove from body so we don't persist to DB
      (body as any)._secureEditReason = reason;
    }
    
    const isChangingToCheckedOut = 
      body.status === "checked_out" && 
      currentBooking.status !== "checked_out";
    
    // Filter out undefined values and invalid UUID strings to prevent UUID errors
    // Only include fields that are explicitly provided and valid
    const secureEditReason = (body as any)._secureEditReason;
    const filteredBody: any = {};
    Object.keys(body).forEach((key) => {
      if (key === "secureEditPin" || key === "editReason" || key === "_secureEditReason") return;
      const value = body[key];
      
      // Skip if value is undefined or the string "undefined"
      if (value === undefined || value === 'undefined') {
        return;
      }
      
      // For UUID fields, validate them (roomIds is array, handled separately)
      if ((key === 'guestId' || key === 'invoiceId') && value !== null) {
        // Check if it's a valid UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (typeof value === 'string' && uuidRegex.test(value)) {
          filteredBody[key] = value;
        } else if (value === null) {
          filteredBody[key] = null;
        }
        // Skip invalid UUID strings
        return;
      }
      
      // For other fields, include if not null or if explicitly null
      if (value !== null || body[key] === null) {
        filteredBody[key] = value;
      }
    });
    
    // If changing to checked_out and no invoice exists, create one
    // We need to merge the updated booking data (including items) for invoice creation
    if (isChangingToCheckedOut && !currentBooking.invoiceId) {
      try {
        // Create updated booking object with new data for invoice creation
        const updatedBookingForInvoice: Booking = {
          ...currentBooking,
          ...filteredBody,
          items: filteredBody.items !== undefined ? filteredBody.items : currentBooking.items,
        };
        
        const invoice = await createInvoiceFromBooking(updatedBookingForInvoice);
        // Add invoiceId to the update
        filteredBody.invoiceId = invoice.id;
      } catch (error) {
        console.error("Error creating invoice from booking:", error);
        // Continue with the update even if invoice creation fails
        // The user can create the invoice manually later
      }
    }
    
    await updateBooking(id, filteredBody);

    const updatedBooking = await getBookingById(id);

    // Log secure edit if it was a checked-out booking
    if (secureEditReason && currentBooking.status === "checked_out") {
      await createActivityLog(
        "booking_updated",
        "booking",
        `Updated checked-out booking ${updatedBooking?.bookingNumber || id} (reason: ${secureEditReason})`,
        {
          entityId: id,
          entityName: updatedBooking?.bookingNumber,
          metadata: { secureEdit: true, editReason: secureEditReason },
        }
      );
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error("Error updating booking:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update booking";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to delete bookings
    if (!["admin", "manager", "super_admin"].includes(session.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const bookingToDelete = await getBookingById(id);
    if (bookingToDelete?.status === "checked_out") {
      // Only super_admin can delete checked_out bookings
      if (session.role !== "super_admin") {
        return NextResponse.json(
          { error: "Cannot delete checked-out bookings. Super Admin only." },
          { status: 403 }
        );
      }
    }

    await deleteBooking(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete booking";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
