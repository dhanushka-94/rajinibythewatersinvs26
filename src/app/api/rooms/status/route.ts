import { NextResponse } from "next/server";
import { getRoomsWithStatus } from "@/lib/room-status";

export async function GET() {
  try {
    const rooms = await getRoomsWithStatus();
    return NextResponse.json({ success: true, rooms });
  } catch (error) {
    console.error("Error fetching room status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch room status" },
      { status: 500 }
    );
  }
}
