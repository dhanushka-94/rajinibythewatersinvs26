import { supabase } from './supabase';
import { Invoice } from '@/types/invoice';
import { createActivityLog } from './activity-logs';

// In-memory fallback if Supabase is not configured
let fallbackInvoices: Invoice[] = [];

const isSupabaseConfigured = () => {
  return supabase !== null;
};

// Map database row to Invoice interface
const mapDbToInvoice = (data: any): Invoice => {
  return {
    id: data.id,
    invoiceNumber: data.invoice_number,
    guest: data.guest,
    guests: data.guests || undefined, // Multiple guests array
    billingType: data.billing_type || "guest", // Default to "guest" for backward compatibility
    travelCompanyId: data.travel_company_id,
    currency: data.currency,
    checkIn: data.check_in,
    checkOut: data.check_out,
    // roomNumber removed - kept for backward compatibility with DB
    roomType: data.room_type,
    adults: data.adults || undefined,
    children: data.children || undefined,
    babies: data.babies || undefined,
    items: data.items,
    subtotal: data.subtotal,
    serviceCharge: data.service_charge,
    serviceChargeRate: data.service_charge_rate,
    damageCharge: data.damage_charge,
    taxRate: data.tax_rate,
    taxAmount: data.tax_amount,
    discount: data.discount,
    discountType: data.discount_type,
    priceAdjustment: data.price_adjustment,
    priceAdjustmentReason: data.price_adjustment_reason,
    total: data.total,
    paymentMethods: data.payment_methods || [],
    selectedBankDetailId: data.selected_bank_detail_id, // For backward compatibility
    selectedBankDetailIds: data.selected_bank_detail_ids || (data.selected_bank_detail_id ? [data.selected_bank_detail_id] : undefined),
    checksPayableTo: data.checks_payable_to,
    cardLast4Digits: data.card_last_4_digits,
    status: data.status,
    payments: data.payments || [],
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

// Map Invoice interface to database row
const mapInvoiceToDb = (invoice: Invoice): any => {
  const dbData: any = {
    invoice_number: invoice.invoiceNumber,
    guest: invoice.guest,
    billing_type: invoice.billingType || "guest",
    travel_company_id: invoice.travelCompanyId || null,
    currency: invoice.currency,
    check_in: invoice.checkIn,
    check_out: invoice.checkOut,
    room_number: "", // roomNumber removed from system
    room_type: invoice.roomType,
    adults: invoice.adults || null,
    children: invoice.children || null,
    babies: invoice.babies || null,
    items: invoice.items,
    subtotal: invoice.subtotal,
    service_charge: invoice.serviceCharge,
    service_charge_rate: invoice.serviceChargeRate,
    damage_charge: invoice.damageCharge,
    tax_rate: invoice.taxRate,
    tax_amount: invoice.taxAmount,
    discount: invoice.discount,
    discount_type: invoice.discountType,
    price_adjustment: invoice.priceAdjustment,
    price_adjustment_reason: invoice.priceAdjustmentReason,
    total: invoice.total,
    payment_methods: invoice.paymentMethods,
    selected_bank_detail_id: invoice.selectedBankDetailId, // For backward compatibility
    selected_bank_detail_ids: invoice.selectedBankDetailIds || (invoice.selectedBankDetailId ? [invoice.selectedBankDetailId] : null),
    checks_payable_to: invoice.checksPayableTo,
    status: invoice.status,
    notes: invoice.notes,
  };
  
  // Only include card_last_4_digits if it has a value (to avoid errors if column doesn't exist)
  if (invoice.cardLast4Digits) {
    dbData.card_last_4_digits = invoice.cardLast4Digits;
  }
  
  // Include guests if it exists (to avoid errors if column doesn't exist yet)
  // After running MIGRATION_ADD_GUESTS_COLUMN.sql, this will always work
  // For now, only include it if there are guests to avoid errors before migration
  if (invoice.guests && invoice.guests.length > 0) {
    dbData.guests = invoice.guests;
  } else if (invoice.guests !== undefined) {
    // If guests is explicitly set to empty array, save as null
    // This allows clearing additional guests
    dbData.guests = null;
  }
  
  return dbData;
};

export async function getInvoices(): Promise<Invoice[]> {
  if (!isSupabaseConfigured()) {
    return fallbackInvoices;
  }

  try {
    if (!supabase) {
      return fallbackInvoices;
    }
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      return fallbackInvoices;
    }

    return (data || []).map(mapDbToInvoice);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return fallbackInvoices;
  }
}

export async function getInvoiceById(id: string, logView: boolean = false): Promise<Invoice | undefined> {
  if (!isSupabaseConfigured()) {
    return fallbackInvoices.find((inv) => inv.id === id);
  }

  try {
    if (!supabase) {
      return fallbackInvoices.find((inv) => inv.id === id);
    }
    
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching invoice from Supabase:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        invoiceId: id
      });
      // Try fallback
      const fallback = fallbackInvoices.find((inv) => inv.id === id);
      if (fallback) {
        return fallback;
      }
      return undefined;
    }

    if (!data) {
      console.warn('No invoice found with id:', id);
      return undefined;
    }
    
    const invoice = mapDbToInvoice(data);
    
    // Log view activity (only if explicitly requested to avoid logging every fetch)
    if (logView) {
      await createActivityLog(
        "invoice_viewed",
        "invoice",
        `Viewed invoice ${invoice.invoiceNumber}`,
        {
          entityId: id,
          entityName: invoice.invoiceNumber,
        }
      );
    }
    
    return invoice;
  } catch (error) {
    console.error('Unexpected error fetching invoice:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      invoiceId: id
    });
    // Try fallback
    const fallback = fallbackInvoices.find((inv) => inv.id === id);
    if (fallback) {
      return fallback;
    }
    return undefined;
  }
}

