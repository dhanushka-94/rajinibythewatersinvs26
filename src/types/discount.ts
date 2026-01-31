import { Currency } from "./invoice";

export type DiscountType = "percentage" | "fixed";
export type DiscountStatus = "active" | "inactive";

export interface Discount {
  id: string;
  offerId?: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  amount: number;
  currency: string;
  minStayNights: number;
  validFrom: string;
  validUntil: string;
  blackoutDates: string[];
  maxTotalUsage?: number;
  maxUsagePerGuest?: number;
  oneTimePerBooking: boolean;
  oneTimePerGuest: boolean;
  applicableRoomTypes: string[];
  applicableRateTypeIds: string[];
  status: DiscountStatus;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface DiscountCreate {
  offerId?: string;
  name: string;
  description?: string;
  discountType: DiscountType;
  amount: number;
  currency?: string;
  minStayNights?: number;
  validFrom: string;
  validUntil: string;
  blackoutDates?: string[];
  maxTotalUsage?: number;
  maxUsagePerGuest?: number;
  oneTimePerBooking?: boolean;
  oneTimePerGuest?: boolean;
  applicableRoomTypes?: string[];
  applicableRateTypeIds?: string[];
  status?: DiscountStatus;
}

export interface DiscountUpdate {
  offerId?: string;
  name?: string;
  description?: string;
  discountType?: DiscountType;
  amount?: number;
  currency?: string;
  minStayNights?: number;
  validFrom?: string;
  validUntil?: string;
  blackoutDates?: string[];
  maxTotalUsage?: number;
  maxUsagePerGuest?: number;
  oneTimePerBooking?: boolean;
  oneTimePerGuest?: boolean;
  applicableRoomTypes?: string[];
  applicableRateTypeIds?: string[];
  status?: DiscountStatus;
}

export interface AppliedDiscount {
  id: string;
  discountId: string;
  couponCodeId?: string;
  discountAmount: number;
  discountType: DiscountType;
  discountValueUsed: number;
}
