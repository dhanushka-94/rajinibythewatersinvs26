"use server";

import { supabase } from "./supabase";
import { getRoomById } from "./rooms";
import { getRoomRate } from "./room-rates";

export interface BookingRoomAssignment {
  roomId: string;
  rateTypeId: string;
  room?: Awaited<ReturnType<typeof getRoomById>>;
  ratePerNight?: number;
  currency?: string;
  rateTypeName?: string;
}

/** Get room assignments for a booking (room_id, rate_type_id) */
export async function getBookingRoomAssignments(
  bookingId: string
): Promise<BookingRoomAssignment[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("booking_rooms")
    .select("room_id, rate_type_id")
    .eq("booking_id", bookingId);

  if (error) {
    console.error("Error fetching booking rooms:", error);
    return [];
  }

  const results: BookingRoomAssignment[] = [];
  for (const row of data || []) {
    const room = await getRoomById(row.room_id);
    if (!room) continue;
    let ratePerNight = room.ratePerNight;
    let currency = room.currency;
    if (row.rate_type_id) {
      const rr = await getRoomRate(row.room_id, row.rate_type_id);
      if (rr) {
        ratePerNight = rr.ratePerNight;
        currency = rr.currency;
      }
    }
    results.push({
      roomId: row.room_id,
      rateTypeId: row.rate_type_id || "",
      room,
      ratePerNight,
      currency,
    });
  }
  return results;
}

/** Get room IDs for a booking (backward compat) */
export async function getBookingRoomIds(bookingId: string): Promise<string[]> {
  const assignments = await getBookingRoomAssignments(bookingId);
  return assignments.map((a) => a.roomId);
}

/** Get room IDs for multiple bookings (returns map of bookingId -> roomIds) */
export async function getBookingRoomIdsMap(
  bookingIds: string[]
): Promise<Record<string, string[]>> {
  if (!supabase || bookingIds.length === 0) return {};

  const { data, error } = await supabase
    .from("booking_rooms")
    .select("booking_id, room_id")
    .in("booking_id", bookingIds);

  if (error) {
    console.error("Error fetching booking rooms:", error);
    return {};
  }

  const map: Record<string, string[]> = {};
  for (const row of data || []) {
    if (!map[row.booking_id]) map[row.booking_id] = [];
    map[row.booking_id].push(row.room_id);
  }
  return map;
}

/** Set rooms for a booking (replaces existing). Assignments include rateTypeId. */
export async function setBookingRooms(
  bookingId: string,
  assignments: Array<{ roomId: string; rateTypeId?: string }>
): Promise<void> {
  if (!supabase) return;

  await supabase.from("booking_rooms").delete().eq("booking_id", bookingId);

  if (assignments.length === 0) return;

  const rows = assignments.map((a) => ({
    booking_id: bookingId,
    room_id: a.roomId,
    rate_type_id: a.rateTypeId || null,
  }));
  const { error } = await supabase.from("booking_rooms").insert(rows);

  if (error) {
    console.error("Error setting booking rooms:", error);
    throw new Error("Failed to set booking rooms");
  }
}

/** Get rooms for a booking (with full room data). Returns assignments with rate info. */
export async function getBookingRooms(bookingId: string) {
  const assignments = await getBookingRoomAssignments(bookingId);
  return assignments.filter((a) => a.room != null).map((a) => ({
    ...a.room!,
    rateTypeId: a.rateTypeId,
    ratePerNight: a.ratePerNight ?? a.room!.ratePerNight,
    currency: a.currency ?? a.room!.currency,
  }));
}
