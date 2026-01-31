"use server";

import { supabase } from "./supabase";
import { Discount, DiscountCreate, DiscountUpdate, DiscountType } from "@/types/discount";
import { createActivityLog } from "./activity-logs";
import { todaySL } from "./date-sl";

function mapDbToDiscount(data: Record<string, unknown>): Discount {
  return {
    id: data.id as string,
    offerId: data.offer_id as string | undefined,
    name: data.name as string,
    description: data.description as string | undefined,
    discountType: (data.discount_type as DiscountType) || "percentage",
    amount: Number(data.amount) || 0,
    currency: (data.currency as string) || "USD",
    minStayNights: Number(data.min_stay_nights) || 0,
    validFrom: (data.valid_from as string) || "",
    validUntil: (data.valid_until as string) || "",
    blackoutDates: Array.isArray(data.blackout_dates) ? (data.blackout_dates as string[]) : (data.blackout_dates ? JSON.parse(String(data.blackout_dates)) : []),
    maxTotalUsage: data.max_total_usage != null ? Number(data.max_total_usage) : undefined,
    maxUsagePerGuest: data.max_usage_per_guest != null ? Number(data.max_usage_per_guest) : undefined,
    oneTimePerBooking: Boolean(data.one_time_per_booking),
    oneTimePerGuest: Boolean(data.one_time_per_guest),
    applicableRoomTypes: Array.isArray(data.applicable_room_types) ? (data.applicable_room_types as string[]) : (data.applicable_room_types ? JSON.parse(String(data.applicable_room_types)) : []),
    applicableRateTypeIds: Array.isArray(data.applicable_rate_type_ids) ? (data.applicable_rate_type_ids as string[]) : (data.applicable_rate_type_ids ? JSON.parse(String(data.applicable_rate_type_ids)) : []),
    status: (data.status as Discount["status"]) || "active",
    usageCount: Number(data.usage_count) || 0,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    deletedAt: data.deleted_at as string | undefined,
  };
}

function mapDiscountToDb(d: DiscountCreate | DiscountUpdate): Record<string, unknown> {
  const db: Record<string, unknown> = {};
  if ("offerId" in d && d.offerId !== undefined) db.offer_id = d.offerId || null;
  if ("name" in d && d.name !== undefined) db.name = d.name;
  if ("description" in d) db.description = d.description || null;
  if ("discountType" in d && d.discountType !== undefined) db.discount_type = d.discountType;
  if ("amount" in d && d.amount !== undefined) db.amount = d.amount;
  if ("currency" in d) db.currency = d.currency || "USD";
  if ("minStayNights" in d) db.min_stay_nights = d.minStayNights ?? 0;
  if ("validFrom" in d && d.validFrom !== undefined) db.valid_from = d.validFrom;
  if ("validUntil" in d && d.validUntil !== undefined) db.valid_until = d.validUntil;
  if ("blackoutDates" in d) db.blackout_dates = d.blackoutDates ? JSON.stringify(d.blackoutDates) : "[]";
  if ("maxTotalUsage" in d) db.max_total_usage = d.maxTotalUsage ?? null;
  if ("maxUsagePerGuest" in d) db.max_usage_per_guest = d.maxUsagePerGuest ?? null;
  if ("oneTimePerBooking" in d) db.one_time_per_booking = d.oneTimePerBooking ?? false;
  if ("oneTimePerGuest" in d) db.one_time_per_guest = d.oneTimePerGuest ?? false;
  if ("applicableRoomTypes" in d) db.applicable_room_types = d.applicableRoomTypes ? JSON.stringify(d.applicableRoomTypes) : "[]";
  if ("applicableRateTypeIds" in d) db.applicable_rate_type_ids = d.applicableRateTypeIds ? JSON.stringify(d.applicableRateTypeIds) : "[]";
  if ("status" in d && d.status !== undefined) db.status = d.status;
  return db;
}

export async function getDiscounts(options?: { includeInactive?: boolean; offerId?: string }): Promise<Discount[]> {
  if (!supabase) return [];
  try {
    let q = supabase.from("discounts").select("*").is("deleted_at", null);
    if (options && !options.includeInactive) q = q.eq("status", "active");
    if (options?.offerId) q = q.eq("offer_id", options.offerId);
    const { data, error } = await q.order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching discounts:", error);
      return [];
    }
    return (data || []).map((r) => mapDbToDiscount(r));
  } catch (e) {
    console.error("Error fetching discounts:", e);
    return [];
  }
}

export async function getDiscountById(id: string): Promise<Discount | undefined> {
  if (!supabase || !id) return undefined;
  try {
    const { data, error } = await supabase
      .from("discounts")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    return mapDbToDiscount(data);
  } catch (e) {
    return undefined;
  }
}

export async function createDiscount(input: DiscountCreate): Promise<Discount> {
  if (!supabase) throw new Error("Database not configured");
  const db = {
    ...mapDiscountToDb(input),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from("discounts").insert([db]).select().single();
  if (error) throw new Error("Failed to create discount");
  const created = mapDbToDiscount(data);
  await createActivityLog("discount_created", "discount", `Created discount: ${created.name}`, { entityId: created.id, entityName: created.name });
  return created;
}

export async function updateDiscount(id: string, input: DiscountUpdate): Promise<void> {
  if (!supabase) throw new Error("Database not configured");
  const db = { ...mapDiscountToDb(input), updated_at: new Date().toISOString() };
  const { error } = await supabase.from("discounts").update(db).eq("id", id);
  if (error) throw new Error("Failed to update discount");
  const updated = await getDiscountById(id);
  if (updated) {
    const desc = input.status !== undefined ? `Status: ${input.status}` : `Updated discount: ${updated.name}`;
    await createActivityLog(
      input.status !== undefined ? "discount_status_changed" : "discount_updated",
      "discount",
      desc,
      { entityId: id, entityName: updated.name }
    );
  }
}

/** Soft delete - set deleted_at for historical reports */
export async function deleteDiscount(id: string): Promise<void> {
  if (!supabase) throw new Error("Database not configured");
  const discount = await getDiscountById(id);
  if (!discount) throw new Error("Discount not found");
  const { error } = await supabase
    .from("discounts")
    .update({ deleted_at: new Date().toISOString(), status: "inactive", updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error("Failed to delete discount");
  await createActivityLog("discount_deleted", "discount", `Deleted discount: ${discount.name}`, { entityId: id, entityName: discount.name });
}

/** Increment usage count (call when discount applied to invoice) */
export async function incrementDiscountUsage(id: string): Promise<void> {
  if (!supabase) return;
  const d = await getDiscountById(id);
  if (!d) return;
  await supabase.from("discounts").update({ usage_count: d.usageCount + 1, updated_at: new Date().toISOString() }).eq("id", id);
}
