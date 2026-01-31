"use server";

import { supabase } from "./supabase";
import { hashPassword } from "./auth";
import bcrypt from "bcryptjs";
import { nowISOStringSL } from "./date-sl";

export interface SecureEditPinWithUser {
  userId: string;
  userName: string;
  userFullName: string;
  createdAt: string;
}

async function verifyPin(plainPin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainPin, hash);
}

/** Get list of all secure edit PINs with user info (admin only) */
export async function getSecureEditPinsWithUsers(): Promise<SecureEditPinWithUser[]> {
  if (!supabase) return [];

  try {
    const { data: pins, error } = await supabase
      .from("secure_edit_pins")
      .select("user_id, created_at")
      .order("created_at", { ascending: false });

    if (error || !pins?.length) {
      if (error) console.error("Error fetching secure edit pins:", error);
      return [];
    }

    const userIds = pins.map((p) => p.user_id);
    const { data: users } = await supabase
      .from("users")
      .select("id, username, full_name")
      .in("id", userIds);

    const userMap = new Map((users || []).map((u: any) => [u.id, u]));
    return pins.map((p) => {
      const u = userMap.get(p.user_id);
      return {
        userId: p.user_id,
        userName: u?.username || "",
        userFullName: u?.full_name || "",
        createdAt: p.created_at,
      };
    });
  } catch (err) {
    console.error("Error fetching secure edit pins:", err);
    return [];
  }
}

/** Check if a user has a secure edit PIN configured */
export async function userHasSecureEditPin(userId: string): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { data, error } = await supabase
      .from("secure_edit_pins")
      .select("id")
      .eq("user_id", userId)
      .single();

    return !error && !!data;
  } catch {
    return false;
  }
}

/** Verify that the given user's PIN matches (owner-only check) */
export async function verifyUserPin(userId: string, plainPin: string): Promise<boolean> {
  if (!supabase || !plainPin?.trim()) return false;

  try {
    const { data, error } = await supabase
      .from("secure_edit_pins")
      .select("pin_hash")
      .eq("user_id", userId)
      .single();

    if (error || !data?.pin_hash) return false;
    return verifyPin(plainPin.trim(), data.pin_hash);
  } catch {
    return false;
  }
}

/** Create or update PIN for a user (admin only). One PIN per user. */
export async function upsertSecureEditPin(userId: string, plainPin: string): Promise<void> {
  if (!supabase) throw new Error("Database not configured");
  const pin = plainPin.trim();
  if (pin.length < 4) throw new Error("PIN must be at least 4 characters");

  const pinHash = await hashPassword(pin);
  const now = nowISOStringSL();

  const { error } = await supabase.from("secure_edit_pins").upsert(
    {
      user_id: userId,
      pin_hash: pinHash,
      updated_at: now,
    },
    {
      onConflict: "user_id",
      ignoreDuplicates: false,
    }
  );

  if (error) {
    console.error("Error upserting secure edit PIN:", error);
    throw new Error(error.message || "Failed to save PIN");
  }
}

/** Delete PIN for a user (admin only) */
export async function deleteSecureEditPin(userId: string): Promise<void> {
  if (!supabase) throw new Error("Database not configured");

  const { error } = await supabase
    .from("secure_edit_pins")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting secure edit PIN:", error);
    throw new Error(error.message || "Failed to delete PIN");
  }
}
