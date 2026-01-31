"use server";

import { supabase } from "./supabase";

export interface DiscountUsageRow {
  discountId: string;
  discountName: string;
  couponCode?: string;
  usageCount: number;
  totalDiscountAmount: number;
  currency: string;
}

export interface InvoiceDiscountRecordDb {
  id: string;
  invoice_id: string;
  discount_id: string;
  coupon_code_id: string | null;
  discount_amount: number;
  discount_type: string;
}

/** Get discount usage aggregated by discount (from invoice_discounts + invoices for date filter) */
export async function getDiscountUsageReport(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<DiscountUsageRow[]> {
  if (!supabase) return [];

  try {
    let invoiceIds: string[] | null = null;
    if (params?.startDate || params?.endDate) {
      let q = supabase.from("invoices").select("id");
      if (params.startDate) q = q.gte("check_out", params.startDate);
      if (params.endDate) q = q.lte("check_in", params.endDate);
      const { data } = await q;
      invoiceIds = (data || []).map((r) => r.id).filter(Boolean);
      if (invoiceIds.length === 0) return [];
    }

    const { data: idData, error: idError } = await supabase
      .from("invoice_discounts")
      .select("id, invoice_id, discount_id, coupon_code_id, discount_amount, discount_type");

    if (idError || !idData) return [];

    let rows = idData as InvoiceDiscountRecordDb[];
    if (invoiceIds) {
      const set = new Set(invoiceIds);
      rows = rows.filter((r) => set.has(r.invoice_id));
    }

    const discountIds = [...new Set(rows.map((r) => r.discount_id))];
    const couponIds = [...new Set(rows.map((r) => r.coupon_code_id).filter(Boolean))] as string[];

    const [discountRes, couponRes, invoiceRes] = await Promise.all([
      discountIds.length
        ? supabase.from("discounts").select("id, name, currency").in("id", discountIds)
        : Promise.resolve({ data: [] }),
      couponIds.length
        ? supabase.from("coupon_codes").select("id, code").in("id", couponIds)
        : Promise.resolve({ data: [] }),
      supabase.from("invoices").select("id, currency").in("id", rows.map((r) => r.invoice_id)),
    ]);

    const discountMap = new Map((discountRes.data || []).map((d: { id: string; name: string; currency?: string }) => [d.id, d]));
    const couponMap = new Map((couponRes.data || []).map((c: { id: string; code: string }) => [c.id, c]));
    const invoiceCurrencyMap = new Map((invoiceRes.data || []).map((i: { id: string; currency: string }) => [i.id, i.currency]));

    const agg = new Map<
      string,
      { discountId: string; discountName: string; couponCode?: string; count: number; total: number; currency: string }
    >();

    for (const r of rows) {
      const disc = discountMap.get(r.discount_id);
      const coupon = r.coupon_code_id ? couponMap.get(r.coupon_code_id) : undefined;
      const currency = invoiceCurrencyMap.get(r.invoice_id) || disc?.currency || "USD";
      const key = `${r.discount_id}:${r.coupon_code_id || "none"}`;
      const cur = agg.get(key);
      const amount = Number(r.discount_amount) || 0;
      if (cur) {
        cur.count += 1;
        cur.total += amount;
      } else {
        agg.set(key, {
          discountId: r.discount_id,
          discountName: disc?.name || "Unknown",
          couponCode: coupon?.code,
          count: 1,
          total: amount,
          currency,
        });
      }
    }

    return Array.from(agg.values());
  } catch (e) {
    console.error("getDiscountUsageReport error:", e);
    return [];
  }
}
