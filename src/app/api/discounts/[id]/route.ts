import { NextRequest, NextResponse } from "next/server";
import { getDiscountById, updateDiscount, deleteDiscount } from "@/lib/discounts";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const discount = await getDiscountById(id);
    if (!discount) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, discount });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Failed to fetch discount" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (!["admin", "super_admin", "manager"].includes(session.role))
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    const body = await request.json();
    if (session.role === "manager" && Object.keys(body).some((k) => !["status"].includes(k)))
      return NextResponse.json({ success: false, error: "Manager can only change status" }, { status: 403 });
    await updateDiscount(id, body);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { success: false, error: (e as Error).message || "Failed to update discount" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    if (session.role !== "super_admin")
      return NextResponse.json({ success: false, error: "Only Super Admin can delete discounts" }, { status: 403 });
    const { id } = await params;
    await deleteDiscount(id);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { success: false, error: (e as Error).message || "Failed to delete discount" },
      { status: 400 }
    );
  }
}
