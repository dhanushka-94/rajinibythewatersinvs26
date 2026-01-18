"use client";

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
import { useState, useEffect } from "react";

interface InvoicePrintLayoutProps {
  invoice: Invoice;
}

export function InvoicePrintLayout({ invoice }: InvoicePrintLayoutProps) {
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
      paid: "bg-green-100 text-green-800 border-green-200",
      partially_paid: "bg-amber-100 text-amber-800 border-amber-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      sent: "bg-blue-100 text-blue-800 border-blue-200",
      draft: "bg-gray-100 text-gray-800 border-gray-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    
    const statusLabels: Record<string, string> = {
      partially_paid: "Partially Paid",
    };

    return (
      <Badge 
        variant="outline" 
        className={`${statusStyles[status] || "bg-gray-100 text-gray-800 border-gray-200"} text-[7pt] px-1.5 py-0.5`}
        style={{ fontSize: '7pt', padding: '2px 6px', lineHeight: '1.2' }}
      >
        {statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <div className="invoice-print-template" style={{ 
      width: '210mm', 
      minHeight: '297mm',
      padding: '10mm', // 1cm margin on all sides
      margin: '0 auto',
      backgroundColor: 'white',
      boxSizing: 'border-box',
      border: 'none',
      boxShadow: 'none'
    }}>
      {/* Header Section */}
      <div className="mb-4" style={{ marginBottom: '16px' }}>
        <div className="flex justify-between items-start mb-2" style={{ marginBottom: '8px' }}>
          <div className="flex-1">
            <div className="mb-1" style={{ marginBottom: '4px' }}>
              <Image
                src={hotelInfo.logoPath}
                alt={hotelInfo.name}
                width={120}
                height={48}
                className="h-auto"
                priority
              />
            </div>
            <div className="text-xs text-gray-600 leading-tight" style={{ fontSize: '7pt', lineHeight: '1.2' }}>
              <p style={{ margin: '0', padding: '0' }}>{hotelInfo.address}, {hotelInfo.city}, {hotelInfo.country}</p>
              <p style={{ margin: '0', padding: '0' }}>Tel: {hotelInfo.telephone} | Hotline: {hotelInfo.hotline} | USA: {hotelInfo.usaContact}</p>
              <p style={{ margin: '0', padding: '0' }}>Email: {hotelInfo.email} | Web: {hotelInfo.website}</p>
            </div>
          </div>
          <div className="text-right ml-4" style={{ marginLeft: '16px' }}>
            <h2 className="text-lg font-bold mb-1 text-gray-900" style={{ fontSize: '14pt', marginBottom: '4px' }}>INVOICE</h2>
            <p className="text-base font-bold text-gray-900 mb-1" style={{ fontSize: '12pt', marginBottom: '4px' }}>
              {invoice.invoiceNumber}
            </p>
            <div className="flex items-center justify-end gap-2 mb-1" style={{ marginBottom: '4px' }}>
              <p className="text-xs text-gray-600" style={{ fontSize: '7pt' }}>
                Currency: {invoice.currency}
              </p>
              {getStatusBadge(invoice.status)}
            </div>
            <p className="text-xs text-gray-600" style={{ fontSize: '7pt' }}>
              Date: {new Date(invoice.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <Separator style={{ border: 'none', borderTop: '1px solid #e5e7eb', marginTop: '8px' }} />
      </div>

      {/* Booking Details - One line, no title */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '9pt' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
            <Calendar style={{ width: '12px', height: '12px', color: '#6b7280' }} />
            <span style={{ fontWeight: '500', color: '#4b5563' }}>Check-in:</span>
            <span style={{ fontWeight: '600', color: '#111827' }}>
              {new Date(invoice.checkIn).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
            <Calendar style={{ width: '12px', height: '12px', color: '#6b7280' }} />
            <span style={{ fontWeight: '500', color: '#4b5563' }}>Check-out:</span>
            <span style={{ fontWeight: '600', color: '#111827' }}>
              {new Date(invoice.checkOut).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          {invoice.roomType && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
              <Building style={{ width: '12px', height: '12px', color: '#6b7280' }} />
              <span style={{ fontWeight: '500', color: '#4b5563' }}>Room:</span>
              <span style={{ fontWeight: '600', color: '#111827' }}>{invoice.roomType}</span>
            </div>
          )}
        </div>
      </div>
      <Separator style={{ border: 'none', borderTop: '1px solid #e5e7eb', marginBottom: '16px' }} />

      {/* Bill To and Guest Information - Side by side */}
      <div className="grid grid-cols-2 gap-6 mb-6" style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '24px', 
        marginBottom: '24px' 
      }}>
        <div>
          <h2 className="font-semibold text-base mb-3 text-gray-900" style={{ fontSize: '12pt', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 style={{ width: '16px', height: '16px', color: '#4b5563' }} />
            Bill To:
          </h2>
          {invoice.billingType === "company" && travelCompany ? (
            <div className="space-y-2 text-xs" style={{ fontSize: '9pt', lineHeight: '1.5' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Building2 style={{ width: '12px', height: '12px', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
                <p className="font-medium text-gray-900">{travelCompany.name}</p>
              </div>
              {travelCompany.contactPerson && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <UserCircle style={{ width: '12px', height: '12px', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
                  <p className="text-gray-600">Contact: {travelCompany.contactPerson}</p>
                </div>
              )}
              {travelCompany.email && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Mail style={{ width: '12px', height: '12px', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
                  <p className="text-gray-600">{travelCompany.email}</p>
                </div>
              )}
              {travelCompany.phone && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Phone style={{ width: '12px', height: '12px', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
                  <p className="text-gray-600">{travelCompany.phone}</p>
                </div>
              )}
              {(travelCompany.address || travelCompany.city || travelCompany.country) && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <MapPin style={{ width: '12px', height: '12px', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
                  <p className="text-gray-600">
                    {travelCompany.address}
                    {travelCompany.city && `, ${travelCompany.city}`}
                    {travelCompany.country && `, ${travelCompany.country}`}
                  </p>
                </div>
              )}
              {travelCompany.taxId && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <IdCard style={{ width: '12px', height: '12px', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
                  <p className="text-gray-600">Tax ID: {travelCompany.taxId}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 text-xs" style={{ fontSize: '9pt', lineHeight: '1.5' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <User style={{ width: '12px', height: '12px', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
                <p className="font-medium text-gray-900">{invoice.guest.name}</p>
              </div>
              {invoice.guest.email && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Mail style={{ width: '12px', height: '12px', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
                  <p className="text-gray-600">{invoice.guest.email}</p>
                </div>
              )}
              {invoice.guest.phone && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Phone style={{ width: '12px', height: '12px', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
                  <p className="text-gray-600">{invoice.guest.phone}</p>
                </div>
              )}
              {(invoice.guest.address || invoice.guest.city || invoice.guest.country) && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <MapPin style={{ width: '12px', height: '12px', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
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
          <div>
            <h3 className="font-semibold text-base mb-3 text-gray-900" style={{ fontSize: '12pt', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCircle style={{ width: '16px', height: '16px', color: '#4b5563' }} />
              Guest Information:
            </h3>
            <div className="space-y-2 text-xs" style={{ fontSize: '9pt', lineHeight: '1.5' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <User style={{ width: '12px', height: '12px', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
                <p className="text-gray-600">{invoice.guest.name}</p>
              </div>
              {invoice.guest.email && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Mail style={{ width: '12px', height: '12px', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
                  <p className="text-gray-600">{invoice.guest.email}</p>
                </div>
              )}
              {invoice.guest.phone && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Phone style={{ width: '12px', height: '12px', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
                  <p className="text-gray-600">{invoice.guest.phone}</p>
                </div>
              )}
              {invoice.guest.idNumber && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <IdCard style={{ width: '12px', height: '12px', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
                  <p className="text-gray-600">ID: {invoice.guest.idNumber}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Separator style={{ border: 'none', borderTop: '1px solid #e5e7eb', marginBottom: '24px' }} />

      {/* Invoice Items Table */}
      <div className="mb-6" style={{ marginBottom: '24px', pageBreakInside: 'avoid' }}>
        <Table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <TableHeader>
            <TableRow className="bg-gray-50" style={{ backgroundColor: '#f9fafb', pageBreakInside: 'avoid' }}>
              <TableHead className="font-semibold text-gray-900 text-left" style={{ 
                padding: '8px 6px', 
                fontSize: '9pt',
                fontWeight: '600',
                textAlign: 'left',
                borderBottom: '1px solid #e5e7eb',
                pageBreakInside: 'avoid'
              }}>
                Description
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-900" style={{ 
                padding: '8px 6px', 
                fontSize: '9pt',
                fontWeight: '600',
                textAlign: 'right',
                borderBottom: '1px solid #e5e7eb',
                pageBreakInside: 'avoid'
              }}>
                Qty/Days
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-900" style={{ 
                padding: '8px 6px', 
                fontSize: '9pt',
                fontWeight: '600',
                textAlign: 'right',
                borderBottom: '1px solid #e5e7eb',
                pageBreakInside: 'avoid'
              }}>
                Unit Price
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-900" style={{ 
                padding: '8px 6px', 
                fontSize: '9pt',
                fontWeight: '600',
                textAlign: 'right',
                borderBottom: '1px solid #e5e7eb',
                pageBreakInside: 'avoid'
              }}>
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item) => (
              <TableRow key={item.id} style={{ pageBreakInside: 'avoid' }}>
                <TableCell className="font-medium text-gray-900 text-left" style={{ 
                  padding: '8px 6px', 
                  fontSize: '9pt',
                  textAlign: 'left',
                  borderBottom: '1px solid #f3f4f6',
                  pageBreakInside: 'avoid'
                }}>
                  {item.description}
                </TableCell>
                <TableCell className="text-right text-gray-600" style={{ 
                  padding: '8px 6px', 
                  fontSize: '9pt',
                  textAlign: 'right',
                  borderBottom: '1px solid #f3f4f6',
                  pageBreakInside: 'avoid'
                }}>
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right text-gray-600" style={{ 
                  padding: '8px 6px', 
                  fontSize: '9pt',
                  textAlign: 'right',
                  borderBottom: '1px solid #f3f4f6',
                  pageBreakInside: 'avoid'
                }}>
                  {formatCurrency(item.unitPrice, invoice.currency)}
                </TableCell>
                <TableCell className="text-right font-medium text-gray-900" style={{ 
                  padding: '8px 6px', 
                  fontSize: '9pt',
                  fontWeight: '500',
                  textAlign: 'right',
                  borderBottom: '1px solid #f3f4f6',
                  pageBreakInside: 'avoid'
                }}>
                  {formatCurrency(item.total, invoice.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary Section */}
      <div className="flex justify-end mb-6" style={{ marginBottom: '24px', justifyContent: 'flex-end', pageBreakInside: 'avoid', pageBreakBefore: 'avoid' }}>
        <div className="w-64 space-y-2" style={{ width: '256px' }}>
          <div className="flex justify-between text-sm" style={{ fontSize: '9pt' }}>
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium text-gray-900">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
          </div>
          {invoice.serviceCharge > 0 && (
            <div className="flex justify-between text-sm" style={{ fontSize: '9pt' }}>
              <span className="text-gray-600">Service Charge ({invoice.serviceChargeRate}%):</span>
              <span className="font-medium text-gray-900">{formatCurrency(invoice.serviceCharge, invoice.currency)}</span>
            </div>
          )}
          {invoice.damageCharge > 0 && (
            <div className="flex justify-between text-sm" style={{ fontSize: '9pt' }}>
              <span className="text-gray-600">Damage Charge:</span>
              <span className="font-medium text-gray-900 text-red-600">{formatCurrency(invoice.damageCharge, invoice.currency)}</span>
            </div>
          )}
          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm" style={{ fontSize: '9pt' }}>
              <span className="text-gray-600">
                Discount {invoice.discountType === "percentage" ? `(${invoice.discount}%)` : "(Fixed)"}:
              </span>
              <span className="font-medium text-gray-900 text-green-600">
                -{formatCurrency(invoice.discount, invoice.currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm" style={{ fontSize: '9pt' }}>
            <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
            <span className="font-medium text-gray-900">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
          </div>
          {invoice.priceAdjustment !== 0 && (
            <div className="flex justify-between text-sm" style={{ fontSize: '9pt' }}>
              <span className="text-gray-600">
                Price Adjustment {invoice.priceAdjustmentReason && `(${invoice.priceAdjustmentReason})`}:
              </span>
              <span className={`font-medium text-gray-900 ${invoice.priceAdjustment > 0 ? "text-red-600" : "text-green-600"}`}>
                {invoice.priceAdjustment > 0 ? "+" : ""}{formatCurrency(invoice.priceAdjustment, invoice.currency)}
              </span>
            </div>
          )}
          <Separator style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '8px 0' }} />
          <div className="flex justify-between text-lg font-bold pt-1" style={{ fontSize: '12pt', fontWeight: '700', paddingTop: '4px' }}>
            <span className="text-gray-900">Total Amount:</span>
            <span className="text-gray-900">{formatCurrency(invoice.total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mt-6 pt-4" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          <h3 className="font-semibold text-xs mb-2 text-gray-900" style={{ fontSize: '9pt', marginBottom: '8px' }}>Notes:</h3>
          <p className="text-xs text-gray-600 whitespace-pre-wrap" style={{ fontSize: '9pt', lineHeight: '1.5' }}>
            {invoice.notes}
          </p>
        </div>
      )}

      {/* Payment Information */}
      {(invoice.paymentMethods.length > 0 || invoice.selectedBankDetailId) && (
        <div className="mt-6 pt-4" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          <h3 className="font-semibold text-base mb-3 text-gray-900" style={{ fontSize: '12pt', marginBottom: '12px' }}>
            Payment Information
          </h3>
          
          {invoice.paymentMethods.length > 0 && (
            <div className="mb-3" style={{ marginBottom: '12px' }}>
              <p className="text-xs font-medium text-gray-700 mb-2" style={{ fontSize: '9pt', marginBottom: '8px' }}>
                Accepted Payment Methods:
              </p>
              <div className="flex flex-wrap gap-2" style={{ gap: '8px' }}>
                {invoice.paymentMethods.includes("bank_account") && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded text-xs" style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#eff6ff',
                    borderRadius: '4px',
                    fontSize: '8pt'
                  }}>
                    <Building2 className="h-3 w-3 text-blue-600" />
                    <span className="text-gray-900">Bank Transfer/Deposit</span>
                  </div>
                )}
                {invoice.paymentMethods.includes("cheque") && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded text-xs" style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#f0fdf4',
                    borderRadius: '4px',
                    fontSize: '8pt'
                  }}>
                    <FileText className="h-3 w-3 text-green-600" />
                    <span className="text-gray-900">Cheque Payment</span>
                  </div>
                )}
                {invoice.paymentMethods.includes("online") && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 rounded text-xs" style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#fff7ed',
                    borderRadius: '4px',
                    fontSize: '8pt'
                  }}>
                    <Globe className="h-3 w-3 text-orange-600" />
                    <span className="text-gray-900">Online Payment</span>
                  </div>
                )}
                {invoice.paymentMethods.includes("cash") && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded text-xs" style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#ecfdf5',
                    borderRadius: '4px',
                    fontSize: '8pt'
                  }}>
                    <Banknote className="h-3 w-3 text-emerald-600" />
                    <span className="text-gray-900">Cash Payment</span>
                  </div>
                )}
                {invoice.paymentMethods.includes("card") && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 rounded text-xs" style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#eef2ff',
                    borderRadius: '4px',
                    fontSize: '8pt'
                  }}>
                    <CreditCard className="h-3 w-3 text-indigo-600" />
                    <span className="text-gray-900">
                      Card Payment{invoice.cardLast4Digits ? ` (****${invoice.cardLast4Digits})` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {invoice.checksPayableTo && (
            <div className="mb-3 p-3 bg-blue-50 rounded" style={{ 
              marginBottom: '12px', 
              padding: '12px', 
              backgroundColor: '#eff6ff',
              borderRadius: '4px'
            }}>
              <p className="text-xs font-medium text-gray-700 mb-1" style={{ fontSize: '9pt', marginBottom: '4px' }}>
                Make Checks Payable To:
              </p>
              <p className="text-sm font-semibold text-gray-900" style={{ fontSize: '10pt', fontWeight: '600' }}>
                {invoice.checksPayableTo}
              </p>
            </div>
          )}

          {bankDetail && (
            <div className="p-3 bg-gray-50 rounded" style={{ 
              padding: '12px', 
              backgroundColor: '#f9fafb',
              borderRadius: '4px'
            }}>
              <h4 className="font-semibold text-xs mb-2 text-gray-900" style={{ fontSize: '9pt', marginBottom: '8px' }}>
                Bank Transfer/Deposit Details:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs" style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '8px',
                fontSize: '9pt'
              }}>
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

      {/* Signature Section */}
      <div className="mt-8 pt-4" style={{ 
        marginTop: '32px', 
        paddingTop: '16px', 
        borderTop: '1px solid #e5e7eb',
        pageBreakInside: 'avoid'
      }}>
        <div className="grid grid-cols-2 gap-8" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '32px',
          pageBreakInside: 'avoid'
        }}>
          {/* Guest Signature */}
          <div style={{ pageBreakInside: 'avoid' }}>
            <div className="mb-2" style={{ 
              marginBottom: '8px', 
              borderBottom: '1px solid #000', 
              paddingBottom: '2px',
              minHeight: '1px',
              width: '100%'
            }}>
              {/* Signature line */}
            </div>
            <p className="text-xs font-medium text-gray-900" style={{ fontSize: '9pt', fontWeight: '600' }}>
              Guest Signature
            </p>
          </div>

          {/* Hotel Signature */}
          <div style={{ pageBreakInside: 'avoid' }}>
            <div className="mb-2" style={{ 
              marginBottom: '8px', 
              borderBottom: '1px solid #000', 
              paddingBottom: '2px',
              minHeight: '1px',
              width: '100%'
            }}>
              {/* Signature line */}
            </div>
            <p className="text-xs font-medium text-gray-900" style={{ fontSize: '9pt', fontWeight: '600' }}>
              Authorized Signature
            </p>
            <p className="text-xs text-gray-600 mt-1" style={{ fontSize: '9pt', marginTop: '4px' }}>
              {hotelInfo.name}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
        <div className="text-center text-xs text-gray-500" style={{ fontSize: '8pt' }}>
          <p>Thank you for choosing {hotelInfo.name}! We hope to see you again soon.</p>
          <p className="mt-2 text-gray-400" style={{ marginTop: '8px' }}>
            {hotelInfo.name} Powered by <span className="font-semibold text-gray-600">Phoenix Global Solutions</span>
          </p>
        </div>
      </div>
    </div>
  );
}
