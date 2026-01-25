import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

/**
 * Serves the invoice email logo at /api/email-assets/logo.
 * Use this absolute URL in emails so the image loads from your app’s deployed URL
 * (e.g. https://rajinihotels.com/api/email-assets/logo when app is at rajinihotels.com).
 * Set EMAIL_IMAGE_BASE_URL to your app’s public URL.
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "images", "rajini-logo-flat-color.png");
    const buffer = readFileSync(filePath);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (e) {
    console.error("Email assets logo error:", e);
    return new NextResponse(null, { status: 404 });
  }
}
