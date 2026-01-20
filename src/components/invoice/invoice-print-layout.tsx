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
import { getHotelInfo, type HotelInfo } from "@/lib/hotel-info";
import { formatCurrency } from "@/lib/currency";
import { getBankDetailById } from "@/lib/bank-details";
import { getTravelCompanyById } from "@/lib/travel-companies";
import { type TravelCompany } from "@/types/travel-company";
import { Building2, FileText, Wallet, Globe, Banknote, CreditCard, Calendar, User, Mail, Phone, MapPin, Building, IdCard, UserCircle, Hash } from "lucide-react";
import { useState, useEffect } from "react";

interface InvoicePrintLayoutProps {
  invoice: Invoice;
}

export function InvoicePrintLayout({ invoice }: InvoicePrintLayoutProps) {
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
            {hotelInfo && (
              <>
                <div className="mb-1" style={{ marginBottom: '4px' }}>
                  <img
                    src={hotelInfo.logoPath || "/images/rajini-logo-flat-color.png"}
                    alt={hotelInfo.name}
                    style={{
                      width: '120px',
                      height: 'auto',
                      maxWidth: '120px',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                </div>
                <div className="text-xs text-gray-600 leading-tight" style={{ fontSize: '7pt', lineHeight: '1.4' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', marginBottom: '3px' }}>
                    <MapPin style={{ width: '10px', height: '10px', color: '#6b7280', marginTop: '2px', flexShrink: 0 }} />
                    <p style={{ margin: '0', padding: '0' }}>{hotelInfo.address}, {hotelInfo.city}, {hotelInfo.country}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                    {hotelInfo.hotline && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Phone style={{ width: '10px', height: '10px', color: '#6b7280' }} />
                        <span>Hotline: {hotelInfo.hotline}</span>
                      </div>
                    )}
                    {hotelInfo.telephone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Phone style={{ width: '10px', height: '10px', color: '#6b7280' }} />
                        <span>Tel: {hotelInfo.telephone}</span>
                      </div>
                    )}
                    {hotelInfo.usaContact && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Phone style={{ width: '10px', height: '10px', color: '#6b7280' }} />
                        <span>USA: {hotelInfo.usaContact}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {hotelInfo.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Mail style={{ width: '10px', height: '10px', color: '#6b7280' }} />
                        <span>{hotelInfo.email}</span>
                      </div>
                    )}
                    {hotelInfo.website && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Globe style={{ width: '10px', height: '10px', color: '#6b7280' }} />
                        <span>{hotelInfo.website}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
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

      {/* Bill To, Guest Information, and Booking Details - Dynamic columns */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: (invoice.billingType === "company" || (invoice.guests && invoice.guests.length > 0)) ? '1fr 1fr 1fr' : '1fr 1fr', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        {/* Bill To Section */}
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
                  <Hash style={{ width: '12px', height: '12px', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
                  <p className="text-gray-600">{travelCompany.contactPerson}</p>
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
              {invoice.referenceNumber && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Hash style={{ width: '12px', height: '12px', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
                  <p className="text-gray-600"><span style={{ fontWeight: '500' }}>Ref:</span> {invoice.referenceNumber}</p>
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

        {/* Guest Information Section - Only show if there's content */}
        {(invoice.billingType === "company" || (invoice.guests && invoice.guests.length > 0)) && (
          <div>
            <h3 className="font-semibold text-base mb-3 text-gray-900" style={{ fontSize: '12pt', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCircle style={{ width: '16px', height: '16px', color: '#4b5563' }} />
              Guest Information:
            </h3>
            <div className="space-y-1.5 text-xs" style={{ fontSize: '9pt', lineHeight: '1.5' }}>
              {/* Show primary guest if billing to company OR if there are additional guests */}
              {(invoice.billingType === "company" || (invoice.guests && invoice.guests.length > 0)) && invoice.guest.name && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <User style={{ width: '12px', height: '12px', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
                  <p className="text-gray-600">{invoice.guest.name}</p>
                </div>
              )}
              {/* Show additional guests (only names) */}
              {invoice.guests && invoice.guests.length > 0 && (
                <>
                  {invoice.guests.map((guest, index) => (
                    guest.name && (
                      <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <User style={{ width: '12px', height: '12px', color: '#9ca3af', marginTop: '2px', flexShrink: 0 }} />
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
        <div>
          <h3 className="font-semibold text-base mb-3 text-gray-900" style={{ fontSize: '12pt', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar style={{ width: '16px', height: '16px', color: '#4b5563' }} />
            Booking Details:
          </h3>
          <div style={{ fontSize: '9pt', lineHeight: '1.5' }}>
            {/* Line 1: Check-in and Check-out */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 16px', marginBottom: '6px' }}>
              <div>
                <span style={{ fontWeight: '500', color: '#4b5563' }}>Check-in: </span>
                <span style={{ color: '#111827' }}>
                  {new Date(invoice.checkIn).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div>
                <span style={{ fontWeight: '500', color: '#4b5563' }}>Check-out: </span>
                <span style={{ color: '#111827' }}>
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 16px' }}>
                {invoice.roomType && (
                  <div>
                    <span style={{ fontWeight: '500', color: '#4b5563' }}>Room: </span>
                    <span style={{ color: '#111827' }}>{invoice.roomType}</span>
                  </div>
                )}
                {(invoice.adults !== undefined || invoice.children !== undefined || invoice.babies !== undefined) && (
                  <div>
                    <span style={{ fontWeight: '500', color: '#4b5563' }}>Guests: </span>
                    <span style={{ color: '#111827' }}>
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
                  {item.quantity} {item.quantityType === "days" ? "Days" : "Qty"}
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
      <div className="flex justify-end mb-4" style={{ marginBottom: '12px', justifyContent: 'flex-end', pageBreakInside: 'avoid', pageBreakBefore: 'avoid' }}>
        <div className="w-64" style={{ width: '256px' }}>
          <div className="flex justify-between text-sm" style={{ fontSize: '8pt', marginBottom: '2px', lineHeight: '1.2' }}>
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium text-gray-900">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
          </div>
          {invoice.serviceCharge > 0 && (
            <div className="flex justify-between text-sm" style={{ fontSize: '8pt', marginBottom: '2px', lineHeight: '1.2' }}>
              <span className="text-gray-600">Service Charge ({invoice.serviceChargeRate}%):</span>
              <span className="font-medium text-gray-900">{formatCurrency(invoice.serviceCharge, invoice.currency)}</span>
            </div>
          )}
          {invoice.damageCharge > 0 && (
            <div className="flex justify-between text-sm" style={{ fontSize: '8pt', marginBottom: '2px', lineHeight: '1.2' }}>
              <span className="text-gray-600">Damage Charge:</span>
              <span className="font-medium text-gray-900 text-red-600">{formatCurrency(invoice.damageCharge, invoice.currency)}</span>
            </div>
          )}
          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm" style={{ fontSize: '8pt', marginBottom: '2px', lineHeight: '1.2' }}>
              <span className="text-gray-600">
                Discount {invoice.discountType === "percentage" ? `(${invoice.discount}%)` : "(Fixed)"}:
              </span>
              <span className="font-medium text-gray-900 text-green-600">
                -{formatCurrency(invoice.discount, invoice.currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm" style={{ fontSize: '8pt', marginBottom: '2px', lineHeight: '1.2' }}>
            <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
            <span className="font-medium text-gray-900">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
          </div>
          {invoice.priceAdjustment !== 0 && (
            <div className="flex justify-between text-sm" style={{ fontSize: '8pt', marginBottom: '2px', lineHeight: '1.2' }}>
              <span className="text-gray-600">
                Price Adjustment {invoice.priceAdjustmentReason && `(${invoice.priceAdjustmentReason})`}:
              </span>
              <span className={`font-medium text-gray-900 ${invoice.priceAdjustment > 0 ? "text-red-600" : "text-green-600"}`}>
                {invoice.priceAdjustment > 0 ? "+" : ""}{formatCurrency(invoice.priceAdjustment, invoice.currency)}
              </span>
            </div>
          )}
          <Separator style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '3px 0' }} />
          <div className="flex justify-between text-lg font-bold" style={{ fontSize: '11pt', fontWeight: '700', marginTop: '2px', lineHeight: '1.2' }}>
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
      {(invoice.paymentMethods.length > 0 || bankDetails.length > 0) && (
        <div className="mt-4 pt-3" style={{ 
          marginTop: '16px', 
          paddingTop: '12px', 
          borderTop: '1px solid #e5e7eb',
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          display: 'block',
          visibility: 'visible',
          opacity: 1
        }}>
          <h3 className="font-semibold text-sm mb-2 text-gray-900" style={{ 
            fontSize: '10pt', 
            marginBottom: '8px',
            pageBreakAfter: 'avoid',
            display: 'block',
            visibility: 'visible'
          }}>
            Payment Information
          </h3>
          
          {invoice.paymentMethods.length > 0 && (
            <div className="mb-2" style={{ 
              marginBottom: '8px',
              display: 'block',
              visibility: 'visible'
            }}>
              <p className="text-xs font-medium text-gray-700 mb-1" style={{ 
                fontSize: '8pt', 
                marginBottom: '4px',
                display: 'block',
                visibility: 'visible'
              }}>
                Accepted Payment Methods:
              </p>
              <div className="flex flex-wrap gap-1.5" style={{ 
                gap: '6px',
                display: 'flex',
                visibility: 'visible'
              }}>
                {invoice.paymentMethods.includes("bank_account") && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 rounded text-xs" style={{ 
                    padding: '2px 6px', 
                    backgroundColor: '#eff6ff',
                    borderRadius: '3px',
                    fontSize: '7pt'
                  }}>
                    <Building2 className="h-2.5 w-2.5 text-blue-600" style={{ width: '10px', height: '10px' }} />
                    <span className="text-gray-900">Bank Transfer/Deposit</span>
                  </div>
                )}
                {invoice.paymentMethods.includes("cheque") && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 rounded text-xs" style={{ 
                    padding: '2px 6px', 
                    backgroundColor: '#f0fdf4',
                    borderRadius: '3px',
                    fontSize: '7pt'
                  }}>
                    <FileText className="h-2.5 w-2.5 text-green-600" style={{ width: '10px', height: '10px' }} />
                    <span className="text-gray-900">Cheque Payment</span>
                  </div>
                )}
                {invoice.paymentMethods.includes("online") && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-50 rounded text-xs" style={{ 
                    padding: '2px 6px', 
                    backgroundColor: '#fff7ed',
                    borderRadius: '3px',
                    fontSize: '7pt'
                  }}>
                    <Globe className="h-2.5 w-2.5 text-orange-600" style={{ width: '10px', height: '10px' }} />
                    <span className="text-gray-900">Online Payment</span>
                  </div>
                )}
                {invoice.paymentMethods.includes("cash") && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 rounded text-xs" style={{ 
                    padding: '2px 6px', 
                    backgroundColor: '#ecfdf5',
                    borderRadius: '3px',
                    fontSize: '7pt'
                  }}>
                    <Banknote className="h-2.5 w-2.5 text-emerald-600" style={{ width: '10px', height: '10px' }} />
                    <span className="text-gray-900">Cash Payment</span>
                  </div>
                )}
                {invoice.paymentMethods.includes("card") && (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 rounded text-xs" style={{ 
                    padding: '2px 6px', 
                    backgroundColor: '#eef2ff',
                    borderRadius: '3px',
                    fontSize: '7pt'
                  }}>
                    <CreditCard className="h-2.5 w-2.5 text-indigo-600" style={{ width: '10px', height: '10px' }} />
                    <span className="text-gray-900">
                      Card Payment{invoice.cardLast4Digits ? ` (****${invoice.cardLast4Digits})` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {invoice.checksPayableTo && (
            <div className="mb-2 p-2 bg-blue-50 rounded" style={{ 
              marginBottom: '8px', 
              padding: '8px', 
              backgroundColor: '#eff6ff',
              borderRadius: '4px'
            }}>
              <p className="text-xs font-medium text-gray-700 mb-0.5" style={{ fontSize: '8pt', marginBottom: '2px' }}>
                Make Checks Payable To:
              </p>
              <p className="text-xs font-semibold text-gray-900" style={{ fontSize: '9pt', fontWeight: '600' }}>
                {invoice.checksPayableTo}
              </p>
            </div>
          )}

          {bankDetails.length > 0 && (
            <div className="p-2 bg-blue-50 rounded border-2 border-blue-200" style={{ 
              padding: '6px', 
              backgroundColor: '#eff6ff',
              border: '2px solid #bfdbfe',
              borderRadius: '4px',
              pageBreakInside: 'avoid',
              breakInside: 'avoid',
              display: bankDetails.length > 1 ? 'grid' : 'block',
              gridTemplateColumns: bankDetails.length > 1 ? '1fr 1fr' : 'none',
              gap: bankDetails.length > 1 ? '10px' : '0'
            }}>
              {bankDetails.map((bankDetail, index) => (
                <div key={bankDetail.id || index} style={{
                  pageBreakInside: 'avoid',
                  breakInside: 'avoid',
                  borderRight: bankDetails.length > 1 && index < bankDetails.length - 1 ? '2px solid #93c5fd' : 'none',
                  paddingRight: bankDetails.length > 1 && index < bankDetails.length - 1 ? '10px' : '0'
                }}>
                  {bankDetails.length > 1 && (
                    <h4 className="font-bold text-xs mb-1 text-blue-900" style={{ fontSize: '8pt', fontWeight: '700', marginBottom: '4px', color: '#1e3a8a' }}>
                      Bank Transfer/Deposit Details #{index + 1}:
                    </h4>
                  )}
                  {bankDetails.length === 1 && (
                    <h4 className="font-bold text-xs mb-1 text-blue-900" style={{ fontSize: '8pt', fontWeight: '700', marginBottom: '4px', color: '#1e3a8a' }}>
                      Bank Transfer/Deposit Details:
                    </h4>
                  )}
                  {bankDetails.length === 1 ? (
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '6px 12px',
                      fontSize: '7.5pt',
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid',
                      lineHeight: '1.3'
                    }}>
                      <div>
                        <span style={{ fontWeight: '600', color: '#1e40af' }}>Account Name:</span>
                        <span style={{ color: '#1e3a8a', fontWeight: '500', marginLeft: '3px' }}>{bankDetail.accountName}</span>
                      </div>
                      <div>
                        <span style={{ fontWeight: '600', color: '#1e40af' }}>Bank Name:</span>
                        <span style={{ color: '#1e3a8a', fontWeight: '500', marginLeft: '3px' }}>{bankDetail.bankName}</span>
                      </div>
                      <div>
                        <span style={{ fontWeight: '600', color: '#1e40af' }}>Branch:</span>
                        <span style={{ color: '#1e3a8a', fontWeight: '500', marginLeft: '3px' }}>{bankDetail.branch}</span>
                      </div>
                      <div>
                        <span style={{ fontWeight: '600', color: '#1e40af' }}>Account Number:</span>
                        <span style={{ color: '#1e3a8a', fontWeight: '500', marginLeft: '3px' }}>{bankDetail.accountNumber}</span>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ fontWeight: '600', color: '#1e40af' }}>SWIFT Code:</span>
                        <span style={{ color: '#1e3a8a', fontWeight: '500', marginLeft: '3px' }}>{bankDetail.swiftCode}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      fontSize: '7.5pt',
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid',
                      lineHeight: '1.3'
                    }}>
                      <div style={{ 
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '10px 10px'
                      }}>
                        <span style={{ color: '#1e3a8a', fontWeight: '500' }}>
                          <span style={{ fontWeight: '600', color: '#1e40af' }}>Account Name:</span> {bankDetail.accountName}
                        </span>
                        <span style={{ color: '#1e3a8a', fontWeight: '500' }}>
                          <span style={{ fontWeight: '600', color: '#1e40af' }}>Bank Name:</span> {bankDetail.bankName}
                        </span>
                        <span style={{ color: '#1e3a8a', fontWeight: '500' }}>
                          <span style={{ fontWeight: '600', color: '#1e40af' }}>Branch:</span> {bankDetail.branch}
                        </span>
                      </div>
                      <div style={{ 
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '10px 10px'
                      }}>
                        <span style={{ color: '#1e3a8a', fontWeight: '500' }}>
                          <span style={{ fontWeight: '600', color: '#1e40af' }}>Account Number:</span> {bankDetail.accountNumber}
                        </span>
                        <span style={{ color: '#1e3a8a', fontWeight: '500' }}>
                          <span style={{ fontWeight: '600', color: '#1e40af' }}>SWIFT Code:</span> {bankDetail.swiftCode}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
            {hotelInfo && (
              <p className="text-xs text-gray-600 mt-1" style={{ fontSize: '9pt', marginTop: '4px' }}>
                {hotelInfo.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      {hotelInfo && (
        <div className="mt-6 pt-4" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          <div className="text-center text-xs text-gray-500" style={{ fontSize: '8pt' }}>
            <p>Thank you for choosing {hotelInfo.name}! We hope to see you again soon.</p>
            <p className="mt-2 text-gray-400" style={{ marginTop: '8px' }}>
              {hotelInfo.name} Powered by <span className="font-semibold text-gray-600">Phoenix Global Solutions</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
