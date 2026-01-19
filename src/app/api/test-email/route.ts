import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getSession } from "@/lib/auth";

async function sendTestEmail({
  to,
  subject,
  html,
  from,
}: {
  to: string;
  subject: string;
  html: string;
  from: string;
}): Promise<{ success: boolean; error?: string }> {
  // Validate required environment variables
  const smtpHost = process.env.ZOHO_SMTP_HOST || "smtp.zoho.com";
  const smtpPort = parseInt(process.env.ZOHO_SMTP_PORT || "587");
  const smtpSecure = process.env.ZOHO_SMTP_SECURE === "true" || smtpPort === 465;
  const smtpUser = process.env.ZOHO_SMTP_USER;
  const smtpPassword = process.env.ZOHO_SMTP_PASSWORD;

  if (!smtpUser || !smtpPassword) {
    return {
      success: false,
      error: "Zoho Mail SMTP credentials are not configured. Please set ZOHO_SMTP_USER and ZOHO_SMTP_PASSWORD in your environment variables.",
    };
  }

  // Create Nodemailer transporter for Zoho Mail
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: from,
      to: to,
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", info.messageId);
    return { success: true };
  } catch (error: any) {
    console.error("Zoho Mail error:", error);
    return {
      success: false,
      error: error.message || "Failed to send email via Zoho Mail",
    };
  }
}

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

    // Get hotel info for sender email
    const { getHotelInfo } = await import("@/lib/hotel-info");
    const hotelInfo = await getHotelInfo();
    
    const zohoSmtpUser = process.env.ZOHO_SMTP_USER;
    const hotelEmail = hotelInfo.email;
    
    let fromEmail: string;
    if (zohoSmtpUser && hotelEmail) {
      const zohoDomain = zohoSmtpUser.split('@')[1];
      const hotelDomain = hotelEmail.split('@')[1];
      fromEmail = (zohoDomain === hotelDomain) ? hotelEmail : zohoSmtpUser;
    } else {
      fromEmail = hotelEmail || zohoSmtpUser || "noreply@example.com";
    }
    
    const fromName = hotelInfo.name || "Invoice System";

    // Create a simple test email HTML
    const testEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test Email</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
    <h2 style="color: #111827; margin-bottom: 20px;">Email Test - Zoho Mail Configuration</h2>
    <p style="color: #374151; line-height: 1.6;">
      This is a test email to verify that your Zoho Mail SMTP configuration is working correctly.
    </p>
    <div style="margin-top: 30px; padding: 15px; background-color: #f3f4f6; border-radius: 4px;">
      <p style="margin: 0; font-size: 12px; color: #6b7280;">
        <strong>From:</strong> ${fromName} &lt;${fromEmail}&gt;<br>
        <strong>To:</strong> ${recipientEmail}<br>
        <strong>Time:</strong> ${new Date().toLocaleString()}
      </p>
    </div>
    <p style="color: #374151; margin-top: 20px;">
      If you received this email, your Zoho Mail SMTP configuration is working correctly! ✅
    </p>
    <p style="color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
      ${hotelInfo.name} - Invoice Management System
    </p>
  </div>
</body>
</html>
    `;

    // Send test email
    const emailResult = await sendTestEmail({
      to: recipientEmail,
      subject: `Test Email - ${hotelInfo.name} Invoice System`,
      html: testEmailHtml,
      from: `${fromName} <${fromEmail}>`,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: emailResult.error || "Failed to send test email" },
        { status: 500 }
      );
    }

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
