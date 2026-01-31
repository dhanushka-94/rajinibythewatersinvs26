import { NextRequest, NextResponse } from "next/server";
import { getOfferById, updateOffer, deleteOffer } from "@/lib/offers";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const offer = await getOfferById(id);
    if (!offer) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, offer });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Failed to fetch offer" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!["admin", "super_admin"].includes(session.role))
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    const body = await request.json();
    await updateOffer(id, body);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { success: false, error: (e as Error).message || "Failed to update offer" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (session.role !== "super_admin")
      return NextResponse.json({ success: false, error: "Only Super Admin can delete offers" }, { status: 403 });
    const { id } = await params;
    await deleteOffer(id);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { success: false, error: (e as Error).message || "Failed to delete offer" },
      { status: 400 }
    );
  }
}
