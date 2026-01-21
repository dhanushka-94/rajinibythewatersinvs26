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
import { Building2, FileText, Wallet, Globe, Banknote, CreditCard, Calendar, User, Mail, Phone, MapPin, Building, IdCard, UserCircle, Hash, LogIn, LogOut, Users } from "lucide-react";
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
      boxShadow: 'none',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ flex: '1 0 auto' }}>
      {/* Header Section */}
      <div className="mb-4" style={{ marginBottom: '20px' }}>
        <div className="flex justify-between items-start mb-2" style={{ marginBottom: '10px' }}>
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
                <div className="text-xs leading-tight" style={{ fontSize: '7pt', lineHeight: '1.4', color: '#111827' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', marginBottom: '2px' }}>
                    <MapPin style={{ width: '10px', height: '10px', color: '#111827', marginTop: '2px', flexShrink: 0 }} />
                    <p style={{ margin: '0', padding: '0', color: '#111827' }}>{hotelInfo.address}, {hotelInfo.city}, {hotelInfo.country}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
                    {hotelInfo.hotline && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Phone style={{ width: '10px', height: '10px', color: '#111827' }} />
                        <span style={{ color: '#111827' }}>Hotline: {hotelInfo.hotline}</span>
                      </div>
                    )}
                    {hotelInfo.telephone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Phone style={{ width: '10px', height: '10px', color: '#111827' }} />
                        <span style={{ color: '#111827' }}>Tel: {hotelInfo.telephone}</span>
                      </div>
                    )}
                    {hotelInfo.usaContact && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Phone style={{ width: '10px', height: '10px', color: '#111827' }} />
                        <span style={{ color: '#111827' }}>USA: {hotelInfo.usaContact}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {hotelInfo.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Mail style={{ width: '10px', height: '10px', color: '#111827' }} />
                        <span style={{ color: '#111827' }}>{hotelInfo.email}</span>
                      </div>
                    )}
                    {hotelInfo.website && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Globe style={{ width: '10px', height: '10px', color: '#111827' }} />
                        <span style={{ color: '#111827' }}>{hotelInfo.website}</span>
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
              <p className="text-xs" style={{ fontSize: '7pt', color: '#111827' }}>
                Currency: {invoice.currency}
              </p>
              {getStatusBadge(invoice.status)}
            </div>
            <p className="text-xs" style={{ fontSize: '7pt', color: '#111827' }}>
              Date: {new Date(invoice.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <Separator style={{ border: 'none', borderTop: '1px solid #111827', marginTop: '4px', marginBottom: '0' }} />
      </div>

      {/* Bill To, Guest Information, and Booking Details - Dynamic columns */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: (invoice.billingType === "company" || (invoice.guests && invoice.guests.length > 0)) ? '1fr 1fr 1fr' : '1fr 1fr', 
        gap: '16px', 
        marginTop: '12px',
        marginBottom: '24px' 
      }}>
        {/* Bill To Section */}
        <div>
          <h2 className="font-semibold text-base mb-2 text-gray-900" style={{ fontSize: '11pt', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#111827' }}>
            <Building2 style={{ width: '14px', height: '14px', color: '#111827' }} />
            Bill To:
          </h2>
          {invoice.billingType === "company" && travelCompany ? (
            <div className="space-y-1 text-xs" style={{ fontSize: '9pt', lineHeight: '1.5', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                <Building2 style={{ width: '11px', height: '11px', color: '#111827', marginTop: '2px', flexShrink: 0 }} />
                <p className="font-medium" style={{ color: '#111827' }}>{travelCompany.name}</p>
              </div>
              {travelCompany.contactPerson && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                  <Hash style={{ width: '11px', height: '11px', color: '#111827', marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ color: '#111827' }}>{travelCompany.contactPerson}</p>
                </div>
              )}
              {travelCompany.phone && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                  <Phone style={{ width: '11px', height: '11px', color: '#111827', marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ color: '#111827' }}>{travelCompany.phone}</p>
                </div>
              )}
              {(travelCompany.address || travelCompany.city || travelCompany.country) && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                  <MapPin style={{ width: '11px', height: '11px', color: '#111827', marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ color: '#111827' }}>
                    {travelCompany.address}
                    {travelCompany.city && `, ${travelCompany.city}`}
                    {travelCompany.country && `, ${travelCompany.country}`}
                  </p>
                </div>
              )}
              {invoice.referenceNumber && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                  <Hash style={{ width: '11px', height: '11px', color: '#111827', marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ color: '#111827' }}><span style={{ fontWeight: '500' }}>Ref:</span> {invoice.referenceNumber}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1 text-xs" style={{ fontSize: '9pt', lineHeight: '1.5' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                <User style={{ width: '11px', height: '11px', color: '#111827', marginTop: '2px', flexShrink: 0 }} />
                <p className="font-medium" style={{ color: '#111827' }}>{invoice.guest.name}</p>
              </div>
              {invoice.guest.email && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                  <Mail style={{ width: '11px', height: '11px', color: '#111827', marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ color: '#111827' }}>{invoice.guest.email}</p>
                </div>
              )}
              {invoice.guest.phone && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                  <Phone style={{ width: '11px', height: '11px', color: '#111827', marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ color: '#111827' }}>{invoice.guest.phone}</p>
                </div>
              )}
              {(invoice.guest.address || invoice.guest.city || invoice.guest.country) && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                  <MapPin style={{ width: '11px', height: '11px', color: '#111827', marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ color: '#111827' }}>
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
            <h3 className="font-semibold text-base mb-2 text-gray-900" style={{ fontSize: '11pt', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#111827' }}>
              <UserCircle style={{ width: '14px', height: '14px', color: '#111827' }} />
              Guest Information:
            </h3>
            <div className="space-y-1 text-xs" style={{ fontSize: '9pt', lineHeight: '1.5' }}>
              {/* Show primary guest if billing to company OR if there are additional guests */}
              {(invoice.billingType === "company" || (invoice.guests && invoice.guests.length > 0)) && invoice.guest.name && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                  <User style={{ width: '11px', height: '11px', color: '#111827', marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ color: '#111827' }}>{invoice.guest.name}</p>
                </div>
              )}
              {/* Show additional guests (only names) */}
              {invoice.guests && invoice.guests.length > 0 && (
                <>
                  {invoice.guests.map((guest, index) => (
                    guest.name && (
                      <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                        <User style={{ width: '11px', height: '11px', color: '#111827', marginTop: '2px', flexShrink: 0 }} />
                        <p style={{ color: '#111827' }}>{guest.name}</p>
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
          <h3 className="font-semibold text-base mb-2 text-gray-900" style={{ fontSize: '11pt', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#111827' }}>
            <Calendar style={{ width: '14px', height: '14px', color: '#111827' }} />
            Booking Details:
          </h3>
          <div style={{ fontSize: '9pt', lineHeight: '1.5' }}>
            {/* Line 1: Check-in and Check-out */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 12px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LogIn style={{ width: '11px', height: '11px', color: '#111827', flexShrink: 0 }} />
                <span style={{ fontWeight: '500', color: '#111827' }}>Check-in: </span>
                <span style={{ color: '#111827' }}>
                  {new Date(invoice.checkIn).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LogOut style={{ width: '11px', height: '11px', color: '#111827', flexShrink: 0 }} />
                <span style={{ fontWeight: '500', color: '#111827' }}>Check-out: </span>
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 12px' }}>
                {invoice.roomType && (
                  <div>
                    <span style={{ fontWeight: '500', color: '#111827' }}>Room: </span>
                    <span style={{ color: '#111827' }}>{invoice.roomType}</span>
                  </div>
                )}
                {(invoice.adults !== undefined || invoice.children !== undefined || invoice.babies !== undefined) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users style={{ width: '11px', height: '11px', color: '#111827', flexShrink: 0 }} />
                    <span style={{ fontWeight: '500', color: '#111827' }}>Guests: </span>
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
      <Separator style={{ border: 'none', borderTop: '1px solid #111827', marginTop: '4px', marginBottom: '12px' }} />

      {/* Invoice Items Table */}
      <div className="mb-4" style={{ marginBottom: '24px', pageBreakInside: 'avoid' }}>
        <Table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <TableHeader>
            <TableRow style={{ pageBreakInside: 'avoid' }}>
              <TableHead className="font-semibold text-left" style={{ 
                padding: '10px 6px', 
                fontSize: '9pt',
                fontWeight: '600',
                textAlign: 'left',
                borderBottom: '1px solid #111827',
                borderRight: 'none',
                pageBreakInside: 'avoid',
                color: '#111827'
              }}>
                Description
              </TableHead>
              <TableHead className="text-right font-semibold" style={{ 
                padding: '10px 6px', 
                fontSize: '9pt',
                fontWeight: '600',
                textAlign: 'right',
                borderBottom: '1px solid #111827',
                borderRight: 'none',
                pageBreakInside: 'avoid',
                color: '#111827'
              }}>
                Qty/Days
              </TableHead>
              <TableHead className="text-right font-semibold" style={{ 
                padding: '10px 6px', 
                fontSize: '9pt',
                fontWeight: '600',
                textAlign: 'right',
                borderBottom: '1px solid #111827',
                borderRight: 'none',
                pageBreakInside: 'avoid',
                color: '#111827'
              }}>
                Unit Price
              </TableHead>
              <TableHead className="text-right font-semibold" style={{ 
                padding: '10px 6px', 
                fontSize: '9pt',
                fontWeight: '600',
                textAlign: 'right',
                borderBottom: '1px solid #111827',
                borderRight: 'none',
                pageBreakInside: 'avoid',
                color: '#111827'
              }}>
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((item) => (
              <TableRow key={item.id} style={{ pageBreakInside: 'avoid' }}>
                <TableCell className="font-medium text-left" style={{ 
                  padding: '10px 6px', 
                  fontSize: '9pt',
                  textAlign: 'left',
                  borderBottom: '1px solid #d1d5db',
                  borderRight: 'none',
                  pageBreakInside: 'avoid',
                  color: '#111827'
                }}>
                  {item.description}
                </TableCell>
                <TableCell className="text-right" style={{ 
                  padding: '10px 6px', 
                  fontSize: '9pt',
                  textAlign: 'right',
                  borderBottom: '1px solid #d1d5db',
                  borderRight: 'none',
                  pageBreakInside: 'avoid',
                  color: '#111827'
                }}>
                  {item.quantity} {item.quantityType === "days" ? "Days" : "Qty"}
                </TableCell>
                <TableCell className="text-right" style={{ 
                  padding: '10px 6px', 
                  fontSize: '9pt',
                  textAlign: 'right',
                  borderBottom: '1px solid #d1d5db',
                  borderRight: 'none',
                  pageBreakInside: 'avoid',
                  color: '#111827'
                }}>
                  {formatCurrency(item.unitPrice, invoice.currency)}
                </TableCell>
                <TableCell className="text-right font-medium" style={{ 
                  padding: '10px 6px', 
                  fontSize: '9pt',
                  fontWeight: '500',
                  textAlign: 'right',
                  borderBottom: '1px solid #d1d5db',
                  borderRight: 'none',
                  pageBreakInside: 'avoid',
                  color: '#111827'
                }}>
                  {formatCurrency(item.total, invoice.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary Section */}
      <div className="flex justify-end mb-3" style={{ marginBottom: '20px', justifyContent: 'flex-end', pageBreakInside: 'avoid', pageBreakBefore: 'avoid' }}>
        <div className="w-64" style={{ width: '256px' }}>
          <div className="flex justify-between text-sm" style={{ fontSize: '8pt', marginBottom: '4px', lineHeight: '1.4' }}>
            <span style={{ color: '#111827' }}>Subtotal:</span>
            <span className="font-medium" style={{ color: '#111827' }}>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
          </div>
          {invoice.serviceCharge > 0 && (
            <div className="flex justify-between text-sm" style={{ fontSize: '8pt', marginBottom: '4px', lineHeight: '1.4' }}>
              <span style={{ color: '#111827' }}>Service Charge ({invoice.serviceChargeRate}%):</span>
              <span className="font-medium" style={{ color: '#111827' }}>{formatCurrency(invoice.serviceCharge, invoice.currency)}</span>
            </div>
          )}
          {invoice.damageCharge > 0 && (
            <div className="flex justify-between text-sm" style={{ fontSize: '8pt', marginBottom: '4px', lineHeight: '1.4' }}>
              <span style={{ color: '#111827' }}>Damage Charge:</span>
              <span className="font-medium" style={{ color: '#111827' }}>{formatCurrency(invoice.damageCharge, invoice.currency)}</span>
            </div>
          )}
          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm" style={{ fontSize: '8pt', marginBottom: '4px', lineHeight: '1.4' }}>
              <span style={{ color: '#111827' }}>
                Discount {invoice.discountType === "percentage" ? `(${invoice.discount}%)` : "(Fixed)"}:
              </span>
              <span className="font-medium" style={{ color: '#111827' }}>
                -{formatCurrency(invoice.discount, invoice.currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm" style={{ fontSize: '8pt', marginBottom: '4px', lineHeight: '1.4' }}>
            <span style={{ color: '#111827' }}>Tax ({invoice.taxRate}%):</span>
            <span className="font-medium" style={{ color: '#111827' }}>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
          </div>
          {invoice.priceAdjustment !== 0 && (
            <div className="flex justify-between text-sm" style={{ fontSize: '8pt', marginBottom: '4px', lineHeight: '1.4' }}>
              <span style={{ color: '#111827' }}>
                Price Adjustment {invoice.priceAdjustmentReason && `(${invoice.priceAdjustmentReason})`}:
              </span>
              <span className="font-medium" style={{ color: '#111827' }}>
                {invoice.priceAdjustment > 0 ? "+" : ""}{formatCurrency(invoice.priceAdjustment, invoice.currency)}
              </span>
            </div>
          )}
          <Separator style={{ border: 'none', borderTop: '1px solid #111827', margin: '6px 0' }} />
          <div className="flex justify-between text-lg font-bold" style={{ fontSize: '11pt', fontWeight: '700', marginTop: '4px', lineHeight: '1.4' }}>
            <span style={{ color: '#111827' }}>Total Amount:</span>
            <span style={{ color: '#111827' }}>{formatCurrency(invoice.total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mt-3 pt-2" style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #111827' }}>
          <h3 className="font-semibold text-xs mb-1" style={{ fontSize: '9pt', marginBottom: '6px', color: '#111827' }}>Notes:</h3>
          <p className="text-xs whitespace-pre-wrap" style={{ fontSize: '9pt', lineHeight: '1.5', color: '#111827' }}>
            {invoice.notes}
          </p>
        </div>
      )}

      {/* Payment Information */}
      {(invoice.paymentMethods.length > 0 || bankDetails.length > 0) && (
        <div style={{ 
          marginTop: '12px', 
          paddingTop: '8px', 
          borderTop: '1px solid #111827',
          pageBreakInside: 'avoid',
          breakInside: 'avoid'
        }}>
          <h3 style={{ 
            fontSize: '9pt', 
            fontWeight: '600',
            marginBottom: '8px',
            pageBreakAfter: 'avoid',
            color: '#111827'
          }}>
            Payment Information
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {invoice.paymentMethods.length > 0 && (
              <div style={{ fontSize: '7pt', lineHeight: '1.4', color: '#111827' }}>
                <span style={{ fontWeight: '600' }}>Payment Methods: </span>
                <span>
                  {[
                    invoice.paymentMethods.includes("bank_account") && "Bank Transfer/Wire/Deposit",
                    invoice.paymentMethods.includes("cheque") && "Cheque",
                    invoice.paymentMethods.includes("online") && "Online",
                    invoice.paymentMethods.includes("cash") && "Cash",
                    invoice.paymentMethods.includes("card") && `Card${invoice.cardLast4Digits ? ` (****${invoice.cardLast4Digits})` : ''}`
                  ].filter(Boolean).join(" • ")}
                </span>
              </div>
            )}

            {invoice.checksPayableTo && (
              <div style={{ fontSize: '7pt', lineHeight: '1.4', color: '#111827' }}>
                <span style={{ fontWeight: '600' }}>Checks Payable To: </span>
                <span style={{ fontWeight: '600' }}>{invoice.checksPayableTo}</span>
              </div>
            )}

            {bankDetails.length > 0 && (
              <div style={{ 
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
                    fontSize: '7pt',
                    lineHeight: '1.3'
                  }}>
                    {bankDetails.length > 1 && (
                      <div style={{ fontSize: '7pt', fontWeight: '700', marginBottom: '4px', color: '#111827' }}>
                        Bank #{index + 1}:
                      </div>
                    )}
                    {bankDetails.length === 1 && (
                      <div style={{ fontSize: '7pt', fontWeight: '700', marginBottom: '4px', color: '#111827' }}>
                        Bank Details:
                      </div>
                    )}
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr',
                      gap: '4px 8px',
                      fontSize: '7pt',
                      lineHeight: '1.3'
                    }}>
                      <span style={{ fontWeight: '600', color: '#111827' }}>Bank:</span>
                      <span style={{ color: '#111827' }}>{bankDetail.bankName}</span>
                      <span style={{ fontWeight: '600', color: '#111827' }}>Branch:</span>
                      <span style={{ color: '#111827' }}>{bankDetail.branch}</span>
                      <span style={{ fontWeight: '600', color: '#111827' }}>Account:</span>
                      <span style={{ color: '#111827' }}>{bankDetail.accountName}</span>
                      <span style={{ fontWeight: '600', color: '#111827' }}>A/C No:</span>
                      <span style={{ color: '#111827' }}>{bankDetail.accountNumber}</span>
                      <span style={{ fontWeight: '600', color: '#111827' }}>Address:</span>
                      <span style={{ color: '#111827' }}>{bankDetail.bankAddress}</span>
                      <span style={{ fontWeight: '600', color: '#111827' }}>SWIFT:</span>
                      <span style={{ color: '#111827' }}>{bankDetail.swiftCode}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      </div>

      {/* Footer - Includes Signatures and Footer Text */}
      <div className="mt-auto invoice-footer" style={{ 
        marginTop: 'auto', 
        flexShrink: 0,
        pageBreakInside: 'avoid'
      }}>
        {/* Signature Section */}
        <div className="pt-2" style={{ 
          paddingTop: '8px', 
          borderTop: '1px solid #111827',
          pageBreakInside: 'avoid',
          marginTop: '4px',
          marginBottom: '8px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            gap: '24px',
            pageBreakInside: 'avoid'
          }}>
            {/* Guest Signature - Left Aligned */}
            <div style={{ 
              pageBreakInside: 'avoid',
              textAlign: 'left',
              flex: '0 0 auto'
            }}>
              <div className="mb-1.5" style={{ 
                marginBottom: '6px', 
                borderBottom: '1px solid #111827', 
                paddingBottom: '2px',
                minHeight: '1px',
                width: '150px'
              }}>
                {/* Signature line */}
              </div>
              <p className="text-xs font-medium" style={{ fontSize: '9pt', fontWeight: '600', color: '#111827', textAlign: 'left' }}>
                Guest Signature
              </p>
            </div>

            {/* Hotel Signature - Right Aligned */}
            <div style={{ 
              pageBreakInside: 'avoid',
              textAlign: 'right',
              flex: '0 0 auto',
              marginLeft: 'auto'
            }}>
              <div className="mb-1.5" style={{ 
                marginBottom: '6px', 
                borderBottom: '1px solid #111827', 
                paddingBottom: '2px',
                minHeight: '1px',
                width: '150px',
                marginLeft: 'auto'
              }}>
                {/* Signature line */}
              </div>
              <p className="text-xs font-medium" style={{ fontSize: '9pt', fontWeight: '600', color: '#111827', textAlign: 'right' }}>
                Authorized Signature
              </p>
              {hotelInfo && (
                <p className="text-xs mt-0.5" style={{ fontSize: '9pt', marginTop: '2px', color: '#111827', textAlign: 'right' }}>
                  {hotelInfo.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Text */}
        {hotelInfo && (
          <div className="pt-2" style={{ 
            paddingTop: '6px', 
            borderTop: '1px solid #111827',
            marginTop: '4px'
          }}>
            <div className="text-center text-xs" style={{ fontSize: '8pt', color: '#111827', lineHeight: '1.5' }}>
              <p className="mb-0.5" style={{ marginBottom: '4px' }}>Thank you for choosing {hotelInfo.name}! We hope to see you again soon.</p>
              <p style={{ color: '#111827' }}>
                {hotelInfo.name} Powered by <span className="font-semibold">Phoenix Global Solutions</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
