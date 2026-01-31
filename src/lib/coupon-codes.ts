"use server";

import { supabase } from "./supabase";
import { CouponCode, CouponCodeCreate } from "@/types/coupon-code";
import { getDiscountById } from "./discounts";
import { createActivityLog } from "./activity-logs";

function mapDbToCouponCode(data: Record<string, unknown>): CouponCode {
  return {
    id: data.id as string,
    discountId: data.discount_id as string,
    code: data.code as string,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

export async function getCouponCodes(discountId?: string): Promise<CouponCode[]> {
  if (!supabase) return [];
  try {
    let q = supabase.from("coupon_codes").select("*");
    if (discountId) q = q.eq("discount_id", discountId);
    const { data, error } = await q.order("code", { ascending: true });
    if (error) {
      console.error("Error fetching coupon codes:", error);
      return [];
    }
    const list = (data || []).map((r) => mapDbToCouponCode(r));
    for (const c of list) {
      c.discount = await getDiscountById(c.discountId);
    }
    return list;
  } catch (e) {
    console.error("Error fetching coupon codes:", e);
    return [];
  }
}

export async function getCouponCodeById(id: string): Promise<CouponCode | undefined> {
  if (!supabase || !id) return undefined;
  try {
    const { data, error } = await supabase
      .from("coupon_codes")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    const c = mapDbToCouponCode(data);
    c.discount = await getDiscountById(c.discountId);
    return c;
  } catch (e) {
    return undefined;
  }
}

/** Find coupon code by code string (case-insensitive) */
export async function findCouponByCode(code: string): Promise<CouponCode | undefined> {
  if (!supabase || !code?.trim()) return undefined;
  try {
    const { data, error } = await supabase
      .from("coupon_codes")
      .select("*")
      .ilike("code", code.trim())
      .limit(1)
      .maybeSingle();
    if (error || !data) return undefined;
    const c = mapDbToCouponCode(data);
    c.discount = await getDiscountById(c.discountId);
    return c;
  } catch (e) {
    return undefined;
  }
}

export async function createCouponCode(input: CouponCodeCreate): Promise<CouponCode> {
  if (!supabase) throw new Error("Database not configured");
  const code = input.code.trim();
  if (!code) throw new Error("Coupon code is required");
  const db = {
    discount_id: input.discountId,
    code,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from("coupon_codes").insert([db]).select().single();
  if (error) {
    if (error.code === "23505") throw new Error("Coupon code already exists");
    throw new Error("Failed to create coupon code");
  }
  const created = mapDbToCouponCode(data);
  await createActivityLog("coupon_code_created", "coupon_code", `Created coupon code: ${created.code}`, { entityId: created.id, entityName: created.code });
  return created;
}

export async function deleteCouponCode(id: string): Promise<void> {
  if (!supabase) throw new Error("Database not configured");
  const coupon = await getCouponCodeById(id);
  if (!coupon) throw new Error("Coupon code not found");
  const { error } = await supabase.from("coupon_codes").delete().eq("id", id);
  if (error) throw new Error("Failed to delete coupon code");
  await createActivityLog("coupon_code_deleted", "coupon_code", `Deleted coupon code: ${coupon.code}`, { entityId: id, entityName: coupon.code });
}
