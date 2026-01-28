import { NextRequest, NextResponse } from "next/server";
import { getInvoiceById } from "@/lib/invoices";
import { getSession } from "@/lib/auth";
import { generateInvoiceEmailHtmlFromInvoice } from "@/components/invoice/invoice-email-layout";
import { createActivityLog } from "@/lib/activity-logs";
import { sendEmail, getSenderAddress } from "@/lib/email";

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

    const { getHotelInfo } = await import("@/lib/hotel-info");
    const hotelInfo = await getHotelInfo();
    const { fromEmail, fromName } = getSenderAddress(
      hotelInfo.email,
      hotelInfo.name || "Invoice System"
    );

    const replyTo = process.env.SMTP_REPLY_TO || "bookings@rajinihotels.com";
    const subject = `Invoice ${invoice.invoiceNumber} - ${hotelInfo.name}`;
    const emailResult = await sendEmail({
      to: recipientEmail,
      subject,
      html: emailHtml,
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
      await createActivityLog("invoice_sent", "invoice", `Failed to send invoice ${invoice.invoiceNumber} to ${recipientEmail}`, {
        entityId: invoice.id,
        entityName: invoice.invoiceNumber,
        metadata: emailLogMeta,
      });
      return NextResponse.json(
        { success: false, error: emailResult.error || "Failed to send email" },
        { status: 500 }
      );
    }

    await createActivityLog("invoice_sent", "invoice", `Invoice ${invoice.invoiceNumber} sent via email to ${recipientEmail}`, {
      entityId: invoice.id,
      entityName: invoice.invoiceNumber,
      metadata: emailLogMeta,
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
