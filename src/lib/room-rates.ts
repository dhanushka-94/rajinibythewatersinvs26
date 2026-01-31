"use server";

import { supabase } from "./supabase";
import { RoomRate, RoomRateUpsert } from "@/types/rate-type";
import { nowISOStringSL } from "./date-sl";

function mapDbToRoomRate(data: Record<string, unknown>): RoomRate {
  return {
    id: data.id as string,
    roomId: data.room_id as string,
    rateTypeId: data.rate_type_id as string,
    ratePerNight: Number(data.rate_per_night) || 0,
    currency: (data.currency as string) || "USD",
  };
}

export async function getRoomRates(roomId: string): Promise<RoomRate[]> {
  if (!supabase || !roomId) return [];

  try {
    const { data, error } = await supabase
      .from("room_rates")
      .select("*")
      .eq("room_id", roomId);

    if (error) {
      console.error("Error fetching room rates:", error);
      return [];
    }
    return (data || []).map((r) => mapDbToRoomRate(r));
  } catch (error) {
    console.error("Error fetching room rates:", error);
    return [];
  }
}

export async function getRoomRate(
  roomId: string,
  rateTypeId: string
): Promise<RoomRate | undefined> {
  if (!supabase || !roomId || !rateTypeId) return undefined;

  try {
    const { data, error } = await supabase
      .from("room_rates")
      .select("*")
      .eq("room_id", roomId)
      .eq("rate_type_id", rateTypeId)
      .single();

    if (error || !data) return undefined;
    return mapDbToRoomRate(data);
  } catch {
    return undefined;
  }
}

export async function upsertRoomRates(
  roomId: string,
  rates: RoomRateUpsert[]
): Promise<void> {
  if (!supabase) throw new Error("Database not configured");

  for (const r of rates) {
    const row = {
      room_id: roomId,
      rate_type_id: r.rateTypeId,
      rate_per_night: r.ratePerNight,
      currency: r.currency || "USD",
      updated_at: nowISOStringSL(),
    };

    const { error } = await supabase
      .from("room_rates")
      .upsert(row, {
        onConflict: "room_id,rate_type_id",
        ignoreDuplicates: false,
      });

    if (error) {
      console.error("Error upserting room rate:", error);
      throw new Error("Failed to save room rate");
    }
  }

  // Sync hotel_rooms.rate_per_night to min rate for display
  const allRates = await getRoomRates(roomId);
  if (allRates.length > 0) {
    const minRate = Math.min(...allRates.map((x) => x.ratePerNight));
    const currency = allRates[0]?.currency || "USD";
    await supabase
      .from("hotel_rooms")
      .update({ rate_per_night: minRate, currency, updated_at: nowISOStringSL() })
      .eq("id", roomId);
  }
}
