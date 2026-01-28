import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { formatDateTimeSL } from "@/lib/date-sl";
import { sendEmail, getSenderAddress } from "@/lib/email";
import { createActivityLog } from "@/lib/activity-logs";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { recipientEmail } = body;

    if (!recipientEmail) {
      return NextResponse.json(
        { success: false, error: "Recipient email is required" },
        { status: 400 }
      );
    }

    const { getHotelInfo } = await import("@/lib/hotel-info");
    const hotelInfo = await getHotelInfo();
    const { fromEmail, fromName } = getSenderAddress(
      hotelInfo.email,
      hotelInfo.name || "Invoice System"
    );

    const testEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test Email</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
    <h2 style="color: #111827; margin-bottom: 20px;">Email Test - SMTP Configuration</h2>
    <p style="color: #374151; line-height: 1.6;">
      This is a test email to verify that your SMTP configuration (e.g. your own domain email) is working correctly.
    </p>
    <div style="margin-top: 30px; padding: 15px; background-color: #f3f4f6; border-radius: 4px;">
      <p style="margin: 0; font-size: 12px; color: #6b7280;">
        <strong>From:</strong> ${fromName} &lt;${fromEmail}&gt;<br>
        <strong>To:</strong> ${recipientEmail}<br>
        <strong>Time:</strong> ${formatDateTimeSL(new Date())} (Sri Lanka)
      </p>
    </div>
    <p style="color: #374151; margin-top: 20px;">
      If you received this email, your SMTP configuration is working correctly! ✅
    </p>
    <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
      ${hotelInfo.name} - Invoice Management System
    </p>
  </div>
</body>
</html>
    `;

    const replyTo = process.env.SMTP_REPLY_TO || "bookings@rajinihotels.com";
    const subject = `Test Email - ${hotelInfo.name} Invoice System`;
    const emailResult = await sendEmail({
      to: recipientEmail,
      subject,
      html: testEmailHtml,
      from: `${fromName} <${fromEmail}>`,
      replyTo,
    });

    const emailLogMeta = {
      to: recipientEmail,
      subject,
      success: emailResult.success,
      ...(emailResult.error && { error: emailResult.error }),
    };

    if (!emailResult.success) {
      await createActivityLog("test_email_sent", "email", `Failed to send test email to ${recipientEmail}`, {
        metadata: emailLogMeta,
      });
      return NextResponse.json(
        { success: false, error: emailResult.error || "Failed to send test email" },
        { status: 500 }
      );
    }

    await createActivityLog("test_email_sent", "email", `Test email sent to ${recipientEmail}`, {
      metadata: emailLogMeta,
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${recipientEmail}`,
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred while sending the test email" },
      { status: 500 }
    );
  }
}
