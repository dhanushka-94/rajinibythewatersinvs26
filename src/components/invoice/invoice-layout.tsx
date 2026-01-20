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
import { Building2, FileText, Wallet, Globe, Banknote, CreditCard, Calendar, User, Mail, Phone, MapPin, Building, IdCard, UserCircle, Hash } from "lucide-react";

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
        className={`${statusStyles[status] || "bg-gray-100 text-gray-800 border-gray-200"} text-xs print:text-[7pt] print:px-1.5 print:py-0.5`}
        style={{ fontSize: undefined }}
      >
        {statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto invoice-container print:p-0 print:max-w-full print:bg-white">
      {showHeader && (
        <div className="mb-6 print:mb-4 invoice-header">
          <div className="flex justify-between items-start mb-4 print:mb-2">
            <div className="flex-1">
              {hotelInfo && (
                <>
                  <div className="mb-2 print:mb-1">
                    <Image
                      src={hotelInfo.logoPath || "/images/rajini-logo-flat-color.png"}
                      alt={hotelInfo.name}
                      width={140}
                      height={56}
                      className="h-auto print:w-24 print:h-auto"
                      priority
                    />
                  </div>
                  <div className="text-xs text-gray-600 leading-tight print:text-[7pt] print:leading-tight space-y-1 print:space-y-0.5">
                    <div className="flex items-start gap-1.5 print:gap-1">
                      <MapPin className="h-3.5 w-3.5 text-gray-500 mt-0.5 print:h-2.5 print:w-2.5 flex-shrink-0" />
                      <p className="mb-0 print:mb-0">{hotelInfo.address}, {hotelInfo.city}, {hotelInfo.country}</p>
                    </div>
                    <div className="flex items-center gap-3 print:gap-2 flex-wrap">
                      {hotelInfo.hotline && (
                        <div className="flex items-center gap-1 print:gap-0.5">
                          <Phone className="h-3.5 w-3.5 text-gray-500 print:h-2.5 print:w-2.5" />
                          <span className="print:text-[7pt]">Hotline: {hotelInfo.hotline}</span>
                        </div>
                      )}
                      {hotelInfo.telephone && (
                        <div className="flex items-center gap-1 print:gap-0.5">
                          <Phone className="h-3.5 w-3.5 text-gray-500 print:h-2.5 print:w-2.5" />
                          <span className="print:text-[7pt]">Tel: {hotelInfo.telephone}</span>
                        </div>
                      )}
                      {hotelInfo.usaContact && (
                        <div className="flex items-center gap-1 print:gap-0.5">
                          <Phone className="h-3.5 w-3.5 text-gray-500 print:h-2.5 print:w-2.5" />
                          <span className="print:text-[7pt]">USA: {hotelInfo.usaContact}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 print:gap-2 flex-wrap">
                      {hotelInfo.email && (
                        <div className="flex items-center gap-1 print:gap-0.5">
                          <Mail className="h-3.5 w-3.5 text-gray-500 print:h-2.5 print:w-2.5" />
                          <span className="print:text-[7pt]">{hotelInfo.email}</span>
                        </div>
                      )}
                      {hotelInfo.website && (
                        <div className="flex items-center gap-1 print:gap-0.5">
                          <Globe className="h-3.5 w-3.5 text-gray-500 print:h-2.5 print:w-2.5" />
                          <span className="print:text-[7pt]">{hotelInfo.website}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="text-right ml-6 print:ml-4">
              <h2 className="text-xl font-bold mb-1 text-gray-900 print:text-[14pt] print:mb-0.5">INVOICE</h2>
              <p className="text-lg font-bold text-gray-900 mb-1 print:text-[12pt] print:mb-0.5">{invoice.invoiceNumber}</p>
              <div className="flex items-center justify-end gap-2 mb-1 print:mb-0.5 print:gap-1">
                <p className="text-xs text-gray-600 print:text-[7pt]">Currency: {invoice.currency}</p>
                {getStatusBadge(invoice.status)}
              </div>
              <p className="text-xs text-gray-600 print:text-[7pt]">
                Date: {new Date(invoice.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <Separator className="print:mt-2" />
        </div>
      )}

      {/* Bill To, Guest Information, and Booking Details - Dynamic columns */}
      <div className={`grid gap-6 mb-8 print:gap-4 print:mb-4 ${(invoice.billingType === "company" || (invoice.guests && invoice.guests.length > 0)) ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {/* Bill To Section */}
        <div className="break-inside-avoid">
          <h2 className="font-semibold text-lg mb-4 text-gray-900 print:text-base print:mb-2 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-gray-600 print:h-4 print:w-4" />
            Bill To:
          </h2>
          {invoice.billingType === "company" && travelCompany ? (
            <div className="space-y-2 text-sm print:text-xs">
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-gray-400 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                <p className="font-medium text-gray-900">{travelCompany.name}</p>
              </div>
              {travelCompany.contactPerson && (
                <div className="flex items-start gap-2">
                  <Hash className="h-4 w-4 text-gray-400 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                  <p className="text-gray-600">{travelCompany.contactPerson}</p>
                </div>
              )}
              {travelCompany.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-gray-400 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                  <p className="text-gray-600">{travelCompany.phone}</p>
                </div>
              )}
              {(travelCompany.address || travelCompany.city || travelCompany.country) && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                  <p className="text-gray-600">
                    {travelCompany.address}
                    {travelCompany.city && `, ${travelCompany.city}`}
                    {travelCompany.country && `, ${travelCompany.country}`}
                  </p>
                </div>
              )}
              {invoice.referenceNumber && (
                <div className="flex items-start gap-2">
                  <Hash className="h-4 w-4 text-gray-400 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                  <p className="text-gray-600"><span className="font-medium">Ref:</span> {invoice.referenceNumber}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 text-sm print:text-xs">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-gray-400 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                <p className="font-medium text-gray-900">{invoice.guest.name}</p>
              </div>
              {invoice.guest.email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-gray-400 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                  <p className="text-gray-600">{invoice.guest.email}</p>
                </div>
              )}
              {invoice.guest.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-gray-400 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                  <p className="text-gray-600">{invoice.guest.phone}</p>
                </div>
              )}
              {(invoice.guest.address || invoice.guest.city || invoice.guest.country) && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                  <p className="text-gray-600">
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
            <h3 className="font-semibold text-lg mb-4 text-gray-900 print:text-base print:mb-2 flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-gray-600 print:h-4 print:w-4" />
              Guest Information:
            </h3>
            <div className="space-y-1.5 text-sm print:text-xs">
              {/* Show primary guest if billing to company OR if there are additional guests */}
              {(invoice.billingType === "company" || (invoice.guests && invoice.guests.length > 0)) && invoice.guest.name && (
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-gray-400 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                  <p className="text-gray-600">{invoice.guest.name}</p>
                </div>
              )}
              {/* Show additional guests (only names) */}
              {invoice.guests && invoice.guests.length > 0 && (
                <>
                  {invoice.guests.map((guest, index) => (
                    guest.name && (
                      <div key={index} className="flex items-start gap-2">
                        <User className="h-4 w-4 text-gray-400 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                        <p className="text-gray-600">{guest.name}</p>
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
          <h3 className="font-semibold text-lg mb-4 text-gray-900 print:text-base print:mb-2 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600 print:h-4 print:w-4" />
            Booking Details:
          </h3>
          <div className="space-y-1.5 text-sm print:text-xs">
            {/* Line 1: Check-in and Check-out */}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div>
                <span className="font-medium text-gray-600">Check-in: </span>
                <span className="text-gray-900">
                  {new Date(invoice.checkIn).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Check-out: </span>
                <span className="text-gray-900">
                  {new Date(invoice.checkOut).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
            {/* Line 2: Room and Guests */}
            {(invoice.roomType || invoice.adults !== undefined || invoice.children !== undefined || invoice.babies !== undefined) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {invoice.roomType && (
                  <div>
                    <span className="font-medium text-gray-600">Room: </span>
                    <span className="text-gray-900">{invoice.roomType}</span>
                  </div>
                )}
                {(invoice.adults !== undefined || invoice.children !== undefined || invoice.babies !== undefined) && (
                  <div>
                    <span className="font-medium text-gray-600">Guests: </span>
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
      <Separator className="mb-8 print:mb-4" />

      <div className="mb-8 print:mb-4 invoice-items">
        <Table className="print:text-xs">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-900">Description</TableHead>
              <TableHead className="text-right font-semibold text-gray-900">Qty/Days</TableHead>
              <TableHead className="text-right font-semibold text-gray-900">Unit Price</TableHead>
              <TableHead className="text-right font-semibold text-gray-900">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item) => (
              <TableRow key={item.id} className="break-inside-avoid">
                <TableCell className="font-medium text-gray-900">
                  {item.description}
                </TableCell>
                <TableCell className="text-right text-gray-600">
                  {item.quantity} {item.quantityType === "days" ? "Days" : "Qty"}
                </TableCell>
                <TableCell className="text-right text-gray-600">
                  {formatCurrency(item.unitPrice, invoice.currency)}
                </TableCell>
                <TableCell className="text-right font-medium text-gray-900">
                  {formatCurrency(item.total, invoice.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end mb-6 print:mb-3 invoice-summary">
        <div className="w-80 space-y-1 print:w-64 print:space-y-0.5">
          <div className="flex justify-between text-sm print:text-xs">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium text-gray-900">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
          </div>
          {invoice.serviceCharge > 0 && (
            <div className="flex justify-between text-sm print:text-xs">
              <span className="text-gray-600">Service Charge ({invoice.serviceChargeRate}%):</span>
              <span className="font-medium text-gray-900">{formatCurrency(invoice.serviceCharge, invoice.currency)}</span>
            </div>
          )}
          {invoice.damageCharge > 0 && (
            <div className="flex justify-between text-sm print:text-xs">
              <span className="text-gray-600">Damage Charge:</span>
              <span className="font-medium text-gray-900 text-red-600">{formatCurrency(invoice.damageCharge, invoice.currency)}</span>
            </div>
          )}
          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm print:text-xs">
              <span className="text-gray-600">
                Discount {invoice.discountType === "percentage" ? `(${invoice.discount}%)` : "(Fixed)"}:
              </span>
              <span className="font-medium text-gray-900 text-green-600">
                -{formatCurrency(invoice.discount, invoice.currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm print:text-xs">
            <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
            <span className="font-medium text-gray-900">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
          </div>
          {invoice.priceAdjustment !== 0 && (
            <div className="flex justify-between text-sm print:text-xs">
              <span className="text-gray-600">
                Price Adjustment {invoice.priceAdjustmentReason && `(${invoice.priceAdjustmentReason})`}:
              </span>
              <span className={`font-medium text-gray-900 ${invoice.priceAdjustment > 0 ? "text-red-600" : "text-green-600"}`}>
                {invoice.priceAdjustment > 0 ? "+" : ""}{formatCurrency(invoice.priceAdjustment, invoice.currency)}
              </span>
            </div>
          )}
          <Separator className="my-1 print:my-0.5" />
          <div className="flex justify-between text-lg font-bold pt-1 print:text-base print:pt-0.5">
            <span className="text-gray-900">Total Amount:</span>
            <span className="text-gray-900">{formatCurrency(invoice.total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="mt-8 pt-6 border-t print:mt-4 print:pt-3">
          <h3 className="font-semibold text-sm mb-2 text-gray-900 print:text-xs print:mb-1">Notes:</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap print:text-xs">{invoice.notes}</p>
        </div>
      )}

      {(invoice.paymentMethods.length > 0 || invoice.selectedBankDetailId) && (
        <div className="mt-6 pt-4 border-t print:mt-4 print:pt-3">
          <h3 className="font-semibold text-base mb-3 text-gray-900 print:text-sm print:mb-2">Payment Information</h3>
          
          {invoice.paymentMethods.length > 0 && (
            <div className="mb-3 print:mb-2">
              <p className="text-xs font-medium text-gray-700 mb-1.5 print:text-xs print:mb-1">Accepted Payment Methods:</p>
              <div className="flex flex-wrap gap-1.5 print:gap-1">
                {invoice.paymentMethods.includes("bank_account") && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-md text-xs print:text-xs print:px-1.5 print:py-0.5">
                    <Building2 className="h-3.5 w-3.5 text-blue-600 print:h-2.5 print:w-2.5" />
                    <span className="text-gray-900">Bank Transfer/Deposit</span>
                  </div>
                )}
                {invoice.paymentMethods.includes("cheque") && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-md text-xs print:text-xs print:px-1.5 print:py-0.5">
                    <FileText className="h-3.5 w-3.5 text-green-600 print:h-2.5 print:w-2.5" />
                    <span className="text-gray-900">Cheque Payment</span>
                  </div>
                )}
                {invoice.paymentMethods.includes("online") && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 rounded-md text-xs print:text-xs print:px-1.5 print:py-0.5">
                    <Globe className="h-3.5 w-3.5 text-orange-600 print:h-2.5 print:w-2.5" />
                    <span className="text-gray-900">Online Payment</span>
                  </div>
                )}
                {invoice.paymentMethods.includes("cash") && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-md text-xs print:text-xs print:px-1.5 print:py-0.5">
                    <Banknote className="h-3.5 w-3.5 text-emerald-600 print:h-2.5 print:w-2.5" />
                    <span className="text-gray-900">Cash Payment</span>
                  </div>
                )}
                {invoice.paymentMethods.includes("card") && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 rounded-md text-xs print:text-xs print:px-1.5 print:py-0.5">
                    <CreditCard className="h-3.5 w-3.5 text-indigo-600 print:h-2.5 print:w-2.5" />
                    <span className="text-gray-900">
                      Card Payment{invoice.cardLast4Digits ? ` (****${invoice.cardLast4Digits})` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {invoice.checksPayableTo && (
            <div className="mb-3 p-2.5 bg-blue-50 rounded-lg border border-blue-200 print:p-2 print:mb-2">
              <p className="text-xs font-medium text-gray-700 mb-0.5 print:text-xs print:mb-0.5">Make Checks Payable To:</p>
              <p className="text-sm font-semibold text-gray-900 print:text-xs">{invoice.checksPayableTo}</p>
            </div>
          )}

          {bankDetails.length > 0 && (
            <div className={`p-2.5 bg-blue-50 rounded-md border-2 border-blue-200 print:p-2 print:bg-gray-50 print:border print:border-gray-300 ${bankDetails.length > 1 ? 'grid grid-cols-2 gap-3 print:gap-2.5' : ''}`}>
              {bankDetails.map((bankDetail, index) => (
                <div key={bankDetail.id || index} className={bankDetails.length > 1 ? 'border-r-2 border-blue-300 pr-3 print:border-r print:border-gray-300 print:pr-2.5 last:border-r-0 last:pr-0' : ''}>
                  {bankDetails.length > 1 && (
                    <h4 className="font-bold text-xs mb-1.5 text-blue-900 print:text-gray-900 print:mb-1 print:text-[8pt]">
                      Bank Transfer/Deposit Details #{index + 1}:
                    </h4>
                  )}
                  {bankDetails.length === 1 && (
                    <h4 className="font-bold text-xs mb-1.5 text-blue-900 print:text-gray-900 print:mb-1 print:text-[8pt]">
                      Bank Transfer/Deposit Details:
                    </h4>
                  )}
                  {bankDetails.length === 1 ? (
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] leading-tight print:text-[8pt] print:gap-x-2 print:gap-y-0.5">
                      <div>
                        <span className="font-semibold text-blue-800 print:text-gray-700">Account Name:</span>
                        <span className="text-blue-900 font-medium ml-1 print:text-gray-900">{bankDetail.accountName}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-blue-800 print:text-gray-700">Bank Name:</span>
                        <span className="text-blue-900 font-medium ml-1 print:text-gray-900">{bankDetail.bankName}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-blue-800 print:text-gray-700">Branch:</span>
                        <span className="text-blue-900 font-medium ml-1 print:text-gray-900">{bankDetail.branch}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-blue-800 print:text-gray-700">Account Number:</span>
                        <span className="text-blue-900 font-medium ml-1 print:text-gray-900">{bankDetail.accountNumber}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="font-semibold text-blue-800 print:text-gray-700">SWIFT Code:</span>
                        <span className="text-blue-900 font-medium ml-1 print:text-gray-900">{bankDetail.swiftCode}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-0.5 text-[11px] leading-tight print:text-[8pt] print:space-y-0">
                      <div className="flex flex-wrap gap-x-2.5 gap-y-0.5">
                        <span className="text-blue-900 font-medium print:text-gray-900"><span className="font-semibold text-blue-800 print:text-gray-700">Account Name:</span> {bankDetail.accountName}</span>
                        <span className="text-blue-900 font-medium print:text-gray-900"><span className="font-semibold text-blue-800 print:text-gray-700">Bank Name:</span> {bankDetail.bankName}</span>
                        <span className="text-blue-900 font-medium print:text-gray-900"><span className="font-semibold text-blue-800 print:text-gray-700">Branch:</span> {bankDetail.branch}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-2.5 gap-y-0.5">
                        <span className="text-blue-900 font-medium print:text-gray-900"><span className="font-semibold text-blue-800 print:text-gray-700">Account Number:</span> {bankDetail.accountNumber}</span>
                        <span className="text-blue-900 font-medium print:text-gray-900"><span className="font-semibold text-blue-800 print:text-gray-700">SWIFT Code:</span> {bankDetail.swiftCode}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {hotelInfo && (
        <div className="mt-12 pt-6 border-t print:mt-4 print:pt-3 hidden print:block">
          <div className="text-center mb-4 print:mb-2">
            <p className="text-sm font-semibold text-gray-900 mb-2 print:text-xs print:mb-1">{hotelInfo.name}</p>
            <div className="text-xs text-gray-600 space-y-1 print:text-[10px]">
              <p>{hotelInfo.address}, {hotelInfo.city}, {hotelInfo.country}</p>
              <p>
                Tel: {hotelInfo.telephone || ""} | Hotline: {hotelInfo.hotline || ""} | USA: {hotelInfo.usaContact || ""}
              </p>
              <p>Email: {hotelInfo.email || ""} | Website: {hotelInfo.website || ""}</p>
            </div>
          </div>
          <Separator className="my-4 print:my-2" />
        </div>
      )}
      
      {/* Thank you message - always visible */}
      {hotelInfo && (
        <div className="mt-8 pt-6 border-t print:mt-4 print:pt-3">
          <div className="text-center text-xs text-gray-500 print:text-[10px]">
            <p>Thank you for choosing {hotelInfo.name}! We hope to see you again soon.</p>
            <p className="mt-3 text-gray-400 print:mt-1">
              {hotelInfo.name} Powered by <span className="font-semibold text-gray-600">Phoenix Global Solutions</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
