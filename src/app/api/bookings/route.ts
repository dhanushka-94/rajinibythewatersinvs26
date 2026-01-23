"use server";

import { NextRequest, NextResponse } from "next/server";
import { getBookings, createBooking } from "@/lib/bookings";
import { getSession } from "@/lib/auth";
import { Booking } from "@/types/booking";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await getBookings();
    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission to create bookings
    if (!["admin", "manager", "staff"].includes(session.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      guest,
      guests,
      checkIn,
      checkOut,
      roomType,
      adults,
      children,
      babies,
      status,
      items,
      notes,
      guestId,
    } = body;

    // Validate required fields
    if (!guest || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Guest, check-in, and check-out are required" },
        { status: 400 }
      );
    }

    const booking = await createBooking({
      guestId,
      guest,
      guests,
      checkIn,
      checkOut,
      roomType,
      adults,
      children,
      babies,
      status: status || "booked",
      items,
      notes,
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
