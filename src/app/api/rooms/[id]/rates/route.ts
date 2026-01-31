"use server";

import { NextRequest, NextResponse } from "next/server";
import { getRoomRates } from "@/lib/room-rates";
import { upsertRoomRates } from "@/lib/room-rates";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const rates = await getRoomRates(id);
    return NextResponse.json({ success: true, rates });
  } catch (error) {
    console.error("Error fetching room rates:", error);
    return NextResponse.json(
      { error: "Failed to fetch room rates" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["admin", "super_admin"].includes(session.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const rates = Array.isArray(body.rates) ? body.rates : [];

    const validRates = rates
      .filter(
        (r: unknown) =>
          r &&
          typeof r === "object" &&
          "rateTypeId" in r &&
          typeof (r as { rateTypeId: string }).rateTypeId === "string" &&
          "ratePerNight" in r
      )
      .map((r: { rateTypeId: string; ratePerNight: number; currency?: string }) => ({
        rateTypeId: r.rateTypeId,
        ratePerNight: Number(r.ratePerNight) || 0,
        currency: r.currency || "USD",
      }));

    await upsertRoomRates(id, validRates);
    const updated = await getRoomRates(id);
    return NextResponse.json({ success: true, rates: updated });
  } catch (error) {
    console.error("Error updating room rates:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update room rates",
      },
      { status: 500 }
    );
  }
}
