import { NextRequest, NextResponse } from "next/server";
import { getOffers, createOffer } from "@/lib/offers";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const roles = ["admin", "super_admin", "manager"];
    if (!roles.includes(session.role))
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const offers = await getOffers();
    return NextResponse.json({ success: true, offers });
  } catch (e) {
    console.error("Error fetching offers:", e);
    return NextResponse.json({ success: false, error: "Failed to fetch offers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!["admin", "super_admin"].includes(session.role))
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const body = await request.json();
    const offer = await createOffer(body);
    return NextResponse.json({ success: true, offer });
  } catch (e: unknown) {
    return NextResponse.json(
      { success: false, error: (e as Error).message || "Failed to create offer" },
      { status: 400 }
    );
  }
}
