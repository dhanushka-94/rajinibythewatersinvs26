import { NextRequest, NextResponse } from "next/server";
import { validateDiscount } from "@/lib/validate-discount";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const result = await validateDiscount(body);
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    console.error("Validate discount error:", e);
    return NextResponse.json(
      { success: false, valid: false, error: "Validation failed" },
      { status: 500 }
    );
  }
}
