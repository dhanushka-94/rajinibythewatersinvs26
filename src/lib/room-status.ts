"use server";

import { supabase } from "./supabase";
import { getRooms } from "./rooms";
import { Room } from "@/types/room";
import { todaySL } from "./date-sl";

/** Operational status derived from room + active bookings */
export type RoomOperationalStatus =
  | "available"
  | "booked"
  | "checked_in"
  | "checked_out"
  | "maintenance"
  | "disabled";

export interface RoomWithStatus extends Room {
  operationalStatus: RoomOperationalStatus;
  /** Current guest name if occupied */
  guestName?: string;
  /** Booking ID for linking */
  bookingId?: string;
  /** Check-in date for current stay */
  checkIn?: string;
  /** Check-out date for current stay */
  checkOut?: string;
}

/** Get all rooms with their current operational status (Sri Lankan today). */
export async function getRoomsWithStatus(): Promise<RoomWithStatus[]> {
  const rooms = await getRooms();
  if (rooms.length === 0) return [];

  const today = todaySL();

  if (!supabase) {
    return rooms.map((r) => ({
      ...r,
      operationalStatus: (r.status === "maintenance"
        ? "maintenance"
        : r.status === "disabled"
          ? "disabled"
          : "available") as RoomOperationalStatus,
    }));
  }

  // Fetch active bookings for today: room in booking_rooms, check_in <= today <= check_out, not cancelled
  const { data: brData, error: brError } = await supabase
    .from("booking_rooms")
    .select("room_id, booking_id");

  if (brError) {
    console.error("Error fetching booking_rooms:", brError);
    return rooms.map((r) => mapToRoomWithStatus(r, today, null));
  }

  const roomToBookingIds = new Map<string, string[]>();
  for (const row of brData || []) {
    const list = roomToBookingIds.get(row.room_id) || [];
    list.push(row.booking_id);
    roomToBookingIds.set(row.room_id, list);
  }

  const allBookingIds = [...new Set((brData || []).map((r) => r.booking_id))];
  if (allBookingIds.length === 0) {
    return rooms.map((r) => mapToRoomWithStatus(r, today, null));
  }

  // Fetch bookings that span today and are not cancelled
  const { data: bookings, error: bError } = await supabase
    .from("bookings")
    .select("id, check_in, check_out, status, guest")
    .in("id", allBookingIds)
    .lte("check_in", today)
    .gte("check_out", today)
    .neq("status", "cancelled");

  if (bError) {
    console.error("Error fetching bookings:", bError);
    return rooms.map((r) => mapToRoomWithStatus(r, today, null));
  }

  const bookingMap = new Map(
    (bookings || []).map((b) => [b.id, b])
  );

  // Build room_id -> best booking (checked_in > booked/confirmed > checked_out today)
  const roomToBestBooking = new Map<string, { booking: (typeof bookings)[0]; status: RoomOperationalStatus }>();
  for (const room of rooms) {
    const bidList = roomToBookingIds.get(room.id) || [];
    let best: (typeof bookings)[0] | null = null;
    let bestStatus: RoomOperationalStatus | null = null;
    for (const bid of bidList) {
      const b = bookingMap.get(bid);
      if (!b) continue;
      const bStatus = b.status as string;
      if (bStatus === "checked_in") {
        best = b;
        bestStatus = "checked_in";
        break;
      }
      if ((bStatus === "booked" || bStatus === "confirmed") && !best) {
        best = b;
        bestStatus = "booked";
      }
      if (bStatus === "checked_out" && b.check_out === today && !best) {
        best = b;
        bestStatus = "checked_out";
      }
    }
    if (best && bestStatus) {
      roomToBestBooking.set(room.id, { booking: best, status: bestStatus });
    }
  }

  return rooms.map((r) => {
    const info = roomToBestBooking.get(r.id);
    return mapToRoomWithStatus(r, today, info);
  });
}

function mapToRoomWithStatus(
  room: Room,
  today: string,
  info: { booking: { id: string; check_in: string; check_out: string; status: string; guest: unknown }; status: RoomOperationalStatus } | null
): RoomWithStatus {
  // Room-level status overrides booking
  if (room.status === "maintenance") {
    return { ...room, operationalStatus: "maintenance" };
  }
  if (room.status === "disabled") {
    return { ...room, operationalStatus: "disabled" };
  }

  if (info) {
    const guest = info.booking.guest as { name?: string; title?: string } | undefined;
    const guestName = guest
      ? [guest.title ? `${guest.title} ` : "", guest.name || ""].join("").trim() || undefined
      : undefined;
    return {
      ...room,
      operationalStatus: info.status,
      guestName,
      bookingId: info.booking.id,
      checkIn: info.booking.check_in,
      checkOut: info.booking.check_out,
    };
  }

  return { ...room, operationalStatus: "available" };
}
