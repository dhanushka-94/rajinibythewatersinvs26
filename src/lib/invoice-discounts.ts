"use server";

import { supabase } from "./supabase";
import { DiscountType } from "@/types/discount";
import { incrementDiscountUsage } from "./discounts";

export interface InvoiceDiscountRecord {
  id: string;
  invoiceId: string;
  discountId: string;
  couponCodeId?: string;
  guestId?: string;
  discountAmount: number;
  discountType: DiscountType;
  discountValueUsed: number;
}

export async function getInvoiceDiscount(invoiceId: string): Promise<InvoiceDiscountRecord | undefined> {
  if (!supabase) return undefined;
  const { data, error } = await supabase
    .from("invoice_discounts")
    .select("*")
    .eq("invoice_id", invoiceId)
    .maybeSingle();
  if (error || !data) return undefined;
  return {
    id: data.id,
    invoiceId: data.invoice_id,
    discountId: data.discount_id,
    couponCodeId: data.coupon_code_id,
    guestId: data.guest_id,
    discountAmount: Number(data.discount_amount),
    discountType: data.discount_type,
    discountValueUsed: Number(data.discount_value_used),
  };
}

export async function setInvoiceDiscount(
  invoiceId: string,
  params: {
    discountId: string;
    couponCodeId?: string;
    guestId?: string;
    discountAmount: number;
    discountType: DiscountType;
    discountValueUsed: number;
    incrementUsage?: boolean;
  }
): Promise<void> {
  if (!supabase) throw new Error("Database not configured");
  const existing = await getInvoiceDiscount(invoiceId);
  await supabase.from("invoice_discounts").delete().eq("invoice_id", invoiceId);
  if (params.discountAmount <= 0) return;
  await supabase.from("invoice_discounts").insert({
    invoice_id: invoiceId,
    discount_id: params.discountId,
    coupon_code_id: params.couponCodeId || null,
    guest_id: params.guestId || null,
    discount_amount: params.discountAmount,
    discount_type: params.discountType,
    discount_value_used: params.discountValueUsed,
  });
  if (params.incrementUsage && (!existing || existing.discountId !== params.discountId))
    await incrementDiscountUsage(params.discountId);
}
