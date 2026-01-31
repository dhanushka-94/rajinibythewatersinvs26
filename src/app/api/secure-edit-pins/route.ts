import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createActivityLog } from "@/lib/activity-logs";
import { getUserById } from "@/lib/users";
import {
  getSecureEditPinsWithUsers,
  upsertSecureEditPin,
} from "@/lib/secure-edit-pins";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const pins = await getSecureEditPinsWithUsers();
    return NextResponse.json({ success: true, pins });
  } catch (error) {
    console.error("Error fetching secure edit pins:", error);
    return NextResponse.json(
      { error: "Failed to fetch secure edit pins" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const userId = body?.userId;
    const pin = body?.pin;

    if (!userId || typeof pin !== "string") {
      return NextResponse.json(
        { error: "userId and pin are required" },
        { status: 400 }
      );
    }

    await upsertSecureEditPin(userId, pin);
    const targetUser = await getUserById(userId);
    await createActivityLog(
      "settings_updated",
      "secure_edit_pin",
      `Assigned secure edit PIN to ${targetUser?.fullName || userId}`,
      { entityId: userId, entityName: targetUser?.username, metadata: { action: "pin_assigned" } }
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error creating/updating secure edit PIN:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save PIN" },
      { status: 400 }
    );
  }
}
