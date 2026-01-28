import { NextRequest, NextResponse } from "next/server";
import { hasPermission } from "@/lib/auth";
import { getActivityLogs, getActivityLogsCount } from "@/lib/activity-logs";

const EMAIL_ACTIVITY_TYPES = ["invoice_sent", "test_email_sent"] as const;

/**
 * GET /api/email-logs
 * Admin only. Returns activity logs for invoice_sent and test_email_sent.
 */
export async function GET(request: NextRequest) {
  try {
    const ok = await hasPermission("admin");
    if (!ok) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const search = searchParams.get("search") || undefined;

    const [logs, total] = await Promise.all([
      getActivityLogs({
        activityTypes: [...EMAIL_ACTIVITY_TYPES],
        limit,
        offset,
        ...(search && { search }),
      }),
      getActivityLogsCount({
        activityTypes: [...EMAIL_ACTIVITY_TYPES],
        ...(search && { search }),
      }),
    ]);

    return NextResponse.json({
      logs,
      total,
    });
  } catch (e) {
    console.error("Email logs API error:", e);
    return NextResponse.json(
      { error: "Failed to fetch email logs" },
      { status: 500 }
    );
  }
}
