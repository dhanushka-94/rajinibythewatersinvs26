import { NextRequest, NextResponse } from "next/server";
import { getDiscounts, createDiscount } from "@/lib/discounts";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const roles = ["admin", "super_admin", "manager", "staff", "viewer"];
    if (!roles.includes(session.role))
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";
    const offerId = searchParams.get("offerId") || undefined;
    const discounts = await getDiscounts({ includeInactive, offerId });
    return NextResponse.json({ success: true, discounts });
  } catch (e) {
    console.error("Error fetching discounts:", e);
    return NextResponse.json({ success: false, error: "Failed to fetch discounts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!["admin", "super_admin"].includes(session.role))
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const body = await request.json();
    const discount = await createDiscount(body);
    return NextResponse.json({ success: true, discount });
  } catch (e: unknown) {
    return NextResponse.json(
      { success: false, error: (e as Error).message || "Failed to create discount" },
      { status: 400 }
    );
  }
}
