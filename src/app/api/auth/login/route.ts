import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/auth";
import {
  isRateLimited,
  recordAttempt,
  clearAttempts,
  getRetryAfterMs,
} from "@/lib/rate-limit";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

const GENERIC_AUTH_ERROR = "Invalid username or password";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    const retryMs = getRetryAfterMs(ip);
    return NextResponse.json(
      {
        success: false,
        error: "Too many failed attempts. Please try again later.",
        retryAfterSeconds: Math.ceil(retryMs / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(retryMs / 1000)),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    const result = await login({ username, password });

    if (result.success) {
      clearAttempts(ip);
      return NextResponse.json({ success: true, user: result.user });
    }

    recordAttempt(ip);
    return NextResponse.json(
      { success: false, error: result.error || GENERIC_AUTH_ERROR },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
