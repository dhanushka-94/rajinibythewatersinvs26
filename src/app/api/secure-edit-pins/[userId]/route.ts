import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createActivityLog } from "@/lib/activity-logs";
import { getUserById } from "@/lib/users";
import {
  upsertSecureEditPin,
  deleteSecureEditPin,
} from "@/lib/secure-edit-pins";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { userId } = await params;
    const body = await request.json();
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
      `Changed secure edit PIN for ${targetUser?.fullName || userId}`,
      { entityId: userId, entityName: targetUser?.username, metadata: { action: "pin_changed" } }
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating secure edit PIN:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update PIN" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { userId } = await params;
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const targetUser = await getUserById(userId);
    await deleteSecureEditPin(userId);
    await createActivityLog(
      "settings_updated",
      "secure_edit_pin",
      `Removed secure edit PIN from ${targetUser?.fullName || userId}`,
      { entityId: userId, entityName: targetUser?.username, metadata: { action: "pin_removed" } }
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting secure edit PIN:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete PIN" },
      { status: 400 }
    );
  }
}
