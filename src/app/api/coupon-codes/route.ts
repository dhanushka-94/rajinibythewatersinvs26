import { NextRequest, NextResponse } from "next/server";
import { getCouponCodes, createCouponCode } from "@/lib/coupon-codes";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const discountId = searchParams.get("discountId") || undefined;
    const couponCodes = await getCouponCodes(discountId);
    return NextResponse.json({ success: true, couponCodes });
  } catch (e) {
    console.error("Error fetching coupon codes:", e);
    return NextResponse.json({ success: false, error: "Failed to fetch coupon codes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!["admin", "super_admin"].includes(session.role))
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const body = await request.json();
    const couponCode = await createCouponCode(body);
    return NextResponse.json({ success: true, couponCode });
  } catch (e: unknown) {
    return NextResponse.json(
      { success: false, error: (e as Error).message || "Failed to create coupon code" },
      { status: 400 }
    );
  }
}
