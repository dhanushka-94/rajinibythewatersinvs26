"use server";

import { supabase } from "./supabase";
import { RateType } from "@/types/rate-type";

function mapDbToRateType(data: Record<string, unknown>): RateType {
  return {
    id: data.id as string,
    name: data.name as string,
    displayOrder: Number(data.display_order) || 0,
  };
}

export async function getRateTypes(): Promise<RateType[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("rate_types")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching rate types:", error);
      return [];
    }
    return (data || []).map((r) => mapDbToRateType(r));
  } catch (error) {
    console.error("Error fetching rate types:", error);
    return [];
  }
}
