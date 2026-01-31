import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { verifySecureEditPin, isSecureEditConfigured } from "@/lib/verify-secure-edit";

/**
 * POST: Verify current user's secure edit PIN (owner-only).
 * Returns { valid: boolean, configured: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["admin", "super_admin", "manager", "staff"].includes(session.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const configured = await isSecureEditConfigured(session.userId);
    if (!configured) {
      return NextResponse.json({
        valid: false,
        configured: false,
        error: "You do not have a secure edit PIN. Ask an admin to assign one.",
      });
    }

    const body = await request.json();
    const pin = typeof body?.pin === "string" ? body.pin : "";

    if (!pin) {
      return NextResponse.json({ valid: false, configured: true });
    }

    const valid = await verifySecureEditPin(session.userId, pin);
    return NextResponse.json({ valid, configured: true });
  } catch (error) {
    console.error("Verify secure edit error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
