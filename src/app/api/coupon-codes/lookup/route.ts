import { NextRequest, NextResponse } from "next/server";
import { findCouponByCode } from "@/lib/coupon-codes";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const code = body?.code as string;
    if (!code?.trim()) return NextResponse.json({ success: false, error: "Code is required" }, { status: 400 });
    const coupon = await findCouponByCode(code);
    if (!coupon) return NextResponse.json({ success: false, error: "Invalid coupon code" }, { status: 404 });
    return NextResponse.json({ success: true, coupon });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Failed to lookup coupon" }, { status: 500 });
  }
}
