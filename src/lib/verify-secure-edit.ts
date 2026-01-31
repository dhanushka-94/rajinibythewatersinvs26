/**
 * Secure edit PIN verification for paid invoices / checked-out bookings.
 * Uses secure_edit_pins table - one PIN per user, only owner can use.
 */

import { userHasSecureEditPin, verifyUserPin } from "./secure-edit-pins";

/** Check if the given user has a secure edit PIN configured */
export async function isSecureEditConfigured(userId: string): Promise<boolean> {
  return userHasSecureEditPin(userId);
}

/** Verify the given user's PIN (owner-only: caller must pass the session user ID) */
export async function verifySecureEditPin(userId: string, pin: string): Promise<boolean> {
  return verifyUserPin(userId, pin);
}
