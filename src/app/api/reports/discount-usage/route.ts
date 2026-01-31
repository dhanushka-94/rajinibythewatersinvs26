import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDiscountUsageReport } from "@/lib/reports";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const allowed = ["admin", "super_admin", "manager", "viewer"];
  if (!allowed.includes(session.role)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;

  const data = await getDiscountUsageReport({ startDate, endDate });
  return NextResponse.json({ success: true, rows: data });
}
