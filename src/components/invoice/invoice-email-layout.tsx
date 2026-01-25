import { Invoice } from "@/types/invoice";
import { BankDetail } from "@/lib/bank-details";
import { getHotelInfo, type HotelInfo } from "@/lib/hotel-info";
import { formatCurrency } from "@/lib/currency";
import { getBankDetailById } from "@/lib/bank-details";
import { getTravelCompanyById } from "@/lib/travel-companies";
import { type TravelCompany } from "@/types/travel-company";
import { formatDateSL } from "@/lib/date-sl";
import { getAbsoluteLogoUrl } from "@/lib/email-image-url";

interface InvoiceEmailLayoutProps {
  invoice: Invoice;
  hotelInfo: HotelInfo;
  bankDetails: BankDetail[];
  travelCompany: TravelCompany | null;
}

/** Web invoice colors */
const C = {
  text: "#111827",
  textMuted: "#374151",
  bgHeader: "#f3f4f6",
  border: "#e5e7eb",
  white: "#ffffff",
} as const;

export function generateInvoiceEmailHtml({
  invoice,
  hotelInfo,
  bankDetails,
  travelCompany,
}: InvoiceEmailLayoutProps) {
  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      partially_paid: "Partially Paid",
      paid: "Paid",
      pending: "Pending",
      sent: "Sent",
      draft: "Draft",
      cancelled: "Cancelled",
    };
    return map[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
  };

  const logoUrl = getAbsoluteLogoUrl(hotelInfo?.logoPath);
  const hasGuestCol = invoice.billingType === "company" || (invoice.guests && invoice.guests.length > 0);
  const billToWidth = hasGuestCol ? "33%" : "50%";
  const bookWidth = hasGuestCol ? "34%" : "50%";

  const bankBlock = (b: BankDetail, i: number) => `
    <table cellpadding="0" cellspacing="0" border="0" style="font-size: 9px; line-height: 1.35; color: ${C.text};">
      <tr><td style="font-weight: 700; padding-bottom: 4px;">${bankDetails.length > 1 ? `Bank #${i + 1}:` : "Bank Details:"}</td></tr>
      <tr><td style="padding: 2px 0;"><strong>Bank:</strong> ${b.bankName}</td></tr>
      <tr><td style="padding: 2px 0;"><strong>Branch:</strong> ${b.branch}</td></tr>
      <tr><td style="padding: 2px 0;"><strong>Account:</strong> ${b.accountName}</td></tr>
      <tr><td style="padding: 2px 0;"><strong>A/C No:</strong> ${b.accountNumber}</td></tr>
      <tr><td style="padding: 2px 0;"><strong>Address:</strong> ${b.bankAddress}</td></tr>
      <tr><td style="padding: 2px 0;"><strong>SWIFT:</strong> ${b.swiftCode}</td></tr>
    </table>
  `;
  const bankTable =
    bankDetails.length > 0
      ? bankDetails.length > 1
        ? (() => {
            const rows: string[] = [];
            for (let i = 0; i < bankDetails.length; i += 2) {
              const left = bankBlock(bankDetails[i], i);
              const right = i + 1 < bankDetails.length ? bankBlock(bankDetails[i + 1], i + 1) : "";
              rows.push(`<tr><td width="50%" style="vertical-align: top; padding-right: 12px;">${left}</td><td width="50%" style="vertical-align: top; padding-left: 12px;">${right}</td></tr>`);
            }
            return `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tbody>${rows.join("")}</tbody></table>`;
          })()
        : bankBlock(bankDetails[0], 0)
      : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background-color: #f5f5f5; color: ${C.text};">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 672px; width: 100%; background-color: ${C.white}; border-collapse: collapse;">
          <!-- Header: same structure as web -->
          <tr>
            <td style="padding: 24px 24px 16px 24px; border-bottom: 1px solid ${C.border};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="60%" style="vertical-align: top;">
                    <img src="${logoUrl}" alt="${hotelInfo.name}" width="140" height="56" style="display: block; max-width: 140px; height: auto; margin-bottom: 12px;" />
                    <table cellpadding="0" cellspacing="0" border="0" style="font-size: 12px; line-height: 1.5; color: ${C.text};">
                      <tr><td style="padding-bottom: 4px;">${hotelInfo.address}, ${hotelInfo.city}, ${hotelInfo.country}</td></tr>
                      <tr><td style="padding-bottom: 4px;">${[hotelInfo.hotline && `Hotline: ${hotelInfo.hotline}`, hotelInfo.telephone && `Tel: ${hotelInfo.telephone}`, hotelInfo.usaContact && `USA: ${hotelInfo.usaContact}`].filter(Boolean).join(" | ")}</td></tr>
                      <tr><td>${[hotelInfo.email, hotelInfo.website].filter(Boolean).join(" | ")}</td></tr>
                    </table>
                  </td>
                  <td width="40%" style="vertical-align: top; text-align: right;">
                    <table cellpadding="0" cellspacing="0" border="0" align="right" style="font-size: 12px; color: ${C.text};">
                      <tr><td style="font-size: 20px; font-weight: bold; padding-bottom: 4px;">INVOICE</td></tr>
                      <tr><td style="font-size: 18px; font-weight: bold; padding-bottom: 4px;">${invoice.invoiceNumber}</td></tr>
                      <tr><td style="padding-bottom: 4px;">Currency: ${invoice.currency}</td></tr>
                      <tr><td style="padding-bottom: 4px;"><span style="display: inline-block; padding: 2px 8px; background-color: ${C.bgHeader}; border: 1px solid ${C.border}; border-radius: 4px; font-size: 11px;">${getStatusLabel(invoice.status)}</span></td></tr>
                      <tr><td>Date: ${formatDateSL(invoice.createdAt, { month: "long" })}</td></tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bill To, Guest, Booking -->
          <tr>
            <td style="padding: 16px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="${billToWidth}" style="vertical-align: top; padding-right: 16px;">
                    <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: ${C.text};">Bill To:</p>
                    ${invoice.billingType === "company" && travelCompany
                      ? `<table cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; line-height: 1.5; color: ${C.text};"><tr><td style="font-weight: 500;">${travelCompany.name}</td></tr>${travelCompany.contactPerson ? `<tr><td>${travelCompany.contactPersonTitle ? travelCompany.contactPersonTitle + " " : ""}${travelCompany.contactPerson}</td></tr>` : ""}${travelCompany.phone ? `<tr><td>${travelCompany.phone}</td></tr>` : ""}${travelCompany.address || travelCompany.city || travelCompany.country ? `<tr><td>${[travelCompany.address, travelCompany.city, travelCompany.country].filter(Boolean).join(", ")}</td></tr>` : ""}${invoice.referenceNumber ? `<tr><td><strong>Ref:</strong> ${invoice.referenceNumber}</td></tr>` : ""}</table>`
                      : `<table cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; line-height: 1.5; color: ${C.text};"><tr><td style="font-weight: 500;">${invoice.guest.title ? invoice.guest.title + " " : ""}${invoice.guest.name}</td></tr>${invoice.guest.email ? `<tr><td>${invoice.guest.email}</td></tr>` : ""}${invoice.guest.phone ? `<tr><td>${invoice.guest.phone}</td></tr>` : ""}${invoice.guest.address || invoice.guest.city || invoice.guest.country ? `<tr><td>${[invoice.guest.address, invoice.guest.city, invoice.guest.country].filter(Boolean).join(", ")}</td></tr>` : ""}</table>`
                    }
                  </td>
                  ${hasGuestCol ? `
                  <td width="33%" style="vertical-align: top; padding: 0 16px;">
                    <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: ${C.text};">Guest Information:</p>
                    <table cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; line-height: 1.5; color: ${C.text};">
                      ${(hasGuestCol && invoice.guest.name) ? `<tr><td>${invoice.guest.title ? invoice.guest.title + " " : ""}${invoice.guest.name}</td></tr>` : ""}
                      ${(invoice.guests || []).map((g) => (g.name ? `<tr><td>${g.title ? g.title + " " : ""}${g.name}</td></tr>` : "")).join("")}
                    </table>
                  </td>
                  ` : ""}
                  <td width="${bookWidth}" style="vertical-align: top; padding-left: 16px;">
                    <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: ${C.text};">Booking Details:</p>
                    <table cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; line-height: 1.5; color: ${C.text};">
                      <tr><td><strong>Check-in:</strong> ${formatDateSL(invoice.checkIn, { month: "long" })}</td></tr>
                      <tr><td><strong>Check-out:</strong> ${formatDateSL(invoice.checkOut, { month: "long" })}</td></tr>
                      ${invoice.roomType ? `<tr><td><strong>Room:</strong> ${invoice.roomType}</td></tr>` : ""}
                      ${invoice.adults !== undefined || invoice.children !== undefined || invoice.babies !== undefined ? `<tr><td><strong>Guests:</strong> ${[invoice.adults && invoice.adults > 0 ? `${invoice.adults} Adult(s)` : null, invoice.children && invoice.children > 0 ? `${invoice.children} Child(ren)` : null, invoice.babies && invoice.babies > 0 ? `${invoice.babies} Bab(y/ies)` : null].filter(Boolean).join(", ") || "N/A"}</td></tr>` : ""}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items table: headers same as Payment Information heading (14px), cells 12px -->
          <tr>
            <td style="padding: 0 24px 16px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; font-size: 12px; color: ${C.text};">
                <thead>
                  <tr style="background-color: ${C.bgHeader};">
                    <th style="text-align: left; padding: 10px 8px; font-weight: 600; font-size: 14px; border: 1px solid ${C.border};">Description</th>
                    <th style="text-align: right; padding: 10px 8px; font-weight: 600; font-size: 14px; border: 1px solid ${C.border};">Qty/Days</th>
                    <th style="text-align: right; padding: 10px 8px; font-weight: 600; font-size: 14px; border: 1px solid ${C.border};">Unit Price</th>
                    <th style="text-align: right; padding: 10px 8px; font-weight: 600; font-size: 14px; border: 1px solid ${C.border};">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.items
                    .map(
                      (item, i) => `
                  <tr>
                    <td style="padding: 10px 8px; border: 1px solid ${C.border}; font-weight: 500;">${item.description}</td>
                    <td style="padding: 10px 8px; border: 1px solid ${C.border}; text-align: right;">${item.quantity} ${item.quantityType === "days" ? "Days" : "Qty"}</td>
                    <td style="padding: 10px 8px; border: 1px solid ${C.border}; text-align: right;">${formatCurrency(item.unitPrice, invoice.currency)}</td>
                    <td style="padding: 10px 8px; border: 1px solid ${C.border}; text-align: right; font-weight: 500;">${formatCurrency(item.total, invoice.currency)}</td>
                  </tr>
                  `
                    )
                    .join("")}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Summary: match web (14px lines, 18px total) -->
          <tr>
            <td style="padding: 0 24px 16px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" align="right" style="max-width: 320px; margin-left: auto; font-size: 14px; color: ${C.text};">
                <tr><td style="padding: 2px 0;">Subtotal:</td><td style="text-align: right; font-weight: 500;">${formatCurrency(invoice.subtotal, invoice.currency)}</td></tr>
                ${invoice.serviceCharge > 0 ? `<tr><td style="padding: 2px 0;">Service Charge (${invoice.serviceChargeRate}%):</td><td style="text-align: right; font-weight: 500;">${formatCurrency(invoice.serviceCharge, invoice.currency)}</td></tr>` : ""}
                ${invoice.damageCharge > 0 ? `<tr><td style="padding: 2px 0;">Damage Charge:</td><td style="text-align: right; font-weight: 500;">${formatCurrency(invoice.damageCharge, invoice.currency)}</td></tr>` : ""}
                ${invoice.discount > 0 ? `<tr><td style="padding: 2px 0;">Discount ${invoice.discountType === "percentage" ? `(${invoice.discount}%)` : "(Fixed)"}:</td><td style="text-align: right; font-weight: 500;">-${formatCurrency(invoice.discount, invoice.currency)}</td></tr>` : ""}
                <tr><td style="padding: 2px 0;">Tax (${invoice.taxRate}%):</td><td style="text-align: right; font-weight: 500;">${formatCurrency(invoice.taxAmount, invoice.currency)}</td></tr>
                ${invoice.priceAdjustment !== 0 ? `<tr><td style="padding: 2px 0;">Price Adjustment${invoice.priceAdjustmentReason ? ` (${invoice.priceAdjustmentReason})` : ""}:</td><td style="text-align: right; font-weight: 500;">${invoice.priceAdjustment > 0 ? "+" : ""}${formatCurrency(invoice.priceAdjustment, invoice.currency)}</td></tr>` : ""}
                <tr><td colspan="2" style="border-top: 1px solid ${C.text}; padding-top: 6px;"></td></tr>
                <tr><td style="padding-top: 4px; font-size: 18px; font-weight: bold;">Total Amount:</td><td style="text-align: right; padding-top: 4px; font-size: 18px; font-weight: bold;">${formatCurrency(invoice.total, invoice.currency)}</td></tr>
              </table>
            </td>
          </tr>

          ${invoice.notes ? `
          <tr>
            <td style="padding: 16px 24px; border-top: 1px solid ${C.border};">
              <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${C.text};">Notes:</p>
              <p style="margin: 0; font-size: 14px; color: ${C.text}; white-space: pre-wrap;">${invoice.notes}</p>
            </td>
          </tr>
          ` : ""}

          ${invoice.paymentMethods.length > 0 || bankDetails.length > 0 ? `
          <tr>
            <td style="padding: 12px 24px 16px 24px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: ${C.text}; background-color: ${C.bgHeader}; padding: 6px 8px;">Payment Information</p>
              ${invoice.paymentMethods.length > 0 ? `<p style="margin: 0 0 8px 0; font-size: 10px; line-height: 1.4; color: ${C.text};"><strong>Payment Methods:</strong> ${[invoice.paymentMethods.includes("bank_account") && "Bank Transfer/Wire/Deposit", invoice.paymentMethods.includes("cheque") && "Cheque", invoice.paymentMethods.includes("online") && "Online", invoice.paymentMethods.includes("cash") && "Cash", invoice.paymentMethods.includes("card") && `Card${invoice.cardLast4Digits ? ` (****${invoice.cardLast4Digits})` : ""}`].filter(Boolean).join(", ")}</p>` : ""}
              ${bankTable}
              ${invoice.checksPayableTo ? `<p style="margin: 8px 0 0 0; font-size: 10px; color: ${C.text};"><strong>Make Checks Payable To:</strong> ${invoice.checksPayableTo}</p>` : ""}
            </td>
          </tr>
          ` : ""}

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 24px; border-top: 1px solid ${C.border}; text-align: center; font-size: 12px; color: ${C.text};">
              <p style="margin: 0 0 4px 0;">Thank you for choosing ${hotelInfo.name}! We hope to see you again soon.</p>
              <p style="margin: 0;">${hotelInfo.name} Powered by <strong>Phoenix Global Solutions</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function generateInvoiceEmailHtmlFromInvoice(invoice: Invoice): Promise<string> {
  const hotelInfo = await getHotelInfo();
  const bankIds = invoice.selectedBankDetailIds || (invoice.selectedBankDetailId ? [invoice.selectedBankDetailId] : []);
  const bankDetails = bankIds.length > 0
    ? (await Promise.all(bankIds.map((id) => getBankDetailById(id)))).filter((b): b is BankDetail => b != null)
    : [];
  let travelCompany: TravelCompany | null = null;
  if (invoice.billingType === "company" && invoice.travelCompanyId) {
    travelCompany = (await getTravelCompanyById(invoice.travelCompanyId)) || null;
  }
  return generateInvoiceEmailHtml({ invoice, hotelInfo, bankDetails, travelCompany });
}
