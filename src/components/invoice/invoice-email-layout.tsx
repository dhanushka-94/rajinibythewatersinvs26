import { Invoice } from "@/types/invoice";
import { BankDetail } from "@/lib/bank-details";
import { getHotelInfo, type HotelInfo } from "@/lib/hotel-info";
import { formatCurrency } from "@/lib/currency";
import { getBankDetailById } from "@/lib/bank-details";
import { getTravelCompanyById } from "@/lib/travel-companies";
import { type TravelCompany } from "@/types/travel-company";
import { formatDateSL } from "@/lib/date-sl";

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
            <td style="padding: 16px 20px; border-bottom: 1px solid #111827;">
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
                      Date: ${formatDateSL(invoice.createdAt, { month: "long" })}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bill To, Guest Info, Booking Details - Three columns -->
          <tr>
            <td style="padding: 12px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Bill To -->
                  <td width="${(invoice.billingType === "company" || (invoice.guests && invoice.guests.length > 0)) ? "33%" : "50%"}" style="vertical-align: top; padding-right: 15px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #111827;">🏢 Bill To:</h3>
                    ${invoice.billingType === "company" && travelCompany
                      ? `
                        <div style="font-size: 11px; line-height: 1.6; color: #374151;">
                          <div style="margin-bottom: 6px;"><strong>${travelCompany.name}</strong></div>
                          ${travelCompany.contactPerson ? `<div style="margin-bottom: 4px;"># ${travelCompany.contactPersonTitle ? `${travelCompany.contactPersonTitle} ` : ""}${travelCompany.contactPerson}</div>` : ""}
                          ${travelCompany.phone ? `<div style="margin-bottom: 4px;">📞 ${travelCompany.phone}</div>` : ""}
                          ${travelCompany.address || travelCompany.city || travelCompany.country
                            ? `<div style="margin-bottom: 4px;">📍 ${travelCompany.address || ""}${travelCompany.city ? `, ${travelCompany.city}` : ""}${travelCompany.country ? `, ${travelCompany.country}` : ""}</div>`
                            : ""}
                          ${invoice.referenceNumber ? `<div style="margin-bottom: 4px;"># Ref: ${invoice.referenceNumber}</div>` : ""}
                        </div>
                      `
                      : `
                        <div style="font-size: 11px; line-height: 1.6; color: #374151;">
                          <div style="margin-bottom: 6px;"><strong>${invoice.guest.title ? `${invoice.guest.title} ` : ""}${invoice.guest.name}</strong></div>
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
                  <td width="33%" style="vertical-align: top; padding: 0 15px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #111827;">👤 Guest Information:</h3>
                    <div style="font-size: 11px; line-height: 1.6; color: #374151;">
                      ${(invoice.billingType === "company" || (invoice.guests && invoice.guests.length > 0)) && invoice.guest.name
                        ? `<div style="margin-bottom: 4px;">${invoice.guest.title ? `${invoice.guest.title} ` : ""}${invoice.guest.name}</div>`
                        : ""}
                      ${invoice.guests && invoice.guests.length > 0
                        ? invoice.guests.map((guest) => guest.name ? `<div style="margin-bottom: 4px;">${guest.title ? `${guest.title} ` : ""}${guest.name}</div>` : "").join("")
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
                        <strong>🔑 Check-in:</strong><br>
                        ${formatDateSL(invoice.checkIn, { month: "long" })}
                      </div>
                      <div style="margin-bottom: 6px;">
                        <strong>🚪 Check-out:</strong><br>
                        ${formatDateSL(invoice.checkOut, { month: "long" })}
                      </div>
                      ${invoice.roomType ? `<div style="margin-bottom: 6px;"><strong>Room:</strong> ${invoice.roomType}</div>` : ""}
                      ${invoice.adults !== undefined || invoice.children !== undefined || invoice.babies !== undefined
                        ? `<div style="margin-bottom: 6px;">
                            <strong>👥 Guests:</strong> ${[
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
            <td style="padding: 0 20px 12px 20px;">
              <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse: collapse; border-spacing: 0; border: 1px solid #ffffff;">
                <tr style="background-color: #f3f4f6;">
                  <th style="text-align: left; font-size: 10px; font-weight: 600; color: #111827; padding: 6px; border-right: 1px solid #ffffff; border-bottom: 1px solid #ffffff; background-color: #f3f4f6;">Description</th>
                  <th style="text-align: right; font-size: 10px; font-weight: 600; color: #111827; padding: 6px; border-right: 1px solid #ffffff; border-bottom: 1px solid #ffffff; background-color: #f3f4f6;">Qty/Days</th>
                  <th style="text-align: right; font-size: 10px; font-weight: 600; color: #111827; padding: 6px; border-right: 1px solid #ffffff; border-bottom: 1px solid #ffffff; background-color: #f3f4f6;">Unit Price</th>
                  <th style="text-align: right; font-size: 10px; font-weight: 600; color: #111827; padding: 6px; border-bottom: 1px solid #ffffff; background-color: #f3f4f6;">Total</th>
                </tr>
                ${invoice.items
                  .map(
                    (item, index) => `
                  <tr>
                    <td style="font-size: 10px; color: #111827; padding: 6px; border-right: 1px solid #ffffff; ${index < invoice.items.length - 1 ? 'border-bottom: 1px solid #ffffff;' : ''}">${item.description}</td>
                    <td style="text-align: right; font-size: 10px; color: #111827; padding: 6px; border-right: 1px solid #ffffff; ${index < invoice.items.length - 1 ? 'border-bottom: 1px solid #ffffff;' : ''}">${item.quantity} ${item.quantityType === "days" ? "Days" : "Qty"}</td>
                    <td style="text-align: right; font-size: 10px; color: #111827; padding: 6px; border-right: 1px solid #ffffff; ${index < invoice.items.length - 1 ? 'border-bottom: 1px solid #ffffff;' : ''}">${formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td style="text-align: right; font-size: 10px; font-weight: 500; color: #111827; padding: 6px; ${index < invoice.items.length - 1 ? 'border-bottom: 1px solid #ffffff;' : ''}">${formatCurrency(item.total, invoice.currency)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </table>
            </td>
          </tr>

          <!-- Summary -->
          <tr>
            <td style="padding: 0 20px 12px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" align="right" style="max-width: 300px; margin-left: auto;">
                <tr>
                  <td style="padding: 1px 0; font-size: 11px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #111827;">Subtotal:</td>
                        <td style="text-align: right; font-weight: 500; color: #111827;">${formatCurrency(invoice.subtotal, invoice.currency)}</td>
                      </tr>
                      ${invoice.serviceCharge > 0
                        ? `
                      <tr>
                        <td style="color: #111827;">Service Charge (${invoice.serviceChargeRate}%):</td>
                        <td style="text-align: right; font-weight: 500; color: #111827;">${formatCurrency(invoice.serviceCharge, invoice.currency)}</td>
                      </tr>
                      `
                        : ""}
                      ${invoice.damageCharge > 0
                        ? `
                      <tr>
                        <td style="color: #111827;">Damage Charge:</td>
                        <td style="text-align: right; font-weight: 500; color: #111827;">${formatCurrency(invoice.damageCharge, invoice.currency)}</td>
                      </tr>
                      `
                        : ""}
                      ${invoice.discount > 0
                        ? `
                      <tr>
                        <td style="color: #111827;">Discount ${invoice.discountType === "percentage" ? `(${invoice.discount}%)` : "(Fixed)"}:</td>
                        <td style="text-align: right; font-weight: 500; color: #111827;">-${formatCurrency(invoice.discount, invoice.currency)}</td>
                      </tr>
                      `
                        : ""}
                      <tr>
                        <td style="color: #111827;">Tax (${invoice.taxRate}%):</td>
                        <td style="text-align: right; font-weight: 500; color: #111827;">${formatCurrency(invoice.taxAmount, invoice.currency)}</td>
                      </tr>
                      ${invoice.priceAdjustment !== 0
                        ? `
                      <tr>
                        <td style="color: #111827;">Price Adjustment${invoice.priceAdjustmentReason ? ` (${invoice.priceAdjustmentReason})` : ""}:</td>
                        <td style="text-align: right; font-weight: 500; color: #111827;">${invoice.priceAdjustment > 0 ? "+" : ""}${formatCurrency(invoice.priceAdjustment, invoice.currency)}</td>
                      </tr>
                      `
                        : ""}
                      <tr>
                        <td colspan="2" style="border-top: 1px solid #111827; padding-top: 2px;"></td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; font-weight: 700; color: #111827; padding-top: 2px;">Total Amount:</td>
                        <td style="text-align: right; font-size: 14px; font-weight: 700; color: #111827; padding-top: 2px;">${formatCurrency(invoice.total, invoice.currency)}</td>
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
            <td style="padding: 0 20px 12px 20px; border-top: 1px solid #111827; padding-top: 12px;">
            <h3 style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #111827;">Notes:</h3>
            <p style="margin: 0; font-size: 11px; color: #111827; white-space: pre-wrap;">${invoice.notes}</p>
          </td>
          </tr>
          `
            : ""}

          <!-- Payment Information -->
          ${invoice.paymentMethods.length > 0 || bankDetails.length > 0
            ? `
          <tr>
            <td style="padding: 0 20px 10px 20px;">
            <h3 style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; color: #111827; background-color: #f3f4f6; padding: 6px 8px;">Payment Information</h3>
            
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              ${invoice.paymentMethods.length > 0
                ? `
              <tr>
                <td style="padding: 2px 0; font-size: 8px; line-height: 1.4; color: #111827;">
                  <strong style="font-weight: 600;">Payment Methods:</strong> 
                  ${[
                    invoice.paymentMethods.includes("bank_account") && "Bank Transfer/Wire/Deposit",
                    invoice.paymentMethods.includes("cheque") && "Cheque",
                    invoice.paymentMethods.includes("online") && "Online",
                    invoice.paymentMethods.includes("cash") && "Cash",
                    invoice.paymentMethods.includes("card") && `Card${invoice.cardLast4Digits ? ` (****${invoice.cardLast4Digits})` : ""}`
                  ].filter(Boolean).join(", ")}
                </td>
              </tr>
              `
                : ""}
              
              ${bankDetails.length > 0
                ? `
              <tr>
                <td style="padding-top: 4px;">
                  ${bankDetails.length > 1
                    ? `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                        ${bankDetails
                          .map(
                            (bankDetail, index) => `
                          <tr>
                            <td width="50%" style="vertical-align: top; padding-right: 8px; padding-bottom: 4px;">
                              <div style="font-size: 7.5px; line-height: 1.3;">
                                <div style="font-weight: 700; margin-bottom: 3px; color: #111827;">Bank #${index + 1}:</div>
                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                  <tr>
                                    <td style="padding: 1px 0; font-weight: 600; color: #111827; width: 35%;">Bank:</td>
                                    <td style="padding: 1px 0; color: #111827;">${bankDetail.bankName}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 1px 0; font-weight: 600; color: #111827;">Branch:</td>
                                    <td style="padding: 1px 0; color: #111827;">${bankDetail.branch}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 1px 0; font-weight: 600; color: #111827;">Account:</td>
                                    <td style="padding: 1px 0; color: #111827;">${bankDetail.accountName}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 1px 0; font-weight: 600; color: #111827;">A/C No:</td>
                                    <td style="padding: 1px 0; color: #111827;">${bankDetail.accountNumber}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 1px 0; font-weight: 600; color: #111827;">Address:</td>
                                    <td style="padding: 1px 0; color: #111827;">${bankDetail.bankAddress}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 1px 0; font-weight: 600; color: #111827;">SWIFT:</td>
                                    <td style="padding: 1px 0; color: #111827;">${bankDetail.swiftCode}</td>
                                  </tr>
                                </table>
                              </div>
                            </td>
                            ${index < bankDetails.length - 1
                              ? `
                            <td width="50%" style="vertical-align: top; padding-left: 8px; padding-bottom: 4px;">
                              <div style="font-size: 7.5px; line-height: 1.3;">
                                <div style="font-weight: 700; margin-bottom: 3px; color: #111827;">Bank #${index + 2}:</div>
                                <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                                  <tr>
                                    <td style="padding: 1px 0; font-weight: 600; color: #111827; width: 35%;">Bank:</td>
                                    <td style="padding: 1px 0; color: #111827;">${bankDetails[index + 1].bankName}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 1px 0; font-weight: 600; color: #111827;">Branch:</td>
                                    <td style="padding: 1px 0; color: #111827;">${bankDetails[index + 1].branch}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 1px 0; font-weight: 600; color: #111827;">Account:</td>
                                    <td style="padding: 1px 0; color: #111827;">${bankDetails[index + 1].accountName}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 1px 0; font-weight: 600; color: #111827;">A/C No:</td>
                                    <td style="padding: 1px 0; color: #111827;">${bankDetails[index + 1].accountNumber}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 1px 0; font-weight: 600; color: #111827;">Address:</td>
                                    <td style="padding: 1px 0; color: #111827;">${bankDetails[index + 1].bankAddress}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 1px 0; font-weight: 600; color: #111827;">SWIFT:</td>
                                    <td style="padding: 1px 0; color: #111827;">${bankDetails[index + 1].swiftCode}</td>
                                  </tr>
                                </table>
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
                      <div style="font-size: 7.5px; line-height: 1.3;">
                        <div style="font-weight: 700; margin-bottom: 3px; color: #111827;">Bank Details:</div>
                        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                          <tr>
                            <td style="padding: 1px 0; font-weight: 600; color: #111827; width: 35%;">Bank:</td>
                            <td style="padding: 1px 0; color: #111827;">${bankDetails[0].bankName}</td>
                          </tr>
                          <tr>
                            <td style="padding: 1px 0; font-weight: 600; color: #111827;">Branch:</td>
                            <td style="padding: 1px 0; color: #111827;">${bankDetails[0].branch}</td>
                          </tr>
                          <tr>
                            <td style="padding: 1px 0; font-weight: 600; color: #111827;">Account:</td>
                            <td style="padding: 1px 0; color: #111827;">${bankDetails[0].accountName}</td>
                          </tr>
                          <tr>
                            <td style="padding: 1px 0; font-weight: 600; color: #111827;">A/C No:</td>
                            <td style="padding: 1px 0; color: #111827;">${bankDetails[0].accountNumber}</td>
                          </tr>
                          <tr>
                            <td style="padding: 1px 0; font-weight: 600; color: #111827;">Address:</td>
                            <td style="padding: 1px 0; color: #111827;">${bankDetails[0].bankAddress}</td>
                          </tr>
                          <tr>
                            <td style="padding: 1px 0; font-weight: 600; color: #111827;">SWIFT:</td>
                            <td style="padding: 1px 0; color: #111827;">${bankDetails[0].swiftCode}</td>
                          </tr>
                        </table>
                      </div>
                    `}
                </td>
              </tr>
              `
                : ""}
              
              ${invoice.checksPayableTo
                ? `
              <tr>
                <td style="padding: 2px 0; font-size: 8px; line-height: 1.4; color: #111827;">
                  <strong style="font-weight: 600;">Make Checks Payable To:</strong> 
                  <strong style="font-weight: 600;">${invoice.checksPayableTo}</strong>
                </td>
              </tr>
              `
                : ""}
            </table>
          </td>
          </tr>
          `
            : ""}

          <!-- Footer -->
          <tr>
            <td style="padding: 12px 20px; border-top: 1px solid #111827; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #111827;">
                Thank you for choosing ${hotelInfo.name}! We hope to see you again soon.
              </p>
              <p style="margin: 0; font-size: 10px; color: #111827;">
                ${hotelInfo.name} Powered by <strong>Phoenix Global Solutions</strong>
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
