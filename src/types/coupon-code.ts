import { Discount } from "./discount";

export interface CouponCode {
  id: string;
  discountId: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  discount?: Discount;
}

export interface CouponCodeCreate {
  discountId: string;
  code: string;
}
