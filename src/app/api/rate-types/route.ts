"use server";

import { NextResponse } from "next/server";
import { getRateTypes } from "@/lib/rate-types";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateTypes = await getRateTypes();
    return NextResponse.json({ success: true, rateTypes });
  } catch (error) {
    console.error("Error fetching rate types:", error);
    return NextResponse.json(
      { error: "Failed to fetch rate types" },
      { status: 500 }
    );
  }
}
