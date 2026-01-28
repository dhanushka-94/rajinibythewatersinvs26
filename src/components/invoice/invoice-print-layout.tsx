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
import { getHotelInfo, type HotelInfo } from "@/lib/hotel-info";
import { formatCurrency } from "@/lib/currency";
import { getBankDetailById } from "@/lib/bank-details";
import { getTravelCompanyById } from "@/lib/travel-companies";
import { type TravelCompany } from "@/types/travel-company";
import { formatDateSL } from "@/lib/date-sl";
import { Building2, FileText, Wallet, Globe, Banknote, CreditCard, Calendar, User, Mail, Phone, MapPin, Building, IdCard, UserCircle, Hash, LogIn, LogOut, Users } from "lucide-react";
import { useState, useEffect } from "react";

interface InvoicePrintLayoutProps {
  invoice: Invoice;
  /** Pre-fetched data for print; when provided, used immediately so Bill To travel company is ready before print. */
  initialHotelInfo?: HotelInfo | null;
  initialTravelCompany?: TravelCompany | null;
  initialBankDetails?: BankDetail[] | null;
}

export function InvoicePrintLayout({
  invoice,
  initialHotelInfo,
  initialTravelCompany,
  initialBankDetails,
}: InvoicePrintLayoutProps) {
  const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(initialHotelInfo ?? null);
  const [bankDetails, setBankDetails] = useState<BankDetail[]>(initialBankDetails ?? []);
  const [travelCompany, setTravelCompany] = useState<TravelCompany | null>(initialTravelCompany ?? null);

  useEffect(() => {
    const hasPrefetched = initialHotelInfo !== undefined || initialTravelCompany !== undefined || initialBankDetails !== undefined;
    if (hasPrefetched) {
      if (initialHotelInfo !== undefined) setHotelInfo(initialHotelInfo);
      if (initialTravelCompany !== undefined) setTravelCompany(initialTravelCompany);
      if (initialBankDetails !== undefined) setBankDetails(initialBankDetails ?? []);
      return;
    }
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
  }, [
    invoice.selectedBankDetailIds,
    invoice.selectedBankDetailId,
    invoice.billingType,
    invoice.travelCompanyId,
    initialHotelInfo,
    initialTravelCompany,
    initialBankDetails,
  ]);

  return (
    <div className="invoice-print-template antialiased" style={{ 
      width: '210mm', 
      minHeight: '297mm',
      padding: '10mm',
      margin: '0 auto',
      backgroundColor: 'white',
      boxSizing: 'border-box',
      border: 'none',
      boxShadow: 'none',
      display: 'flex',
      flexDirection: 'column',
      color: '#111827'
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
                <div className="leading-tight" style={{ fontSize: '8pt', lineHeight: '1.4', color: '#111827' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', marginBottom: '2px' }}>
                    <MapPin style={{ width: '10px', height: '10px', color: '#6b7280', marginTop: '2px', flexShrink: 0 }} />
                    <p style={{ margin: '0', padding: '0', color: '#111827' }}>{hotelInfo.address}, {hotelInfo.city}, {hotelInfo.country}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
                    {hotelInfo.hotline && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Phone style={{ width: '10px', height: '10px', color: '#6b7280' }} />
                        <span style={{ color: '#111827' }}>Hotline: {hotelInfo.hotline}</span>
                      </div>
                    )}
                    {hotelInfo.telephone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Phone style={{ width: '10px', height: '10px', color: '#6b7280' }} />
                        <span style={{ color: '#111827' }}>Tel: {hotelInfo.telephone}</span>
                      </div>
                    )}
                    {hotelInfo.usaContact && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Phone style={{ width: '10px', height: '10px', color: '#6b7280' }} />
                        <span style={{ color: '#111827' }}>USA: {hotelInfo.usaContact}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {hotelInfo.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Mail style={{ width: '10px', height: '10px', color: '#6b7280' }} />
                        <span style={{ color: '#111827' }}>{hotelInfo.email}</span>
                      </div>
                    )}
                    {hotelInfo.website && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Globe style={{ width: '10px', height: '10px', color: '#6b7280' }} />
                        <span style={{ color: '#111827' }}>{hotelInfo.website}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="text-right ml-4" style={{ marginLeft: '16px' }}>
            <h2 className="text-2xl font-bold tracking-tight mb-1 text-gray-900" style={{ fontSize: '14pt', marginBottom: '4px', letterSpacing: '-0.02em' }}>INVOICE</h2>
            <p className="text-base font-bold text-gray-900 mb-1" style={{ fontSize: '12pt', marginBottom: '4px' }}>
              {invoice.invoiceNumber}
            </p>
            <div className="flex items-center justify-end gap-2 mb-1" style={{ marginBottom: '4px' }}>
              <p style={{ fontSize: '8pt', color: '#111827' }}>
                Currency: {invoice.currency}
              </p>
            </div>
            <p style={{ fontSize: '8pt', color: '#111827' }}>
              Date: {formatDateSL(invoice.createdAt, { month: "long" })}
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
          <h2 className="font-semibold mb-2 text-gray-900" style={{ fontSize: '10pt', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#111827' }}>
            <Building2 style={{ width: '13px', height: '13px', color: '#6b7280' }} />
            Bill To:
          </h2>
          {invoice.billingType === "company" && travelCompany ? (
            <div className="space-y-1" style={{ fontSize: '9pt', lineHeight: '1.5', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                <Building2 style={{ width: '11px', height: '11px', color: '#111827', marginTop: '2px', flexShrink: 0 }} />
                <p className="font-medium" style={{ color: '#111827' }}>{travelCompany.name}</p>
              </div>
              {travelCompany.contactPerson && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                  <Hash style={{ width: '11px', height: '11px', color: '#111827', marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ color: '#111827' }}>{travelCompany.contactPersonTitle ? `${travelCompany.contactPersonTitle} ` : ''}{travelCompany.contactPerson}</p>
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
            <div className="space-y-1" style={{ fontSize: '9pt', lineHeight: '1.5' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                <User style={{ width: '11px', height: '11px', color: '#6b7280', marginTop: '2px', flexShrink: 0 }} />
                <p className="font-medium" style={{ color: '#111827' }}>{invoice.guest.title ? `${invoice.guest.title} ` : ''}{invoice.guest.name}</p>
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
            <h3 className="font-semibold mb-2 text-gray-900" style={{ fontSize: '10pt', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#111827' }}>
              <UserCircle style={{ width: '13px', height: '13px', color: '#6b7280' }} />
              Guest Information:
            </h3>
            <div className="space-y-1" style={{ fontSize: '9pt', lineHeight: '1.5' }}>
              {/* Show primary guest if billing to company OR if there are additional guests */}
              {(invoice.billingType === "company" || (invoice.guests && invoice.guests.length > 0)) && invoice.guest.name && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                  <User style={{ width: '11px', height: '11px', color: '#111827', marginTop: '2px', flexShrink: 0 }} />
                  <p style={{ color: '#111827' }}>{invoice.guest.title ? `${invoice.guest.title} ` : ''}{invoice.guest.name}</p>
                </div>
              )}
              {/* Show additional guests (only names) */}
              {invoice.guests && invoice.guests.length > 0 && (
                <>
                  {invoice.guests.map((guest, index) => (
                    guest.name && (
                      <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '4px' }}>
                        <User style={{ width: '11px', height: '11px', color: '#111827', marginTop: '2px', flexShrink: 0 }} />
                        <p style={{ color: '#111827' }}>{guest.title ? `${guest.title} ` : ''}{guest.name}</p>
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
            <h3 className="font-semibold mb-2 text-gray-900" style={{ fontSize: '10pt', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#111827' }}>
              <Calendar style={{ width: '13px', height: '13px', color: '#6b7280' }} />
              Booking Details:
            </h3>
          <div style={{ fontSize: '9pt', lineHeight: '1.5' }}>
            {/* Line 1: Check-in and Check-out */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 12px', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LogIn style={{ width: '11px', height: '11px', color: '#111827', flexShrink: 0 }} />
                <span style={{ fontWeight: '500', color: '#111827' }}>Check-in: </span>
                <span style={{ color: '#111827' }}>
                  {formatDateSL(invoice.checkIn)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <LogOut style={{ width: '11px', height: '11px', color: '#111827', flexShrink: 0 }} />
                <span style={{ fontWeight: '500', color: '#111827' }}>Check-out: </span>
                <span style={{ color: '#111827' }}>
                  {formatDateSL(invoice.checkOut)}
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

      {/* Invoice Items Table - allowed to break across pages when too many items */}
      <div className="mb-4 invoice-items-table" style={{ marginBottom: '24px' }}>
        <Table style={{ width: '100%', borderCollapse: 'collapse', borderSpacing: 0, border: '1px solid #ffffff' }}>
          <TableHeader className="[&_tr]:border-0" style={{ border: 'none', borderWidth: 0 }}>
            <TableRow className="border-0" style={{ 
              pageBreakInside: 'avoid', 
              backgroundColor: '#f3f4f6', 
              borderBottom: '1px solid #ffffff !important',
              borderTop: 'none !important',
              borderLeft: 'none !important',
              borderRight: 'none !important',
              borderWidth: '0 0 1px 0',
              borderColor: 'transparent transparent #ffffff transparent',
              borderStyle: 'none none solid none'
            }}>
              <TableHead className="font-semibold text-left border-0" style={{ 
                padding: '10px 6px', 
                fontSize: '9pt',
                fontWeight: '600',
                textAlign: 'left',
                borderRight: '1px solid #ffffff !important',
                borderBottom: '1px solid #ffffff !important',
                borderTop: 'none !important',
                borderLeft: 'none !important',
                borderWidth: '0 1px 1px 0',
                borderColor: 'transparent #ffffff #ffffff transparent',
                borderStyle: 'none solid solid none',
                pageBreakInside: 'avoid',
                color: '#111827',
                backgroundColor: '#f3f4f6'
              }}>
                Description
              </TableHead>
              <TableHead className="text-right font-semibold border-0" style={{ 
                padding: '10px 6px', 
                fontSize: '9pt',
                fontWeight: '600',
                textAlign: 'right',
                borderRight: '1px solid #ffffff !important',
                borderBottom: '1px solid #ffffff !important',
                borderTop: 'none !important',
                borderLeft: 'none !important',
                borderWidth: '0 1px 1px 0',
                borderColor: 'transparent #ffffff #ffffff transparent',
                borderStyle: 'none solid solid none',
                pageBreakInside: 'avoid',
                color: '#111827',
                backgroundColor: '#f3f4f6'
              }}>
                Qty/Days
              </TableHead>
              <TableHead className="text-right font-semibold border-0" style={{ 
                padding: '10px 6px', 
                fontSize: '9pt',
                fontWeight: '600',
                textAlign: 'right',
                borderRight: '1px solid #ffffff !important',
                borderBottom: '1px solid #ffffff !important',
                borderTop: 'none !important',
                borderLeft: 'none !important',
                borderWidth: '0 1px 1px 0',
                borderColor: 'transparent #ffffff #ffffff transparent',
                borderStyle: 'none solid solid none',
                pageBreakInside: 'avoid',
                color: '#111827',
                backgroundColor: '#f3f4f6'
              }}>
                Unit Price
              </TableHead>
              <TableHead className="text-right font-semibold border-0" style={{ 
                padding: '10px 6px', 
                fontSize: '9pt',
                fontWeight: '600',
                textAlign: 'right',
                borderBottom: '1px solid #ffffff !important',
                borderTop: 'none !important',
                borderLeft: 'none !important',
                borderRight: 'none !important',
                borderWidth: '0 0 1px 0',
                borderColor: 'transparent transparent #ffffff transparent',
                borderStyle: 'none none solid none',
                pageBreakInside: 'avoid',
                color: '#111827',
                backgroundColor: '#f3f4f6'
              }}>
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr]:border-0" style={{ border: 'none', borderWidth: 0 }}>
            {invoice.items.map((item, index) => (
              <TableRow key={item.id} className="border-0" style={{ 
                pageBreakInside: 'avoid', 
                borderBottom: index < invoice.items.length - 1 ? '1px solid #ffffff !important' : 'none !important',
                borderTop: 'none !important',
                borderLeft: 'none !important',
                borderRight: 'none !important',
                borderWidth: index < invoice.items.length - 1 ? '0 0 1px 0' : '0',
                borderColor: index < invoice.items.length - 1 ? 'transparent transparent #ffffff transparent' : 'transparent',
                borderStyle: index < invoice.items.length - 1 ? 'none none solid none' : 'none'
              }}>
                <TableCell className="font-medium text-left border-0" style={{ 
                  padding: '10px 6px', 
                  fontSize: '9pt',
                  textAlign: 'left',
                  borderRight: '1px solid #ffffff !important',
                  borderTop: 'none !important',
                  borderLeft: 'none !important',
                  borderBottom: 'none !important',
                  borderWidth: '0 1px 0 0',
                  borderColor: 'transparent #ffffff transparent transparent',
                  borderStyle: 'none solid none none',
                  pageBreakInside: 'avoid',
                  color: '#111827'
                }}>
                  {item.description}
                </TableCell>
                <TableCell className="text-right border-0" style={{ 
                  padding: '10px 6px', 
                  fontSize: '9pt',
                  textAlign: 'right',
                  borderRight: '1px solid #ffffff !important',
                  borderTop: 'none !important',
                  borderLeft: 'none !important',
                  borderBottom: 'none !important',
                  borderWidth: '0 1px 0 0',
                  borderColor: 'transparent #ffffff transparent transparent',
                  borderStyle: 'none solid none none',
                  pageBreakInside: 'avoid',
                  color: '#111827'
                }}>
                  {item.quantity} {item.quantityType === "days" ? "Days" : "Qty"}
                </TableCell>
                <TableCell className="text-right border-0" style={{ 
                  padding: '10px 6px', 
                  fontSize: '9pt',
                  textAlign: 'right',
                  borderRight: '1px solid #ffffff !important',
                  borderTop: 'none !important',
                  borderLeft: 'none !important',
                  borderBottom: 'none !important',
                  borderWidth: '0 1px 0 0',
                  borderColor: 'transparent #ffffff transparent transparent',
                  borderStyle: 'none solid none none',
                  pageBreakInside: 'avoid',
                  color: '#111827'
                }}>
                  {formatCurrency(item.unitPrice, invoice.currency)}
                </TableCell>
                <TableCell className="text-right font-medium border-0" style={{ 
                  padding: '10px 6px', 
                  fontSize: '9pt',
                  fontWeight: '500',
                  textAlign: 'right',
                  borderTop: 'none !important',
                  borderLeft: 'none !important',
                  borderRight: 'none !important',
                  borderBottom: 'none !important',
                  borderWidth: '0',
                  borderColor: 'transparent',
                  borderStyle: 'none',
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

      {/* Summary Section - right edge of amounts aligns with Total column */}
      <div className="flex justify-end mb-3 w-full" style={{ marginBottom: '20px', justifyContent: 'flex-end', pageBreakInside: 'avoid', pageBreakBefore: 'avoid', width: '100%' }}>
        <div className="w-64" style={{ width: '256px', paddingRight: '6px', boxSizing: 'border-box' }}>
          <div className="flex justify-between" style={{ fontSize: '9pt', marginBottom: '4px', lineHeight: '1.4', color: '#111827' }}>
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
          </div>
          {invoice.serviceCharge > 0 && (
            <div className="flex justify-between" style={{ fontSize: '9pt', marginBottom: '4px', lineHeight: '1.4', color: '#111827' }}>
              <span>Service Charge ({invoice.serviceChargeRate}%):</span>
              <span className="font-medium">{formatCurrency(invoice.serviceCharge, invoice.currency)}</span>
            </div>
          )}
          {invoice.damageCharge > 0 && (
            <div className="flex justify-between" style={{ fontSize: '9pt', marginBottom: '4px', lineHeight: '1.4', color: '#111827' }}>
              <span>Damage Charge:</span>
              <span className="font-medium">{formatCurrency(invoice.damageCharge, invoice.currency)}</span>
            </div>
          )}
          {invoice.discount > 0 && (
            <div className="flex justify-between" style={{ fontSize: '9pt', marginBottom: '4px', lineHeight: '1.4', color: '#111827' }}>
              <span>Discount {invoice.discountType === "percentage" ? `(${invoice.discount}%)` : "(Fixed)"}:</span>
              <span className="font-medium">-{formatCurrency(invoice.discount, invoice.currency)}</span>
            </div>
          )}
          <div className="flex justify-between" style={{ fontSize: '9pt', marginBottom: '4px', lineHeight: '1.4', color: '#111827' }}>
            <span>Tax ({invoice.taxRate}%):</span>
            <span className="font-medium">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
          </div>
          {invoice.priceAdjustment !== 0 && (
            <div className="flex justify-between" style={{ fontSize: '9pt', marginBottom: '4px', lineHeight: '1.4', color: '#111827' }}>
              <span>Price Adjustment {invoice.priceAdjustmentReason && `(${invoice.priceAdjustmentReason})`}:</span>
              <span className="font-medium">{invoice.priceAdjustment > 0 ? "+" : ""}{formatCurrency(invoice.priceAdjustment, invoice.currency)}</span>
            </div>
          )}
          <Separator style={{ border: 'none', borderTop: '1px solid #111827', margin: '6px 0' }} />
          <div className="flex justify-between font-bold" style={{ fontSize: '11pt', fontWeight: '700', marginTop: '4px', lineHeight: '1.4', color: '#111827' }}>
            <span>Total Amount:</span>
            <span>{formatCurrency(invoice.total, invoice.currency)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mt-3 pt-2" style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid #111827' }}>
          <h3 className="font-semibold mb-1" style={{ fontSize: '9pt', marginBottom: '6px', color: '#111827' }}>Notes:</h3>
          <p className="whitespace-pre-wrap" style={{ fontSize: '9pt', lineHeight: '1.5', color: '#111827' }}>
            {invoice.notes}
          </p>
        </div>
      )}

      {/* Payment Information */}
      {(invoice.paymentMethods.length > 0 || bankDetails.length > 0) && (
        <div style={{ 
          marginTop: '12px',
          pageBreakInside: 'avoid',
          breakInside: 'avoid'
        }}>
          <h3 style={{ 
            fontSize: '9pt', 
            fontWeight: '600',
            marginBottom: '8px',
            pageBreakAfter: 'avoid',
            color: '#111827',
            backgroundColor: '#f3f4f6',
            padding: '6px 8px'
          }}>
            Payment Information
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {invoice.paymentMethods.length > 0 && (
              <div style={{ fontSize: '9pt', lineHeight: '1.4', color: '#111827' }}>
                <span style={{ fontWeight: '600' }}>Payment Methods: </span>
                <span>
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
                    fontSize: '9pt',
                    lineHeight: '1.3'
                  }}>
                    {bankDetails.length > 1 && (
                      <div style={{ fontSize: '9pt', fontWeight: '700', marginBottom: '4px', color: '#111827' }}>
                        Bank #{index + 1}:
                      </div>
                    )}
                    {bankDetails.length === 1 && (
                      <div style={{ fontSize: '9pt', fontWeight: '700', marginBottom: '4px', color: '#111827' }}>
                        Bank Details:
                      </div>
                    )}
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr',
                      gap: '4px 8px',
                      fontSize: '9pt',
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

            {invoice.checksPayableTo && (
              <div style={{ fontSize: '9pt', lineHeight: '1.4', color: '#111827', marginTop: '8px' }}>
                <span style={{ fontWeight: '600' }}>Make Checks Payable To: </span>
                <span style={{ fontWeight: '600' }}>{invoice.checksPayableTo}</span>
              </div>
            )}
          </div>
        </div>
      )}

      </div>

      {/* Footer */}
      <div className="mt-auto invoice-footer" style={{ 
        marginTop: 'auto', 
        flexShrink: 0,
        pageBreakInside: 'avoid'
      }}>
        {/* Footer Text */}
        {hotelInfo && (
          <div className="pt-2" style={{ 
            paddingTop: '6px', 
            borderTop: '1px solid #111827',
            marginTop: '4px'
          }}>
            <div className="text-center" style={{ fontSize: '8pt', color: '#111827', lineHeight: '1.5' }}>
              <p className="mb-0.5" style={{ marginBottom: '4px' }}>Thank you for choosing {hotelInfo.name}! We hope to see you again soon.</p>
              <p>
                {hotelInfo.name} Powered by <span className="font-semibold">Phoenix Global Solutions</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
