"use server";

import { NextRequest, NextResponse } from "next/server";
import { getRoomById, updateRoom, deleteRoom } from "@/lib/rooms";
import { getSession } from "@/lib/auth";
import { RoomUpdate } from "@/types/room";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const room = await getRoomById(id);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, room });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
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

    if (!["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const roomData: RoomUpdate = {};
    if (body.roomNumber !== undefined) roomData.roomNumber = String(body.roomNumber).trim();
    if (body.roomType !== undefined) roomData.roomType = String(body.roomType).trim();
    if (body.ratePerNight !== undefined) roomData.ratePerNight = Number(body.ratePerNight) || 0;
    if (body.currency !== undefined) roomData.currency = body.currency || "USD";
    if (body.capacity !== undefined) roomData.capacity = Number(body.capacity) ?? 2;
    if (body.status !== undefined) roomData.status = body.status || "available";
    if (body.floor !== undefined) roomData.floor = body.floor ? String(body.floor).trim() : undefined;
    if (body.notes !== undefined) roomData.notes = body.notes ? String(body.notes).trim() : undefined;

    await updateRoom(id, roomData);

    if (Array.isArray(body.rates) && body.rates.length > 0) {
      const { upsertRoomRates } = await import("@/lib/room-rates");
      const validRates = body.rates
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
      await upsertRoomRates(id, validRates);
    }
    const room = await getRoomById(id);
    return NextResponse.json({ success: true, room });
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update room" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    await deleteRoom(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete room" },
      { status: 500 }
    );
  }
}
