import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  isEmailConfigured,
  isResendConfigured,
  isSmtpConfigured,
} from "@/lib/email";

/**
 * GET /api/email-config
 * Returns whether email is configured and which method (Resend vs SMTP).
 * No secrets exposed. Use to debug "Email is not configured" errors.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const configured = isEmailConfigured();
    const method = isResendConfigured()
      ? "resend"
      : isSmtpConfigured()
        ? "smtp"
        : null;

    let hint: string | undefined;
    if (!configured) {
      const isVercel = Boolean(process.env.VERCEL);
      hint = isVercel
        ? "Add RESEND_API_KEY in Vercel → Project → Settings → Environment Variables, then redeploy."
        : "Add RESEND_API_KEY to .env.local (or SMTP_USER + SMTP_PASSWORD), then restart the dev server.";
    }

    return NextResponse.json({
      configured,
      method,
      hint,
    });
  } catch (e) {
    console.error("Email config check error:", e);
    return NextResponse.json(
      { error: "Failed to check email config" },
      { status: 500 }
    );
  }
}
