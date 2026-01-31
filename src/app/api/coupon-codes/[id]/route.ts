import { NextRequest, NextResponse } from "next/server";
import { getCouponCodeById, deleteCouponCode } from "@/lib/coupon-codes";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const couponCode = await getCouponCodeById(id);
    if (!couponCode) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, couponCode });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Failed to fetch coupon code" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!["admin", "super_admin"].includes(session.role))
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    await deleteCouponCode(id);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { success: false, error: (e as Error).message || "Failed to delete coupon code" },
      { status: 400 }
    );
  }
}
