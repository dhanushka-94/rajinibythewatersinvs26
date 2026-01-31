import { NextResponse } from "next/server";
import { getHotelInfo } from "@/lib/hotel-info";

export async function GET() {
  try {
    const info = await getHotelInfo();
    return NextResponse.json(info);
  } catch (error) {
    console.error("Hotel info API error:", error);
    return NextResponse.json(
      {
        name: "Rajini by The Waters",
        website: "www.rajinihotels.com",
        logoPath: "/images/rajini-logo-flat-color.png",
      },
      { status: 200 }
    );
  }
}
