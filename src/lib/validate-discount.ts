"use server";

import { supabase } from "./supabase";
import { Discount } from "@/types/discount";
import { todaySL } from "./date-sl";
import { getDiscountById } from "./discounts";
import { findCouponByCode } from "./coupon-codes";

export interface ValidateDiscountInput {
  discountId: string;
  couponCode?: string;
  subtotal: number;
  currency: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomTypes: string[];
  rateTypeIds: string[];
  guestId?: string;
  bookingId?: string;
  invoiceId?: string;
}

export interface ValidateDiscountResult {
  valid: boolean;
  discount?: Discount;
  discountAmount: number;
  discountValue: number;
  discountType: "percentage" | "fixed";
  error?: string;
}

function isDateInRange(date: string, from: string, until: string): boolean {
  return date >= from && date <= until;
}

function isDateBlackedOut(date: string, blackoutDates: string[]): boolean {
  return blackoutDates.includes(date);
}

export async function validateDiscount(input: ValidateDiscountInput): Promise<ValidateDiscountResult> {
  const today = todaySL();

  let discount: Discount | undefined;
  if (input.couponCode) {
    const coupon = await findCouponByCode(input.couponCode);
    if (!coupon) return { valid: false, discountAmount: 0, discountValue: 0, discountType: "percentage", error: "Invalid coupon code" };
    if (coupon.discountId !== input.discountId)
      return { valid: false, discountAmount: 0, discountValue: 0, discountType: "percentage", error: "Coupon does not match discount" };
    discount = coupon.discount;
  } else {
    discount = await getDiscountById(input.discountId);
  }

  if (!discount) return { valid: false, discountAmount: 0, discountValue: 0, discountType: "percentage", error: "Discount not found" };
  if (discount.status !== "active") return { valid: false, discountAmount: 0, discountValue: 0, discountType: discount.discountType, error: "Discount is inactive" };
  if (discount.validFrom > today) return { valid: false, discountAmount: 0, discountValue: 0, discountType: discount.discountType, error: "Discount not yet valid" };
  if (discount.validUntil < today) return { valid: false, discountAmount: 0, discountValue: 0, discountType: discount.discountType, error: "Discount has expired" };

  if (input.nights < discount.minStayNights)
    return { valid: false, discountAmount: 0, discountValue: 0, discountType: discount.discountType, error: `Minimum stay of ${discount.minStayNights} nights required` };

  if (discount.applicableRoomTypes.length > 0) {
    const roomMatch = input.roomTypes.some((rt) => discount!.applicableRoomTypes.includes(rt));
    if (!roomMatch) return { valid: false, discountAmount: 0, discountValue: 0, discountType: discount.discountType, error: "Discount does not apply to selected room types" };
  }

  if (discount.applicableRateTypeIds.length > 0) {
    const rateMatch = input.rateTypeIds.some((rid) => discount!.applicableRateTypeIds.includes(rid));
    if (!rateMatch) return { valid: false, discountAmount: 0, discountValue: 0, discountType: discount.discountType, error: "Discount does not apply to selected rate types" };
  }

  for (let d = input.checkIn; d < input.checkOut; ) {
    if (isDateBlackedOut(d, discount.blackoutDates))
      return { valid: false, discountAmount: 0, discountValue: 0, discountType: discount.discountType, error: `Blackout date: ${d}` };
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    d = next.toISOString().slice(0, 10);
  }

  if (discount.maxTotalUsage != null && discount.usageCount >= discount.maxTotalUsage)
    return { valid: false, discountAmount: 0, discountValue: 0, discountType: discount.discountType, error: "Discount usage limit reached" };

  if (discount.oneTimePerGuest && input.guestId && supabase) {
    const { count } = await supabase
      .from("invoice_discounts")
      .select("id", { count: "exact", head: true })
      .eq("discount_id", discount.id)
      .eq("guest_id", input.guestId);
    if (count && count > 0) return { valid: false, discountAmount: 0, discountValue: 0, discountType: discount.discountType, error: "Guest has already used this discount" };
  }

  if (discount.oneTimePerBooking && input.bookingId && supabase) {
    const { count } = await supabase
      .from("booking_discounts")
      .select("id", { count: "exact", head: true })
      .eq("booking_id", input.bookingId);
    if (count && count > 0) return { valid: false, discountAmount: 0, discountValue: 0, discountType: discount.discountType, error: "Booking already has a discount" };
  }

  const discountValue = discount.discountType === "percentage" ? discount.amount : discount.amount;
  const discountAmount =
    discount.discountType === "percentage"
      ? (input.subtotal * discountValue) / 100
      : Math.min(discountValue, input.subtotal);

  return {
    valid: true,
    discount,
    discountAmount,
    discountValue,
    discountType: discount.discountType,
  };
}
