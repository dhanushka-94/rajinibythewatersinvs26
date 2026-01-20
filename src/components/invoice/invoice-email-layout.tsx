import { Invoice } from "@/types/invoice";
import { BankDetail } from "@/lib/bank-details";
import { getHotelInfo, type HotelInfo } from "@/lib/hotel-info";
import { formatCurrency } from "@/lib/currency";
import { getBankDetailById } from "@/lib/bank-details";
import { getTravelCompanyById } from "@/lib/travel-companies";
import { type TravelCompany } from "@/types/travel-company";

interface InvoiceEmailLayoutProps {
  invoice: Invoice;
  hotelInfo: HotelInfo;
  bankDetails: BankDetail[];
  travelCompany: TravelCompany | null;
}

export function generateInvoiceEmailHtml({
  invoice,
  hotelInfo,
  bankDetails,
  travelCompany,
}: InvoiceEmailLayoutProps) {
  // Helper function to mask ID number (show only last 2 digits)
  const maskIdNumber = (idNumber?: string): string => {
    if (!idNumber || idNumber.length <= 2) return idNumber || "";
    const masked = "*".repeat(idNumber.length - 2);
    return `${masked}${idNumber.slice(-2)}`;
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      partially_paid: "Partially Paid",
      paid: "Paid",
      pending: "Pending",
      sent: "Sent",
      draft: "Draft",
      cancelled: "Cancelled",
    };
    return statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; max-width: 600px; width: 100%; border-collapse: collapse;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="60%" style="vertical-align: top;">
                    ${hotelInfo.logoPath ? `<img src="${hotelInfo.logoPath}" alt="${hotelInfo.name}" style="max-width: 140px; height: auto; margin-bottom: 10px;" />` : ""}
                    <div style="font-size: 11px; color: #6b7280; line-height: 1.5;">
                      <div style="margin-bottom: 3px;">📍 ${hotelInfo.address}, ${hotelInfo.city}, ${hotelInfo.country}</div>
                      <div style="margin-bottom: 3px;">
                        ${hotelInfo.hotline ? `📞 Hotline: ${hotelInfo.hotline}` : ""}
                        ${hotelInfo.telephone ? ` | Tel: ${hotelInfo.telephone}` : ""}
                        ${hotelInfo.usaContact ? ` | USA: ${hotelInfo.usaContact}` : ""}
                      </div>
                      <div>
                        ${hotelInfo.email ? `✉️ ${hotelInfo.email}` : ""}
                        ${hotelInfo.website ? ` | 🌐 ${hotelInfo.website}` : ""}
                      </div>
                    </div>
                  </td>
                  <td width="40%" style="vertical-align: top; text-align: right;">
                    <h2 style="margin: 0 0 5px 0; font-size: 18px; font-weight: bold; color: #111827;">INVOICE</h2>
                    <p style="margin: 0 0 5px 0; font-size: 16px; font-weight: bold; color: #111827;">${invoice.invoiceNumber}</p>
                    <div style="margin-bottom: 5px;">
                      <span style="font-size: 11px; color: #6b7280;">Currency: ${invoice.currency}</span>
                      <span style="display: inline-block; margin-left: 8px; padding: 2px 8px; background-color: #f3f4f6; border: 1px solid #d1d5db; border-radius: 3px; font-size: 10px; color: #374151;">${getStatusLabel(invoice.status)}</span>
                    </div>
                    <p style="margin: 0; font-size: 11px; color: #6b7280;">
                      Date: ${new Date(invoice.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bill To, Guest Info, Booking Details - Three columns -->
          <tr>
            <td style="padding: 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Bill To -->
                  <td width="${(invoice.billingType === "company" || (invoice.guests && invoice.guests.length > 0)) ? "33%" : "50%"}" style="vertical-align: top; padding-right: 15px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #111827;">🏢 Bill To:</h3>
                    ${invoice.billingType === "company" && travelCompany
                      ? `
                        <div style="font-size: 11px; line-height: 1.6; color: #374151;">
                          <div style="margin-bottom: 6px;"><strong>${travelCompany.name}</strong></div>
                          ${travelCompany.contactPerson ? `<div style="margin-bottom: 4px;"># ${travelCompany.contactPerson}</div>` : ""}
                          ${travelCompany.phone ? `<div style="margin-bottom: 4px;">📞 ${travelCompany.phone}</div>` : ""}
                          ${travelCompany.address || travelCompany.city || travelCompany.country
                            ? `<div style="margin-bottom: 4px;">📍 ${travelCompany.address || ""}${travelCompany.city ? `, ${travelCompany.city}` : ""}${travelCompany.country ? `, ${travelCompany.country}` : ""}</div>`
                            : ""}
                          ${invoice.referenceNumber ? `<div style="margin-bottom: 4px;"># Ref: ${invoice.referenceNumber}</div>` : ""}
                        </div>
                      `
                      : `
                        <div style="font-size: 11px; line-height: 1.6; color: #374151;">
                          <div style="margin-bottom: 6px;"><strong>${invoice.guest.name}</strong></div>
                          ${invoice.guest.email ? `<div style="margin-bottom: 4px;">✉️ ${invoice.guest.email}</div>` : ""}
                          ${invoice.guest.phone ? `<div style="margin-bottom: 4px;">📞 ${invoice.guest.phone}</div>` : ""}
                          ${invoice.guest.address || invoice.guest.city || invoice.guest.country
                            ? `<div style="margin-bottom: 4px;">📍 ${invoice.guest.address || ""}${invoice.guest.city ? `, ${invoice.guest.city}` : ""}${invoice.guest.country ? `, ${invoice.guest.country}` : ""}</div>`
                            : ""}
                        </div>
                      `}
                  </td>
                  
                  <!-- Guest Information - Only show if there's content -->
                  ${(invoice.billingType === "company" || (invoice.guests && invoice.guests.length > 0))
                    ? `
                  <td width="33%" style="vertical-align: top; padding: 0 15px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
                    <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #111827;">👤 Guest Information:</h3>
                    <div style="font-size: 11px; line-height: 1.6; color: #374151;">
                      ${(invoice.billingType === "company" || (invoice.guests && invoice.guests.length > 0)) && invoice.guest.name
                        ? `<div style="margin-bottom: 4px;">${invoice.guest.name}</div>`
                        : ""}
                      ${invoice.guests && invoice.guests.length > 0
                        ? invoice.guests.map((guest) => guest.name ? `<div style="margin-bottom: 4px;">${guest.name}</div>` : "").join("")
                        : ""}
                    </div>
                  </td>
                  `
                    : ""}
                  
                  <!-- Booking Details -->
                  <td width="${(invoice.billingType === "company" || (invoice.guests && invoice.guests.length > 0)) ? "34%" : "50%"}" style="vertical-align: top; padding-left: 15px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #111827;">📅 Booking Details:</h3>
                    <div style="font-size: 11px; line-height: 1.6; color: #374151;">
                      <div style="margin-bottom: 6px;">
                        <strong>Check-in:</strong><br>
                        ${new Date(invoice.checkIn).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div style="margin-bottom: 6px;">
                        <strong>Check-out:</strong><br>
                        ${new Date(invoice.checkOut).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      ${invoice.roomType ? `<div style="margin-bottom: 6px;"><strong>Room:</strong> ${invoice.roomType}</div>` : ""}
                      ${invoice.adults !== undefined || invoice.children !== undefined || invoice.babies !== undefined
                        ? `<div style="margin-bottom: 6px;">
                            <strong>Guests:</strong> ${[
                              invoice.adults !== undefined && invoice.adults > 0 ? `${invoice.adults} Adult${invoice.adults !== 1 ? 's' : ''}` : null,
                              invoice.children !== undefined && invoice.children > 0 ? `${invoice.children} Child${invoice.children !== 1 ? 'ren' : ''}` : null,
                              invoice.babies !== undefined && invoice.babies > 0 ? `${invoice.babies} Bab${invoice.babies !== 1 ? 'ies' : 'y'}` : null,
                            ].filter(Boolean).join(', ') || 'N/A'}
                          </div>`
                        : ""}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Invoice Items -->
          <tr>
            <td style="padding: 0 20px 20px 20px;">
              <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; border: 1px solid #e5e7eb;">
                <tr style="background-color: #f9fafb;">
                  <th style="text-align: left; font-size: 11px; font-weight: 600; color: #111827; padding: 8px; border-bottom: 1px solid #e5e7eb;">Description</th>
                  <th style="text-align: right; font-size: 11px; font-weight: 600; color: #111827; padding: 8px; border-bottom: 1px solid #e5e7eb;">Qty/Days</th>
                  <th style="text-align: right; font-size: 11px; font-weight: 600; color: #111827; padding: 8px; border-bottom: 1px solid #e5e7eb;">Unit Price</th>
                  <th style="text-align: right; font-size: 11px; font-weight: 600; color: #111827; padding: 8px; border-bottom: 1px solid #e5e7eb;">Total</th>
                </tr>
                ${invoice.items
                  .map(
                    (item) => `
                  <tr>
                    <td style="font-size: 11px; color: #111827; padding: 8px; border-bottom: 1px solid #f3f4f6;">${item.description}</td>
                    <td style="text-align: right; font-size: 11px; color: #6b7280; padding: 8px; border-bottom: 1px solid #f3f4f6;">${item.quantity} ${item.quantityType === "days" ? "Days" : "Qty"}</td>
                    <td style="text-align: right; font-size: 11px; color: #6b7280; padding: 8px; border-bottom: 1px solid #f3f4f6;">${formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td style="text-align: right; font-size: 11px; font-weight: 500; color: #111827; padding: 8px; border-bottom: 1px solid #f3f4f6;">${formatCurrency(item.total, invoice.currency)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </table>
            </td>
          </tr>

          <!-- Summary -->
          <tr>
            <td style="padding: 0 20px 20px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" align="right" style="max-width: 300px; margin-left: auto;">
                <tr>
                  <td style="padding: 2px 0; font-size: 11px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #6b7280;">Subtotal:</td>
                        <td style="text-align: right; font-weight: 500; color: #111827;">${formatCurrency(invoice.subtotal, invoice.currency)}</td>
                      </tr>
                      ${invoice.serviceCharge > 0
                        ? `
                      <tr>
                        <td style="color: #6b7280;">Service Charge (${invoice.serviceChargeRate}%):</td>
                        <td style="text-align: right; font-weight: 500; color: #111827;">${formatCurrency(invoice.serviceCharge, invoice.currency)}</td>
                      </tr>
                      `
                        : ""}
                      ${invoice.damageCharge > 0
                        ? `
                      <tr>
                        <td style="color: #6b7280;">Damage Charge:</td>
                        <td style="text-align: right; font-weight: 500; color: #dc2626;">${formatCurrency(invoice.damageCharge, invoice.currency)}</td>
                      </tr>
                      `
                        : ""}
                      ${invoice.discount > 0
                        ? `
                      <tr>
                        <td style="color: #6b7280;">Discount ${invoice.discountType === "percentage" ? `(${invoice.discount}%)` : "(Fixed)"}:</td>
                        <td style="text-align: right; font-weight: 500; color: #16a34a;">-${formatCurrency(invoice.discount, invoice.currency)}</td>
                      </tr>
                      `
                        : ""}
                      <tr>
                        <td style="color: #6b7280;">Tax (${invoice.taxRate}%):</td>
                        <td style="text-align: right; font-weight: 500; color: #111827;">${formatCurrency(invoice.taxAmount, invoice.currency)}</td>
                      </tr>
                      ${invoice.priceAdjustment !== 0
                        ? `
                      <tr>
                        <td style="color: #6b7280;">Price Adjustment${invoice.priceAdjustmentReason ? ` (${invoice.priceAdjustmentReason})` : ""}:</td>
                        <td style="text-align: right; font-weight: 500; color: ${invoice.priceAdjustment > 0 ? "#dc2626" : "#16a34a"};">${invoice.priceAdjustment > 0 ? "+" : ""}${formatCurrency(invoice.priceAdjustment, invoice.currency)}</td>
                      </tr>
                      `
                        : ""}
                      <tr>
                        <td colspan="2" style="border-top: 1px solid #e5e7eb; padding-top: 4px;"></td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; font-weight: 700; color: #111827; padding-top: 4px;">Total Amount:</td>
                        <td style="text-align: right; font-size: 14px; font-weight: 700; color: #111827; padding-top: 4px;">${formatCurrency(invoice.total, invoice.currency)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Notes -->
          ${invoice.notes
            ? `
          <tr>
            <td style="padding: 0 20px 20px 20px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <h3 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #111827;">Notes:</h3>
            <p style="margin: 0; font-size: 11px; color: #6b7280; white-space: pre-wrap;">${invoice.notes}</p>
          </td>
          </tr>
          `
            : ""}

          <!-- Payment Information -->
          ${invoice.paymentMethods.length > 0 || bankDetails.length > 0
            ? `
          <tr>
            <td style="padding: 0 20px 20px 20px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <h3 style="margin: 0 0 12px 0; font-size: 12px; font-weight: 600; color: #111827;">Payment Information</h3>
            
            ${invoice.paymentMethods.length > 0
              ? `
            <div style="margin-bottom: 12px;">
              <p style="margin: 0 0 6px 0; font-size: 10px; font-weight: 500; color: #374151;">Accepted Payment Methods:</p>
              <div style="font-size: 10px; color: #111827;">
                ${invoice.paymentMethods.includes("bank_account") ? "🏦 Bank Transfer/Deposit " : ""}
                ${invoice.paymentMethods.includes("cheque") ? "📄 Cheque Payment " : ""}
                ${invoice.paymentMethods.includes("online") ? "🌐 Online Payment " : ""}
                ${invoice.paymentMethods.includes("cash") ? "💵 Cash Payment " : ""}
                ${invoice.paymentMethods.includes("card") ? `💳 Card Payment${invoice.cardLast4Digits ? ` (****${invoice.cardLast4Digits})` : ""}` : ""}
              </div>
            </div>
            `
              : ""}
            
            ${invoice.checksPayableTo
              ? `
            <div style="margin-bottom: 12px; padding: 8px; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px;">
              <p style="margin: 0 0 4px 0; font-size: 10px; font-weight: 500; color: #374151;">Make Checks Payable To:</p>
              <p style="margin: 0; font-size: 11px; font-weight: 600; color: #111827;">${invoice.checksPayableTo}</p>
            </div>
            `
              : ""}
            
            ${bankDetails.length > 0
              ? `
            <div style="padding: 6px; background-color: #eff6ff; border: 2px solid #bfdbfe; border-radius: 4px;">
              ${bankDetails.length > 1
                ? `<table width="100%" cellpadding="0" cellspacing="0">
                    ${bankDetails
                      .map(
                        (bankDetail, index) => `
                      <tr>
                        <td width="50%" style="vertical-align: top; padding-right: 10px; ${index < bankDetails.length - 1 ? "border-right: 2px solid #93c5fd;" : ""}">
                          <h4 style="margin: 0 0 4px 0; font-size: 9px; font-weight: 700; color: #1e3a8a;">Bank Transfer/Deposit Details #${index + 1}:</h4>
                          <div style="font-size: 8.5px; line-height: 1.3; color: #1e3a8a;">
                            <div style="margin-bottom: 2px;"><strong style="color: #1e40af; font-weight: 600;">Account Name:</strong> <span style="font-weight: 500;">${bankDetail.accountName}</span></div>
                            <div style="margin-bottom: 2px;"><strong style="color: #1e40af; font-weight: 600;">Bank Name:</strong> <span style="font-weight: 500;">${bankDetail.bankName}</span></div>
                            <div style="margin-bottom: 2px;"><strong style="color: #1e40af; font-weight: 600;">Branch:</strong> <span style="font-weight: 500;">${bankDetail.branch}</span></div>
                            <div style="margin-bottom: 2px;"><strong style="color: #1e40af; font-weight: 600;">Account Number:</strong> <span style="font-weight: 500;">${bankDetail.accountNumber}</span></div>
                            <div><strong style="color: #1e40af; font-weight: 600;">SWIFT Code:</strong> <span style="font-weight: 500;">${bankDetail.swiftCode}</span></div>
                          </div>
                        </td>
                        ${index < bankDetails.length - 1
                          ? `
                        <td width="50%" style="vertical-align: top; padding-left: 10px;">
                          <h4 style="margin: 0 0 4px 0; font-size: 9px; font-weight: 700; color: #1e3a8a;">Bank Transfer/Deposit Details #${index + 2}:</h4>
                          <div style="font-size: 8.5px; line-height: 1.3; color: #1e3a8a;">
                            <div style="margin-bottom: 2px;"><strong style="color: #1e40af; font-weight: 600;">Account Name:</strong> <span style="font-weight: 500;">${bankDetails[index + 1].accountName}</span></div>
                            <div style="margin-bottom: 2px;"><strong style="color: #1e40af; font-weight: 600;">Bank Name:</strong> <span style="font-weight: 500;">${bankDetails[index + 1].bankName}</span></div>
                            <div style="margin-bottom: 2px;"><strong style="color: #1e40af; font-weight: 600;">Branch:</strong> <span style="font-weight: 500;">${bankDetails[index + 1].branch}</span></div>
                            <div style="margin-bottom: 2px;"><strong style="color: #1e40af; font-weight: 600;">Account Number:</strong> <span style="font-weight: 500;">${bankDetails[index + 1].accountNumber}</span></div>
                            <div><strong style="color: #1e40af; font-weight: 600;">SWIFT Code:</strong> <span style="font-weight: 500;">${bankDetails[index + 1].swiftCode}</span></div>
                          </div>
                        </td>
                        `
                          : ""}
                      </tr>
                    `
                      )
                      .join("")}
                  </table>`
                : `
                  <h4 style="margin: 0 0 4px 0; font-size: 9px; font-weight: 700; color: #1e3a8a;">Bank Transfer/Deposit Details:</h4>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" style="vertical-align: top; padding-right: 8px;">
                        <div style="font-size: 8.5px; line-height: 1.3; color: #1e3a8a;">
                          <div style="margin-bottom: 2px;"><strong style="color: #1e40af; font-weight: 600;">Account Name:</strong> <span style="font-weight: 500;">${bankDetails[0].accountName}</span></div>
                          <div style="margin-bottom: 2px;"><strong style="color: #1e40af; font-weight: 600;">Bank Name:</strong> <span style="font-weight: 500;">${bankDetails[0].bankName}</span></div>
                          <div style="margin-bottom: 2px;"><strong style="color: #1e40af; font-weight: 600;">Branch:</strong> <span style="font-weight: 500;">${bankDetails[0].branch}</span></div>
                        </div>
                      </td>
                      <td width="50%" style="vertical-align: top; padding-left: 8px;">
                        <div style="font-size: 8.5px; line-height: 1.3; color: #1e3a8a;">
                          <div style="margin-bottom: 2px;"><strong style="color: #1e40af; font-weight: 600;">Account Number:</strong> <span style="font-weight: 500;">${bankDetails[0].accountNumber}</span></div>
                          <div><strong style="color: #1e40af; font-weight: 600;">SWIFT Code:</strong> <span style="font-weight: 500;">${bankDetails[0].swiftCode}</span></div>
                        </div>
                      </td>
                    </tr>
                  </table>
                `}
            </div>
            `
              : ""}
          </td>
          </tr>
          `
            : ""}

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; border-top: 1px solid #e5e7eb; text-align: center; background-color: #f9fafb;">
              <p style="margin: 0 0 8px 0; font-size: 11px; color: #6b7280;">
                Thank you for choosing ${hotelInfo.name}! We hope to see you again soon.
              </p>
              <p style="margin: 0; font-size: 10px; color: #9ca3af;">
                ${hotelInfo.name} Powered by <strong style="color: #6b7280;">Phoenix Global Solutions</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Helper function to generate email HTML from invoice
export async function generateInvoiceEmailHtmlFromInvoice(invoice: Invoice): Promise<string> {
  // Load all required data
  const hotelInfo = await getHotelInfo();
  
  // Load bank details
  const bankIds = invoice.selectedBankDetailIds || (invoice.selectedBankDetailId ? [invoice.selectedBankDetailId] : []);
  const bankDetails = bankIds.length > 0
    ? await Promise.all(
        bankIds.map(async (id) => {
          const bank = await getBankDetailById(id);
          return bank;
        })
      )
    : [];
  const validBankDetails = bankDetails.filter((b): b is BankDetail => b !== null);

  // Load travel company if needed
  let travelCompany: TravelCompany | null = null;
  if (invoice.billingType === "company" && invoice.travelCompanyId) {
    travelCompany = (await getTravelCompanyById(invoice.travelCompanyId)) || null;
  }

  return generateInvoiceEmailHtml({
    invoice,
    hotelInfo,
    bankDetails: validBankDetails,
    travelCompany,
  });
}
