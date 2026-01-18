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
import { hotelInfo } from "@/lib/hotel-info";
import { formatCurrency } from "@/lib/currency";
import { getBankDetailById } from "@/lib/bank-details";
import { getTravelCompanyById } from "@/lib/travel-companies";
import { type TravelCompany } from "@/types/travel-company";
import { Building2, FileText, Wallet, Globe, Banknote, CreditCard, Calendar, User, Mail, Phone, MapPin, Building, IdCard, UserCircle } from "lucide-react";

interface InvoiceLayoutProps {
  invoice: Invoice;
  showHeader?: boolean;
}

export function InvoiceLayout({ invoice, showHeader = true }: InvoiceLayoutProps) {
  const [bankDetail, setBankDetail] = useState<BankDetail | null>(null);
  const [travelCompany, setTravelCompany] = useState<TravelCompany | null>(null);

  useEffect(() => {
    const loadBankDetail = async () => {
      if (invoice.selectedBankDetailId) {
        const bank = await getBankDetailById(invoice.selectedBankDetailId);
        setBankDetail(bank || null);
      }
    };
    const loadTravelCompany = async () => {
      if (invoice.billingType === "company" && invoice.travelCompanyId) {
        const company = await getTravelCompanyById(invoice.travelCompanyId);
        setTravelCompany(company || null);
      }
    };
    loadBankDetail();
    loadTravelCompany();
  }, [invoice.selectedBankDetailId, invoice.billingType, invoice.travelCompanyId]);

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
              <div className="mb-2 print:mb-1">
                <Image
                  src={hotelInfo.logoPath}
                  alt={hotelInfo.name}
                  width={140}
                  height={56}
                  className="h-auto print:w-24 print:h-auto"
                  priority
                />
              </div>
              <div className="text-xs text-gray-600 leading-tight print:text-[7pt] print:leading-tight">
                <p className="mb-0.5 print:mb-0">{hotelInfo.address}, {hotelInfo.city}, {hotelInfo.country}</p>
                <p className="mb-0.5 print:mb-0">Tel: {hotelInfo.telephone} | Hotline: {hotelInfo.hotline} | USA: {hotelInfo.usaContact}</p>
                <p className="mb-0 print:mb-0">Email: {hotelInfo.email} | Web: {hotelInfo.website}</p>
              </div>
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

      {/* Booking Details - One line, no title */}
      <div className="mb-6 print:mb-4">
        <div className="flex items-center gap-6 text-sm print:text-xs print:gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="h-4 w-4 text-gray-500 print:h-3 print:w-3" />
            <span className="font-medium text-gray-600">Check-in:</span>
            <span className="font-semibold text-gray-900">
              {new Date(invoice.checkIn).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="h-4 w-4 text-gray-500 print:h-3 print:w-3" />
            <span className="font-medium text-gray-600">Check-out:</span>
            <span className="font-semibold text-gray-900">
              {new Date(invoice.checkOut).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          {invoice.roomType && (
            <div className="flex items-center gap-2 text-gray-700">
              <Building className="h-4 w-4 text-gray-500 print:h-3 print:w-3" />
              <span className="font-medium text-gray-600">Room:</span>
              <span className="font-semibold text-gray-900">{invoice.roomType}</span>
            </div>
          )}
        </div>
      </div>
      <Separator className="mb-6 print:mb-4" />

      {/* Bill To and Guest Information - Side by side */}
      <div className="grid grid-cols-2 gap-8 mb-8 print:gap-4 print:mb-4">
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
                  <UserCircle className="h-4 w-4 text-gray-400 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                  <p className="text-gray-600">Contact: {travelCompany.contactPerson}</p>
                </div>
              )}
              {travelCompany.email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-gray-400 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                  <p className="text-gray-600">{travelCompany.email}</p>
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
              {travelCompany.taxId && (
                <div className="flex items-start gap-2">
                  <IdCard className="h-4 w-4 text-gray-400 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                  <p className="text-gray-600">Tax ID: {travelCompany.taxId}</p>
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

        {invoice.billingType === "company" && (
          <div className="break-inside-avoid">
            <h3 className="font-semibold text-lg mb-4 text-gray-900 print:text-base print:mb-2 flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-gray-600 print:h-4 print:w-4" />
              Guest Information:
            </h3>
            <div className="space-y-2 text-sm print:text-xs">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-gray-400 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                <p className="text-gray-600">{invoice.guest.name}</p>
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
              {invoice.guest.idNumber && (
                <div className="flex items-start gap-2">
                  <IdCard className="h-4 w-4 text-gray-400 mt-0.5 print:h-3 print:w-3 flex-shrink-0" />
                  <p className="text-gray-600">ID: {invoice.guest.idNumber}</p>
                </div>
              )}
            </div>
          </div>
        )}
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
                <TableCell className="text-right text-gray-600">{item.quantity}</TableCell>
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

      <div className="flex justify-end mb-8 print:mb-4 invoice-summary">
        <div className="w-80 space-y-3 print:w-64 print:space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium text-gray-900">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
          </div>
          {invoice.serviceCharge > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service Charge ({invoice.serviceChargeRate}%):</span>
              <span className="font-medium text-gray-900">{formatCurrency(invoice.serviceCharge, invoice.currency)}</span>
            </div>
          )}
          {invoice.damageCharge > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Damage Charge:</span>
              <span className="font-medium text-gray-900 text-red-600">{formatCurrency(invoice.damageCharge, invoice.currency)}</span>
            </div>
          )}
          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Discount {invoice.discountType === "percentage" ? `(${invoice.discount}%)` : "(Fixed)"}:
              </span>
              <span className="font-medium text-gray-900 text-green-600">
                -{formatCurrency(invoice.discount, invoice.currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
            <span className="font-medium text-gray-900">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
          </div>
          {invoice.priceAdjustment !== 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Price Adjustment {invoice.priceAdjustmentReason && `(${invoice.priceAdjustmentReason})`}:
              </span>
              <span className={`font-medium text-gray-900 ${invoice.priceAdjustment > 0 ? "text-red-600" : "text-green-600"}`}>
                {invoice.priceAdjustment > 0 ? "+" : ""}{formatCurrency(invoice.priceAdjustment, invoice.currency)}
              </span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-xl font-bold pt-2">
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
        <div className="mt-8 pt-6 border-t print:mt-4 print:pt-3">
          <h3 className="font-semibold text-lg mb-4 text-gray-900 print:text-base print:mb-2">Payment Information</h3>
          
          {invoice.paymentMethods.length > 0 && (
            <div className="mb-4 print:mb-2">
              <p className="text-sm font-medium text-gray-700 mb-2 print:text-xs print:mb-1">Accepted Payment Methods:</p>
              <div className="flex flex-wrap gap-2 print:gap-1">
                {invoice.paymentMethods.includes("bank_account") && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-md text-sm print:text-xs print:px-2 print:py-1">
                    <Building2 className="h-4 w-4 text-blue-600 print:h-3 print:w-3" />
                    <span className="text-gray-900">Bank Transfer/Deposit</span>
                  </div>
                )}
                {invoice.paymentMethods.includes("cheque") && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-md text-sm print:text-xs print:px-2 print:py-1">
                    <FileText className="h-4 w-4 text-green-600 print:h-3 print:w-3" />
                    <span className="text-gray-900">Cheque Payment</span>
                  </div>
                )}
                {invoice.paymentMethods.includes("online") && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-md text-sm print:text-xs print:px-2 print:py-1">
                    <Globe className="h-4 w-4 text-orange-600 print:h-3 print:w-3" />
                    <span className="text-gray-900">Online Payment</span>
                  </div>
                )}
                {invoice.paymentMethods.includes("cash") && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-md text-sm print:text-xs print:px-2 print:py-1">
                    <Banknote className="h-4 w-4 text-emerald-600 print:h-3 print:w-3" />
                    <span className="text-gray-900">Cash Payment</span>
                  </div>
                )}
                {invoice.paymentMethods.includes("card") && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-md text-sm print:text-xs print:px-2 print:py-1">
                    <CreditCard className="h-4 w-4 text-indigo-600 print:h-3 print:w-3" />
                    <span className="text-gray-900">
                      Card Payment{invoice.cardLast4Digits ? ` (****${invoice.cardLast4Digits})` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {invoice.checksPayableTo && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200 print:p-2 print:mb-2">
              <p className="text-sm font-medium text-gray-700 mb-1 print:text-xs print:mb-0.5">Make Checks Payable To:</p>
              <p className="text-base font-semibold text-gray-900 print:text-sm">{invoice.checksPayableTo}</p>
            </div>
          )}

          {bankDetail && (
            <div className="p-4 bg-gray-50 rounded-lg border print:p-2">
              <h4 className="font-semibold text-sm mb-3 text-gray-900 print:text-xs print:mb-2">Bank Transfer/Deposit Details:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm print:text-xs print:gap-2">
                <div>
                  <span className="font-medium text-gray-700">Account Name:</span>
                  <p className="text-gray-900">{bankDetail.accountName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Bank Name:</span>
                  <p className="text-gray-900">{bankDetail.bankName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Branch:</span>
                  <p className="text-gray-900">{bankDetail.branch}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Account Number:</span>
                  <p className="text-gray-900">{bankDetail.accountNumber}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-gray-700">Bank Address:</span>
                  <p className="text-gray-900">{bankDetail.bankAddress}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">SWIFT Code:</span>
                  <p className="text-gray-900">{bankDetail.swiftCode}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-12 pt-6 border-t print:mt-4 print:pt-3">
        <div className="text-center mb-4 print:mb-2">
          <p className="text-sm font-semibold text-gray-900 mb-2 print:text-xs print:mb-1">{hotelInfo.name}</p>
          <div className="text-xs text-gray-600 space-y-1 print:text-[10px]">
            <p>{hotelInfo.address}, {hotelInfo.city}, {hotelInfo.country}</p>
            <p>
              Tel: {hotelInfo.telephone} | Hotline: {hotelInfo.hotline} | USA: {hotelInfo.usaContact}
            </p>
            <p>Email: {hotelInfo.email} | Website: {hotelInfo.website}</p>
          </div>
        </div>
        <Separator className="my-4 print:my-2" />
        <div className="text-center text-xs text-gray-500 print:text-[10px]">
          <p>Thank you for choosing {hotelInfo.name}! We hope to see you again soon.</p>
          <p className="mt-2 print:mt-1">
            This is a computer-generated invoice and does not require a signature.
          </p>
          <p className="mt-3 text-gray-400 print:mt-1">
            {hotelInfo.name} Powered by <span className="font-semibold text-gray-600">Phoenix Global Solutions</span>
          </p>
        </div>
      </div>
    </div>
  );
}