export async function createInvoice(invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">): Promise<Invoice> {
  if (!isSupabaseConfigured()) {
    const newInvoice: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    fallbackInvoices.push(newInvoice);
    return newInvoice;
  }

  try {
    if (!supabase) {
      const newInvoice: Invoice = {
        ...invoice,
        id: `inv-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      fallbackInvoices.push(newInvoice);
      return newInvoice;
    }

    const dbData = mapInvoiceToDb(invoice as Invoice);
    const { data, error } = await supabase
      .from('invoices')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('Error creating invoice:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      });
      const newInvoice: Invoice = {
        ...invoice,
        id: `inv-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      fallbackInvoices.push(newInvoice);
      return newInvoice;
    }

    const createdInvoice = mapDbToInvoice(data);
    
    // Log activity
    await createActivityLog(
      "invoice_created",
      "invoice",
      `Created invoice ${createdInvoice.invoiceNumber} for ${invoice.guest.name}`,
      {
        entityId: createdInvoice.id,
        entityName: createdInvoice.invoiceNumber,
        metadata: {
          guestName: invoice.guest.name,
          total: invoice.total,
          currency: invoice.currency,
          status: invoice.status,
        },
      }
    );
    
    return createdInvoice;
  } catch (error) {
    console.error('Error creating invoice:', error);
    const newInvoice: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    fallbackInvoices.push(newInvoice);
    return newInvoice;
  }
}

export async function updateInvoice(id: string, invoice: Partial<Invoice>): Promise<void> {
  // Get invoice details first to check status
  const existingInvoice = await getInvoiceById(id);
  
  if (!existingInvoice) {
    throw new Error("Invoice not found");
  }

  // Prevent editing of paid invoices (except status changes to cancelled if needed)
  if (existingInvoice.status === "paid") {
    // Only allow status change to cancelled, nothing else
    const isOnlyStatusChangeToCancelled = 
      Object.keys(invoice).length === 1 && 
      invoice.status === "cancelled";
    
    if (!isOnlyStatusChangeToCancelled) {
      throw new Error("Cannot edit a paid invoice. Paid invoices are protected from modification.");
    }
  }

  if (!isSupabaseConfigured()) {
    const index = fallbackInvoices.findIndex((inv) => inv.id === id);
    if (index !== -1) {
      fallbackInvoices[index] = { ...fallbackInvoices[index], ...invoice };
    }
    return;
  }

  try {
    if (!supabase) {
      const index = fallbackInvoices.findIndex((inv) => inv.id === id);
      if (index !== -1) {
        fallbackInvoices[index] = { ...fallbackInvoices[index], ...invoice };
      }
      return;
    }

    const dbData: any = {};
    if (invoice.invoiceNumber !== undefined) dbData.invoice_number = invoice.invoiceNumber;
    if (invoice.guest !== undefined) dbData.guest = invoice.guest;
    if (invoice.billingType !== undefined) dbData.billing_type = invoice.billingType;
    if (invoice.travelCompanyId !== undefined) dbData.travel_company_id = invoice.travelCompanyId || null;
    if (invoice.currency !== undefined) dbData.currency = invoice.currency;
    if (invoice.checkIn !== undefined) dbData.check_in = invoice.checkIn;
    if (invoice.checkOut !== undefined) dbData.check_out = invoice.checkOut;
    // roomNumber removed - always set to empty string
    dbData.room_number = "";
    if (invoice.roomType !== undefined) dbData.room_type = invoice.roomType;
    if (invoice.adults !== undefined) dbData.adults = invoice.adults || null;
    if (invoice.children !== undefined) dbData.children = invoice.children || null;
    if (invoice.babies !== undefined) dbData.babies = invoice.babies || null;
    if (invoice.items !== undefined) dbData.items = invoice.items;
    if (invoice.subtotal !== undefined) dbData.subtotal = invoice.subtotal;
    if (invoice.serviceCharge !== undefined) dbData.service_charge = invoice.serviceCharge;
    if (invoice.serviceChargeRate !== undefined) dbData.service_charge_rate = invoice.serviceChargeRate;
    if (invoice.damageCharge !== undefined) dbData.damage_charge = invoice.damageCharge;
    if (invoice.taxRate !== undefined) dbData.tax_rate = invoice.taxRate;
    if (invoice.taxAmount !== undefined) dbData.tax_amount = invoice.taxAmount;
    if (invoice.discount !== undefined) dbData.discount = invoice.discount;
    if (invoice.discountType !== undefined) dbData.discount_type = invoice.discountType;
    if (invoice.priceAdjustment !== undefined) dbData.price_adjustment = invoice.priceAdjustment;
    if (invoice.priceAdjustmentReason !== undefined) dbData.price_adjustment_reason = invoice.priceAdjustmentReason;
    if (invoice.total !== undefined) dbData.total = invoice.total;
    if (invoice.paymentMethods !== undefined) dbData.payment_methods = invoice.paymentMethods;
    // Handle bank detail IDs - prefer array, fallback to single ID for backward compatibility
    // Note: selected_bank_detail_ids column may not exist yet, so we'll handle errors gracefully
    if (invoice.selectedBankDetailIds !== undefined) {
      if (invoice.selectedBankDetailIds.length > 0) {
        // Try to use the new array column, but fallback to single ID if column doesn't exist
        dbData.selected_bank_detail_ids = invoice.selectedBankDetailIds;
        // Also set the first one as selected_bank_detail_id for backward compatibility
        dbData.selected_bank_detail_id = invoice.selectedBankDetailIds[0];
      } else {
        // Clear both if empty array
        dbData.selected_bank_detail_id = null;
        // Only try to set selected_bank_detail_ids to null if column exists (will be handled in error catch)
        dbData.selected_bank_detail_ids = null;
      }
    } else if (invoice.selectedBankDetailId !== undefined) {
      dbData.selected_bank_detail_id = invoice.selectedBankDetailId;
    }
    if (invoice.checksPayableTo !== undefined) dbData.checks_payable_to = invoice.checksPayableTo;
    if (invoice.cardLast4Digits !== undefined) dbData.card_last_4_digits = invoice.cardLast4Digits;
    if (invoice.status !== undefined) dbData.status = invoice.status;
    if (invoice.payments !== undefined) dbData.payments = invoice.payments;
    if (invoice.notes !== undefined) dbData.notes = invoice.notes;
    // Handle guests field
    if (invoice.guests !== undefined) {
      if (invoice.guests && invoice.guests.length > 0) {
        dbData.guests = invoice.guests;
      } else {
        dbData.guests = null;
      }
    }
    dbData.updated_at = new Date().toISOString();

    // Try to update, but handle case where selected_bank_detail_ids column might not exist
    let { error } = await supabase
      .from('invoices')
      .update(dbData)
      .eq('id', id);

    // If error is about missing column (selected_bank_detail_ids), retry without it
    if (error && (error.code === '42703' || error.message?.includes('selected_bank_detail_ids') || error.message?.includes('column') && error.message?.includes('does not exist'))) {
      // Column doesn't exist yet, remove it and retry
      const { selected_bank_detail_ids, ...dbDataWithoutArray } = dbData;
      // If we had an array, use the first ID as fallback
      if (invoice.selectedBankDetailIds && invoice.selectedBankDetailIds.length > 0) {
        dbDataWithoutArray.selected_bank_detail_id = invoice.selectedBankDetailIds[0];
      }
      const retryResult = await supabase
        .from('invoices')
        .update(dbDataWithoutArray)
        .eq('id', id);
      error = retryResult.error;
    }

    if (error) {
      console.error('Error updating invoice:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      });
      throw new Error(`Failed to update invoice: ${error.message || 'Unknown error'}`);
    } else {
      // Get invoice details for logging
      const updatedInvoice = await getInvoiceById(id);
      if (updatedInvoice) {
        // Log activity
        await createActivityLog(
          "invoice_updated",
          "invoice",
          `Updated invoice ${updatedInvoice.invoiceNumber}`,
          {
            entityId: id,
            entityName: updatedInvoice.invoiceNumber,
            metadata: {
              changes: Object.keys(dbData),
              status: updatedInvoice.status,
            },
          }
        );
      }
    }
  } catch (error) {
    console.error('Error updating invoice:', error);
  }
}

export async function deleteInvoice(id: string): Promise<void> {
  // Get invoice details first to check status
  const invoiceToDelete = await getInvoiceById(id);
  
  if (!invoiceToDelete) {
    throw new Error("Invoice not found");
  }

  // Prevent deletion of paid invoices
  if (invoiceToDelete.status === "paid") {
    throw new Error("Cannot delete a paid invoice. Paid invoices are protected from deletion.");
  }

  if (!isSupabaseConfigured()) {
    const index = fallbackInvoices.findIndex((inv) => inv.id === id);
    if (index !== -1) {
      fallbackInvoices.splice(index, 1);
    }
    return;
  }

  try {
    if (!supabase) {
      const index = fallbackInvoices.findIndex((inv) => inv.id === id);
      if (index !== -1) {
        fallbackInvoices.splice(index, 1);
      }
      return;
    }

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting invoice:', error);
      throw new Error("Failed to delete invoice");
    } else if (invoiceToDelete) {
      // Log activity
      await createActivityLog(
        "invoice_deleted",
        "invoice",
        `Deleted invoice ${invoiceToDelete.invoiceNumber}`,
        {
          entityId: id,
          entityName: invoiceToDelete.invoiceNumber,
          metadata: {
            guestName: invoiceToDelete.guest.name,
            total: invoiceToDelete.total,
            currency: invoiceToDelete.currency,
          },
        }
      );
    }
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw error;
  }
}
