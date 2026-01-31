"use server";

import { supabase } from "./supabase";
import { DiscountType } from "@/types/discount";

export interface BookingDiscountRecord {
  id: string;
  bookingId: string;
  discountId: string;
  couponCodeId?: string;
  guestId?: string;
  discountAmount: number;
  discountType: DiscountType;
  discountValueUsed: number;
}

export async function getBookingDiscount(bookingId: string): Promise<BookingDiscountRecord | undefined> {
  if (!supabase) return undefined;
  const { data, error } = await supabase
    .from("booking_discounts")
    .select("*")
    .eq("booking_id", bookingId)
    .maybeSingle();
  if (error || !data) return undefined;
  return {
    id: data.id,
    bookingId: data.booking_id,
    discountId: data.discount_id,
    couponCodeId: data.coupon_code_id,
    guestId: data.guest_id,
    discountAmount: Number(data.discount_amount),
    discountType: data.discount_type,
    discountValueUsed: Number(data.discount_value_used),
  };
}

export async function setBookingDiscount(
  bookingId: string,
  params: {
    discountId: string;
    couponCodeId?: string;
    guestId?: string;
    discountAmount: number;
    discountType: DiscountType;
    discountValueUsed: number;
  }
): Promise<void> {
  if (!supabase) throw new Error("Database not configured");
  await supabase.from("booking_discounts").delete().eq("booking_id", bookingId);
  if (params.discountAmount <= 0) return;
  await supabase.from("booking_discounts").insert({
    booking_id: bookingId,
    discount_id: params.discountId,
    coupon_code_id: params.couponCodeId || null,
    guest_id: params.guestId || null,
    discount_amount: params.discountAmount,
    discount_type: params.discountType,
    discount_value_used: params.discountValueUsed,
  });
}
