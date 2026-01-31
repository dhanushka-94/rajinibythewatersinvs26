"use server";

import { supabase } from "./supabase";
import { Room, RoomCreate, RoomUpdate } from "@/types/room";
import { createActivityLog } from "./activity-logs";
import { nowISOStringSL } from "./date-sl";

function mapDbToRoom(data: Record<string, unknown>): Room {
  return {
    id: data.id as string,
    roomNumber: data.room_number as string,
    roomType: data.room_type as string,
    ratePerNight: Number(data.rate_per_night) || 0,
    currency: (data.currency as string) || "USD",
    capacity: Number(data.capacity) || 2,
    status: (data.status as Room["status"]) || "available",
    floor: data.floor as string | undefined,
    notes: data.notes as string | undefined,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

function mapRoomToDb(room: RoomCreate | RoomUpdate): Record<string, unknown> {
  const dbData: Record<string, unknown> = {};
  if ("roomNumber" in room && room.roomNumber !== undefined) dbData.room_number = room.roomNumber;
  if ("roomType" in room && room.roomType !== undefined) dbData.room_type = room.roomType;
  if ("ratePerNight" in room && room.ratePerNight !== undefined) dbData.rate_per_night = room.ratePerNight;
  if ("currency" in room && room.currency !== undefined) dbData.currency = room.currency || "USD";
  if ("capacity" in room && room.capacity !== undefined) dbData.capacity = room.capacity ?? 2;
  if ("status" in room && room.status !== undefined) dbData.status = room.status || "available";
  if ("floor" in room) dbData.floor = room.floor || null;
  if ("notes" in room) dbData.notes = room.notes || null;
  return dbData;
}

export async function getRooms(): Promise<Room[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("hotel_rooms")
      .select("*")
      .order("room_number", { ascending: true });

    if (error) {
      console.error("Error fetching rooms:", error);
      return [];
    }
    return (data || []).map((r) => mapDbToRoom(r));
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return [];
  }
}

export async function getRoomById(id: string): Promise<Room | undefined> {
  if (!supabase || !id) return undefined;

  try {
    const { data, error } = await supabase
      .from("hotel_rooms")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return undefined;
      console.error("Error fetching room:", error);
      return undefined;
    }
    return data ? mapDbToRoom(data) : undefined;
  } catch (error) {
    console.error("Error fetching room:", error);
    return undefined;
  }
}

export async function createRoom(roomData: RoomCreate): Promise<Room> {
  if (!supabase) throw new Error("Database not configured");

  const dbData = mapRoomToDb(roomData) as Record<string, unknown>;
  dbData.created_at = nowISOStringSL();
  dbData.updated_at = nowISOStringSL();

  const { data, error } = await supabase
    .from("hotel_rooms")
    .insert([dbData])
    .select()
    .single();

  if (error) {
    console.error("Error creating room:", error);
    throw new Error("Failed to create room");
  }

  const created = mapDbToRoom(data);
  await createActivityLog(
    "room_created",
    "hotel_room",
    `Created room: ${created.roomNumber} (${created.roomType})`,
    { entityId: created.id, entityName: created.roomNumber }
  );
  return created;
}

export async function updateRoom(id: string, roomData: RoomUpdate): Promise<void> {
  if (!supabase) throw new Error("Database not configured");

  const dbData = mapRoomToDb(roomData) as Record<string, unknown>;
  dbData.updated_at = nowISOStringSL();

  const { error } = await supabase.from("hotel_rooms").update(dbData).eq("id", id);

  if (error) {
    console.error("Error updating room:", error);
    throw new Error("Failed to update room");
  }

  const updated = await getRoomById(id);
  if (updated) {
    await createActivityLog(
      "room_updated",
      "hotel_room",
      `Updated room: ${updated.roomNumber}`,
      { entityId: id, entityName: updated.roomNumber }
    );
  }
}

export async function deleteRoom(id: string): Promise<void> {
  if (!supabase) throw new Error("Database not configured");

  const room = await getRoomById(id);
  if (!room) throw new Error("Room not found");

  const { error } = await supabase.from("hotel_rooms").delete().eq("id", id);

  if (error) {
    console.error("Error deleting room:", error);
    throw new Error("Failed to delete room");
  }

  await createActivityLog(
    "room_deleted",
    "hotel_room",
    `Deleted room: ${room.roomNumber}`,
    { entityId: id, entityName: room.roomNumber }
  );
}
