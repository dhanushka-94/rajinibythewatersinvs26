"use client";

import { useState, useEffect } from "react";
import { Invoice } from "@/types/invoice";
import { BankDetail } from "@/lib/bank-details";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { getHotelInfo, type HotelInfo } from "@/lib/hotel-info";
import { formatCurrency } from "@/lib/currency";
import { getBankDetailById } from "@/lib/bank-details";
import { getTravelCompanyById } from "@/lib/travel-companies";
import { type TravelCompany } from "@/types/travel-company";
import { formatDateSL } from "@/lib/date-sl";
import { Building2, FileText, Wallet, Globe, Banknote, CreditCard, Calendar, User, Mail, Phone, MapPin, Building, IdCard, UserCircle, LogIn, LogOut, Users } from "lucide-react";

interface InvoiceLayoutProps {
  invoice: Invoice;
  showHeader?: boolean;
}

export function InvoiceLayout({ invoice, showHeader = true }: InvoiceLayoutProps) {
  const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null);
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [travelCompany, setTravelCompany] = useState<TravelCompany | null>(null);

  useEffect(() => {
    const loadHotelInfo = async () => {
      const info = await getHotelInfo();
      setHotelInfo(info);
    };
    const loadBankDetails = async () => {
      const bankIds = invoice.selectedBankDetailIds || (invoice.selectedBankDetailId ? [invoice.selectedBankDetailId] : []);
      if (bankIds.length > 0) {
        const banks = await Promise.all(
          bankIds.map(async (id) => {
            const bank = await getBankDetailById(id);
            return bank;
          })
        );
        setBankDetails(banks.filter((b): b is BankDetail => b !== null));
      } else {
        setBankDetails([]);
      }
    };
    const loadTravelCompany = async () => {
      if (invoice.billingType === "company" && invoice.travelCompanyId) {
        const company = await getTravelCompanyById(invoice.travelCompanyId);
        setTravelCompany(company || null);
      }
    };
    loadHotelInfo();
    loadBankDetails();
    loadTravelCompany();
  }, [invoice.selectedBankDetailIds, invoice.selectedBankDetailId, invoice.billingType, invoice.travelCompanyId]);

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      paid: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
      partially_paid: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
      sent: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
      draft: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
    };
    
    const statusLabels: Record<string, string> = {
      partially_paid: "Partially Paid",
    };

    return (
      <Badge 
        variant="outline" 
        className={`${statusStyles[status] || "bg-gray-100 text-gray-800 border-gray-200"} text-[10px] print:text-[7pt] print:px-1.5 print:py-0.5`}
        style={{ fontSize: undefined }}
      >
        {statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <div className="bg-white p-6 max-w-4xl mx-auto invoice-container print:p-0 print:max-w-full print:bg-white text-gray-900 antialiased">
      {showHeader && (
        <div className="mb-4 print:mb-3 invoice-header">
          <div className="flex justify-between items-start mb-3 print:mb-2">
            <div className="flex-1">
              {hotelInfo && (
                <>
                  <div className="mb-1.5 print:mb-1">
                    <Image
                      src={hotelInfo.logoPath || "/images/rajini-logo-flat-color.png"}
                      alt={hotelInfo.name}
                      width={140}
                      height={56}
                      className="h-auto print:w-24 print:h-auto"
                      priority
                    />
                  </div>
                  <div className="text-[11px] text-gray-900 leading-snug print:text-[8pt] print:leading-tight space-y-0.5 print:space-y-0.5">
                    <div className="flex items-start gap-1.5 print:gap-1">
                      <MapPin className="h-3.5 w-3.5 text-gray-600 mt-0.5 print:h-2.5 print:w-2.5 flex-shrink-0" />
                      <p className="mb-0 print:mb-0">{hotelInfo.address}, {hotelInfo.city}, {hotelInfo.country}</p>
                    </div>
                    <div className="flex items-center gap-3 print:gap-2 flex-wrap">
                      {hotelInfo.hotline && (
                        <div className="flex items-center gap-1 print:gap-0.5">
                          <Phone className="h-3.5 w-3.5 text-gray-600 print:h-2.5 print:w-2.5" />
                          <span className="print:text-[8pt]">Hotline: {hotelInfo.hotline}</span>
                        </div>
                      )}
                      {hotelInfo.telephone && (
                        <div className="flex items-center gap-1 print:gap-0.5">
                          <Phone className="h-3.5 w-3.5 text-gray-600 print:h-2.5 print:w-2.5" />
                          <span className="print:text-[8pt]">Tel: {hotelInfo.telephone}</span>
                        </div>
                      )}
                      {hotelInfo.usaContact && (
                        <div className="flex items-center gap-1 print:gap-0.5">
                          <Phone className="h-3.5 w-3.5 text-gray-600 print:h-2.5 print:w-2.5" />
                          <span className="print:text-[8pt]">USA: {hotelInfo.usaContact}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 print:gap-2 flex-wrap">
                      {hotelInfo.email && (
                        <div className="flex items-center gap-1 print:gap-0.5">
                          <Mail className="h-3.5 w-3.5 text-gray-600 print:h-2.5 print:w-2.5" />
                          <span className="print:text-[8pt]">{hotelInfo.email}</span>
                        </div>
                      )}
                      {hotelInfo.website && (
                        <div className="flex items-center gap-1 print:gap-0.5">
                          <Globe className="h-3.5 w-3.5 text-gray-600 print:h-2.5 print:w-2.5" />
                          <span className="print:text-[8pt]">{hotelInfo.website}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="text-right ml-6 print:ml-4">
              <h2 className="text-2xl font-bold tracking-tight mb-0.5 text-gray-900 print:text-[14pt] print:mb-0.5">INVOICE</h2>
              <p className="text-base font-bold text-gray-900 mb-0.5 print:text-[12pt] print:mb-0.5">{invoice.invoiceNumber}</p>
              <div className="flex items-center justify-end gap-2 mb-0.5 print:mb-0.5 print:gap-1">
                <p className="text-[11px] text-gray-900 print:text-[8pt]">Currency: {invoice.currency}</p>
                {getStatusBadge(invoice.status)}
              </div>
              <p className="text-[11px] text-gray-900 print:text-[8pt]">
                Date: {formatDateSL(invoice.createdAt, { month: "long" })}
              </p>
            </div>
          </div>
          <Separator className="print:mt-1" />
        </div>
      )}

      {/* Bill To, Guest Information, and Booking Details - Dynamic columns */}
      <div className={`grid gap-4 mb-4 print:gap-3 print:mb-3 ${(invoice.billingType === "company" || (invoice.guests && invoice.guests.length > 0)) ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {/* Bill To Section */}
        <div className="break-inside-avoid">
          <h2 className="font-semibold text-sm mb-2 text-gray-900 print:text-[10pt] print:mb-1.5 flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-gray-700 print:h-3.5 print:w-3.5" />
            Bill To:
          </h2>
          {invoice.billingType === "company" && travelCompany ? (
            <div className="space-y-1 text-[13px] leading-snug print:text-[9pt]">
              <div className="flex items-start gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-gray-900 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                <p className="font-medium text-gray-900">{travelCompany.name}</p>
              </div>
              {travelCompany.contactPerson && (
                <div className="flex items-start gap-1.5">
                  <User className="h-3.5 w-3.5 text-gray-900 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                  <p className="text-gray-900">{travelCompany.contactPersonTitle ? `${travelCompany.contactPersonTitle} ` : ''}{travelCompany.contactPerson}</p>
                </div>
              )}
              {travelCompany.phone && (
                <div className="flex items-start gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-gray-900 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                  <p className="text-gray-900">{travelCompany.phone}</p>
                </div>
              )}
              {(travelCompany.address || travelCompany.city || travelCompany.country) && (
                <div className="flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gray-900 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                  <p className="text-gray-900">
                    {travelCompany.address}
                    {travelCompany.city && `, ${travelCompany.city}`}
                    {travelCompany.country && `, ${travelCompany.country}`}
                  </p>
                </div>
              )}
              {invoice.referenceNumber && (
                <div className="flex items-start gap-1.5">
                  <p className="text-gray-900"><span className="font-medium">Ref:</span> {invoice.referenceNumber}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1 text-[13px] leading-snug print:text-[9pt]">
              <div className="flex items-start gap-1.5">
                <User className="h-3.5 w-3.5 text-gray-700 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                <p className="font-medium text-gray-900">{invoice.guest.title ? `${invoice.guest.title} ` : ''}{invoice.guest.name}</p>
              </div>
              {invoice.guest.email && (
                <div className="flex items-start gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-gray-900 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                  <p className="text-gray-900">{invoice.guest.email}</p>
                </div>
              )}
              {invoice.guest.phone && (
                <div className="flex items-start gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-gray-900 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                  <p className="text-gray-900">{invoice.guest.phone}</p>
                </div>
              )}
              {(invoice.guest.address || invoice.guest.city || invoice.guest.country) && (
                <div className="flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gray-900 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                  <p className="text-gray-900">
                    {invoice.guest.address}
                    {invoice.guest.city && `, ${invoice.guest.city}`}
                    {invoice.guest.country && `, ${invoice.guest.country}`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Guest Information Section - Only show if there's content */}
        {(invoice.billingType === "company" || (invoice.guests && invoice.guests.length > 0)) && (
          <div className="break-inside-avoid">
            <h3 className="font-semibold text-sm mb-2 text-gray-900 print:text-[10pt] print:mb-1.5 flex items-center gap-1.5">
              <UserCircle className="h-4 w-4 text-gray-700 print:h-3.5 print:w-3.5" />
              Guest Information:
            </h3>
            <div className="space-y-1 text-[13px] leading-snug print:text-[9pt]">
              {/* Show primary guest if billing to company OR if there are additional guests */}
              {(invoice.billingType === "company" || (invoice.guests && invoice.guests.length > 0)) && invoice.guest.name && (
                <div className="flex items-start gap-1.5">
                  <User className="h-3.5 w-3.5 text-gray-900 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                  <p className="text-gray-900">{invoice.guest.title ? `${invoice.guest.title} ` : ''}{invoice.guest.name}</p>
                </div>
              )}
              {/* Show additional guests (only names) */}
              {invoice.guests && invoice.guests.length > 0 && (
                <>
                  {invoice.guests.map((guest, index) => (
                    guest.name && (
                      <div key={index} className="flex items-start gap-1.5">
                        <User className="h-3.5 w-3.5 text-gray-900 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                        <p className="text-gray-900">{guest.title ? `${guest.title} ` : ''}{guest.name}</p>
                      </div>
                    )
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Booking Details Section */}
        <div className="break-inside-avoid">
          <h3 className="font-semibold text-sm mb-2 text-gray-900 print:text-[10pt] print:mb-1.5 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-gray-700 print:h-3.5 print:w-3.5" />
            Booking Details:
          </h3>
          <div className="space-y-1 text-[13px] leading-snug print:text-[9pt]">
            {/* Line 1: Check-in and Check-out */}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
              <div className="flex items-center gap-1">
                <LogIn className="h-3.5 w-3.5 text-gray-900 print:h-3 print:w-3 flex-shrink-0" />
                <span className="font-medium text-gray-900">Check-in: </span>
                <span className="text-gray-900">
                  {formatDateSL(invoice.checkIn)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <LogOut className="h-3.5 w-3.5 text-gray-900 print:h-3 print:w-3 flex-shrink-0" />
                <span className="font-medium text-gray-900">Check-out: </span>
                <span className="text-gray-900">
                  {formatDateSL(invoice.checkOut)}
                </span>
              </div>
            </div>
            {/* Line 2: Room and Guests */}
            {(invoice.roomType || invoice.adults !== undefined || invoice.children !== undefined || invoice.babies !== undefined) && (
              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                {invoice.roomType && (
                  <div>
                    <span className="font-medium text-gray-900">Room: </span>
                    <span className="text-gray-900">{invoice.roomType}</span>
                  </div>
                )}
                {(invoice.adults !== undefined || invoice.children !== undefined || invoice.babies !== undefined) && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-gray-900 print:h-3 print:w-3 flex-shrink-0" />
                    <span className="font-medium text-gray-900">Guests: </span>
                    <span className="text-gray-900">
                      {[
                        invoice.adults !== undefined && invoice.adults > 0 ? `${invoice.adults} Adult${invoice.adults !== 1 ? 's' : ''}` : null,
                        invoice.children !== undefined && invoice.children > 0 ? `${invoice.children} Child${invoice.children !== 1 ? 'ren' : ''}` : null,
                        invoice.babies !== undefined && invoice.babies > 0 ? `${invoice.babies} Bab${invoice.babies !== 1 ? 'ies' : 'y'}` : null,
                      ].filter(Boolean).join(', ') || 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4 print:mb-3 invoice-items">
        <Table className="border border-white">
          <TableHeader>
            <TableRow className="bg-gray-100 border-b border-white">
              <TableHead className="font-semibold text-gray-900 border-r border-white bg-gray-100 text-xs print:text-[9pt]">Description</TableHead>
              <TableHead className="text-right font-semibold text-gray-900 border-r border-white bg-gray-100 text-xs print:text-[9pt]">Qty/Days</TableHead>
              <TableHead className="text-right font-semibold text-gray-900 border-r border-white bg-gray-100 text-xs print:text-[9pt]">Unit Price</TableHead>
              <TableHead className="text-right font-semibold text-gray-900 bg-gray-100 text-xs print:text-[9pt]">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item, index) => (
              <TableRow key={item.id} className={`break-inside-avoid ${index < invoice.items.length - 1 ? 'border-b border-white' : ''}`}>
                <TableCell className="font-medium text-gray-900 border-r border-white text-[11px] print:text-[9pt]">
                  {item.description}
                </TableCell>
                <TableCell className="text-right text-gray-900 border-r border-white text-[11px] print:text-[9pt]">
                  {item.quantity} {item.quantityType === "days" ? "Days" : "Qty"}
                </TableCell>
                <TableCell className="text-right text-gray-900 border-r border-white text-[11px] print:text-[9pt]">
                  {formatCurrency(item.unitPrice, invoice.currency)}
                </TableCell>
                <TableCell className="text-right font-medium text-gray-900 text-[11px] print:text-[9pt]">
                  {formatCurrency(item.total, invoice.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end mb-4 print:mb-3 invoice-summary w-full">
        <div className="w-80 space-y-0.5 print:w-64 print:space-y-0.5 pr-2 print:pr-[6px] min-w-0">
          <div className="flex justify-between text-[13px] print:text-[9pt]">
            <span className="text-gray-900">Subtotal:</span>
            <span className="font-medium text-gray-900">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
          </div>
          {invoice.serviceCharge > 0 && (
            <div className="flex justify-between text-[13px] print:text-[9pt]">
              <span className="text-gray-900">Service Charge ({invoice.serviceChargeRate}%):</span>
              <span className="font-medium text-gray-900">{formatCurrency(invoice.serviceCharge, invoice.currency)}</span>
            </div>
          )}
          {invoice.damageCharge > 0 && (
            <div className="flex justify-between text-[13px] print:text-[9pt]">
              <span className="text-gray-900">Damage Charge:</span>
              <span className="font-medium text-gray-900">{formatCurrency(invoice.damageCharge, invoice.currency)}</span>
            </div>
          )}
          {invoice.discount > 0 && (
            <div className="flex justify-between text-[13px] print:text-[9pt]">
              <span className="text-gray-900">
                Discount {invoice.discountType === "percentage" ? `(${invoice.discount}%)` : "(Fixed)"}:
              </span>
              <span className="font-medium text-gray-900">
                -{formatCurrency(invoice.discount, invoice.currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-[13px] print:text-[9pt]">
            <span className="text-gray-900">Tax ({invoice.taxRate}%):</span>
            <span className="font-medium text-gray-900">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
          </div>
          {invoice.priceAdjustment !== 0 && (
            <div className="flex justify-between text-[13px] print:text-[9pt]">
              <span className="text-gray-900">
                Price Adjustment {invoice.priceAdjustmentReason && `(${invoice.priceAdjustmentReason})`}:
              </span>
              <span className="font-medium text-gray-900">
                {invoice.priceAdjustment > 0 ? "+" : ""}{formatCurrency(invoice.priceAdjustment, invoice.currency)}
              </span>
            </div>
          )}
          <Separator className="my-0.5 print:my-0.5" />
          <div className="flex justify-between text-base font-bold pt-0.5 print:text-[11pt] print:pt-0.5">
            <span className="text-gray-900">Total Amount:</span>
            <span className="text-gray-900">{formatCurrency(invoice.total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="mt-4 pt-3 border-t border-gray-900 print:mt-3 print:pt-2">
          <h3 className="font-semibold text-sm mb-1 text-gray-900 print:text-[9pt] print:mb-0.5">Notes:</h3>
          <p className="text-[13px] text-gray-900 whitespace-pre-wrap leading-snug print:text-[9pt]">{invoice.notes}</p>
        </div>
      )}

      {(invoice.paymentMethods.length > 0 || bankDetails.length > 0) && (
        <div className="mt-3 print:mt-2">
          <h3 className="font-semibold text-xs mb-1.5 text-gray-900 print:text-[9pt] print:mb-1 bg-gray-100 px-3 py-1.5 print:px-2 print:py-1">Payment Information</h3>
          
          <div className="space-y-1.5 print:space-y-1">
            {invoice.paymentMethods.length > 0 && (
              <div>
                <span className="text-[11px] font-medium text-gray-900 print:text-[9pt]">Payment Methods: </span>
                <span className="text-[11px] text-gray-900 print:text-[9pt]">
                  {[
                    invoice.paymentMethods.includes("bank_account") && "Bank Transfer/Wire/Deposit",
                    invoice.paymentMethods.includes("cheque") && "Cheque",
                    invoice.paymentMethods.includes("online") && "Online",
                    invoice.paymentMethods.includes("cash") && "Cash",
                    invoice.paymentMethods.includes("card") && `Card${invoice.cardLast4Digits ? ` (****${invoice.cardLast4Digits})` : ''}`
                  ].filter(Boolean).join(", ")}
                </span>
              </div>
            )}

            {bankDetails.length > 0 && (
              <div className={`${bankDetails.length > 1 ? 'grid grid-cols-2 gap-3 print:gap-2' : ''}`}>
                {bankDetails.map((bankDetail, index) => (
                  <div key={bankDetail.id || index}>
                    {bankDetails.length > 1 && (
                      <div className="text-[11px] font-bold text-gray-900 mb-0.5 print:text-[9pt] print:mb-0">
                        Bank #{index + 1}:
                      </div>
                    )}
                    {bankDetails.length === 1 && (
                      <div className="text-[11px] font-bold text-gray-900 mb-0.5 print:text-[9pt] print:mb-0">
                        Bank Details:
                      </div>
                    )}
                    <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0 text-[11px] leading-tight print:text-[9pt] print:gap-x-1.5">
                      <span className="font-semibold text-gray-900">Bank:</span>
                      <span className="text-gray-900">{bankDetail.bankName}</span>
                      <span className="font-semibold text-gray-900">Branch:</span>
                      <span className="text-gray-900">{bankDetail.branch}</span>
                      <span className="font-semibold text-gray-900">Account:</span>
                      <span className="text-gray-900">{bankDetail.accountName}</span>
                      <span className="font-semibold text-gray-900">A/C No:</span>
                      <span className="text-gray-900">{bankDetail.accountNumber}</span>
                      <span className="font-semibold text-gray-900">Address:</span>
                      <span className="text-gray-900">{bankDetail.bankAddress}</span>
                      <span className="font-semibold text-gray-900">SWIFT:</span>
                      <span className="text-gray-900">{bankDetail.swiftCode}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {invoice.checksPayableTo && (
              <div>
                <span className="text-[11px] font-medium text-gray-900 print:text-[9pt]">Make Checks Payable To: </span>
                <span className="text-[11px] font-semibold text-gray-900 print:text-[9pt]">{invoice.checksPayableTo}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      {hotelInfo && (
        <div className="mt-6 pt-3 border-t border-gray-900 print:mt-4 print:pt-2 invoice-footer">
          <div className="text-center text-[11px] text-gray-900 print:text-[8pt] leading-snug">
            <p className="mb-1 print:mb-0.5">Thank you for choosing {hotelInfo.name}! We hope to see you again soon.</p>
            <p className="text-gray-900 print:mt-0.5">
              {hotelInfo.name} Powered by <span className="font-semibold">Phoenix Global Solutions</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
