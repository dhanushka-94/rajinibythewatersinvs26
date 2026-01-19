import { NextRequest, NextResponse } from "next/server";
import { getInvoiceById } from "@/lib/invoices";
import { getSession } from "@/lib/auth";
import { generateInvoiceEmailHtmlFromInvoice } from "@/components/invoice/invoice-email-layout";
import { createActivityLog } from "@/lib/activity-logs";
import nodemailer from "nodemailer";

// Zoho Mail SMTP Configuration
// Make sure to set these environment variables in your .env.local file:
// ZOHO_SMTP_HOST=smtp.zoho.com
// ZOHO_SMTP_PORT=587 (or 465 for SSL)
// ZOHO_SMTP_SECURE=false (true for port 465, false for port 587)
// ZOHO_SMTP_USER=your-email@yourdomain.com
// ZOHO_SMTP_PASSWORD=your-app-password (not your regular password!)

async function sendEmail({
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
    secure: smtpSecure, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
    // Optional: Add TLS options for better compatibility
    tls: {
      rejectUnauthorized: false, // Set to true in production if you have proper SSL certificates
    },
  });

  try {
    await transporter.sendMail({
      from: from, // Format: "Name <email@domain.com>" or just "email@domain.com"
      to: to,
      subject: subject,
      html: html,
      // Optional: Add text version for better email client compatibility
      text: subject, // You can generate a plain text version if needed
    });

    return { success: true };
  } catch (error: any) {
    console.error("Zoho Mail error:", error);
    return {
      success: false,
      error: error.message || "Failed to send email via Zoho Mail",
    };
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { recipientEmail, recipientName } = body;

    if (!recipientEmail) {
      return NextResponse.json(
        { success: false, error: "Recipient email is required" },
        { status: 400 }
      );
    }

    // Get invoice
    const invoice = await getInvoiceById(id);
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Generate email HTML
    const emailHtml = await generateInvoiceEmailHtmlFromInvoice(invoice);

    // Get hotel info for sender email
    const { getHotelInfo } = await import("@/lib/hotel-info");
    const hotelInfo = await getHotelInfo();
    
    // For Zoho Mail, the sender email should match or be from the same domain as ZOHO_SMTP_USER
    // If hotel email is different, use the Zoho SMTP user email as the sender
    const zohoSmtpUser = process.env.ZOHO_SMTP_USER;
    const hotelEmail = hotelInfo.email;
    
    // Use Zoho SMTP user email if hotel email doesn't match the domain, otherwise use hotel email
    let fromEmail: string;
    if (zohoSmtpUser && hotelEmail) {
      const zohoDomain = zohoSmtpUser.split('@')[1];
      const hotelDomain = hotelEmail.split('@')[1];
      // If domains match, use hotel email; otherwise use Zoho email
      fromEmail = (zohoDomain === hotelDomain) ? hotelEmail : zohoSmtpUser;
    } else {
      fromEmail = hotelEmail || zohoSmtpUser || process.env.FROM_EMAIL || "noreply@example.com";
    }
    
    const fromName = hotelInfo.name || "Invoice System";

    // Send email
    const emailResult = await sendEmail({
      to: recipientEmail,
      subject: `Invoice ${invoice.invoiceNumber} - ${hotelInfo.name}`,
      html: emailHtml,
      from: `${fromName} <${fromEmail}>`,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: emailResult.error || "Failed to send email" },
        { status: 500 }
      );
    }

    // Log activity
    await createActivityLog("invoice_sent", "invoice", `Invoice ${invoice.invoiceNumber} sent via email to ${recipientEmail}`, {
      entityId: invoice.id,
      entityName: invoice.invoiceNumber,
    });

    return NextResponse.json({
      success: true,
      message: `Invoice sent successfully to ${recipientEmail}`,
    });
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred while sending the email" },
      { status: 500 }
    );
  }
}
