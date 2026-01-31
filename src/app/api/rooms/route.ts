"use server";

import { NextRequest, NextResponse } from "next/server";
import { getRooms, createRoom } from "@/lib/rooms";
import { getSession } from "@/lib/auth";
import { RoomCreate } from "@/types/room";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rooms = await getRooms();
    return NextResponse.json({ success: true, rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
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

    if (!["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      roomNumber,
      roomType,
      ratePerNight,
      rates,
      currency,
      capacity,
      status,
      floor,
      notes,
    } = body;

    if (!roomNumber || !roomType) {
      return NextResponse.json(
        { error: "Room number and room type are required" },
        { status: 400 }
      );
    }

    // Use rates if provided, else legacy ratePerNight
    const ratesList = Array.isArray(rates) ? rates : [];
    const hasRates = ratesList.some(
      (r: unknown) => r && typeof r === "object" && "rateTypeId" in r && "ratePerNight" in r
    );
    let rateVal = Number(ratePerNight) || 0;
    if (hasRates) {
      const nums = ratesList
        .map((r: { ratePerNight?: number }) => Number((r as { ratePerNight?: number }).ratePerNight) || 0)
        .filter((n: number) => n > 0);
      rateVal = nums.length > 0 ? Math.min(...nums) : 0;
    }

    const roomData: RoomCreate = {
      roomNumber: String(roomNumber).trim(),
      roomType: String(roomType).trim(),
      ratePerNight: rateVal,
      currency: currency || "USD",
      capacity: capacity != null ? Number(capacity) : 2,
      status: status || "available",
      floor: floor ? String(floor).trim() : undefined,
      notes: notes ? String(notes).trim() : undefined,
    };

    const room = await createRoom(roomData);

    if (hasRates) {
      const { upsertRoomRates } = await import("@/lib/room-rates");
      const validRates = ratesList
        .filter(
          (r: unknown) =>
            r &&
            typeof r === "object" &&
            "rateTypeId" in r &&
            typeof (r as { rateTypeId: string }).rateTypeId === "string"
        )
        .map((r: { rateTypeId: string; ratePerNight: number; currency?: string }) => ({
          rateTypeId: (r as { rateTypeId: string }).rateTypeId,
          ratePerNight: Number((r as { ratePerNight: number }).ratePerNight) || 0,
          currency: (r as { currency?: string }).currency || "USD",
        }));
      await upsertRoomRates(room.id, validRates);
    }

    return NextResponse.json({ success: true, room });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create room" },
      { status: 500 }
    );
  }
}
