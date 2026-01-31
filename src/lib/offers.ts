"use server";

import { supabase } from "./supabase";
import { Offer, OfferCreate, OfferUpdate } from "@/types/offer";
import { createActivityLog } from "./activity-logs";

function mapDbToOffer(data: Record<string, unknown>): Offer {
  return {
    id: data.id as string,
    name: data.name as string,
    description: data.description as string | undefined,
    displayOrder: Number(data.display_order) || 0,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}

function mapOfferToDb(offer: OfferCreate | OfferUpdate): Record<string, unknown> {
  const db: Record<string, unknown> = {};
  if ("name" in offer && offer.name !== undefined) db.name = offer.name;
  if ("description" in offer) db.description = offer.description || null;
  if ("displayOrder" in offer) db.display_order = offer.displayOrder ?? 0;
  return db;
}

export async function getOffers(): Promise<Offer[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("offers")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching offers:", error);
      return [];
    }
    return (data || []).map((r) => mapDbToOffer(r));
  } catch (e) {
    console.error("Error fetching offers:", e);
    return [];
  }
}

export async function getOfferById(id: string): Promise<Offer | undefined> {
  if (!supabase || !id) return undefined;
  try {
    const { data, error } = await supabase
      .from("offers")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) return undefined;
    return mapDbToOffer(data);
  } catch (e) {
    return undefined;
  }
}

export async function createOffer(input: OfferCreate): Promise<Offer> {
  if (!supabase) throw new Error("Database not configured");
  const db = { ...mapOfferToDb(input), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  const { data, error } = await supabase.from("offers").insert([db]).select().single();
  if (error) throw new Error("Failed to create offer");
  const created = mapDbToOffer(data);
  await createActivityLog("offer_created", "offer", `Created offer: ${created.name}`, { entityId: created.id, entityName: created.name });
  return created;
}

export async function updateOffer(id: string, input: OfferUpdate): Promise<void> {
  if (!supabase) throw new Error("Database not configured");
  const db = { ...mapOfferToDb(input), updated_at: new Date().toISOString() };
  const { error } = await supabase.from("offers").update(db).eq("id", id);
  if (error) throw new Error("Failed to update offer");
  const updated = await getOfferById(id);
  if (updated) await createActivityLog("offer_updated", "offer", `Updated offer: ${updated.name}`, { entityId: id, entityName: updated.name });
}

export async function deleteOffer(id: string): Promise<void> {
  if (!supabase) throw new Error("Database not configured");
  const offer = await getOfferById(id);
  if (!offer) throw new Error("Offer not found");
  const { error } = await supabase.from("offers").delete().eq("id", id);
  if (error) throw new Error("Failed to delete offer");
  await createActivityLog("offer_deleted", "offer", `Deleted offer: ${offer.name}`, { entityId: id, entityName: offer.name });
}
