import { supabase } from './supabase';

export interface HotelInfo {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  telephone?: string;
  hotline?: string;
  usaContact?: string;
  email?: string;
  website?: string;
  logoPath?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Default hotel info fallback
const defaultHotelInfo: HotelInfo = {
  id: "default",
  name: "Rajini by The Waters",
  address: "437, Beralihela, Colony 6",
  city: "Tissamaharama",
  country: "Sri Lanka",
  telephone: "+94 76 374 1945",
  hotline: "+94 76 281 0000",
  usaContact: "+1 818 984 7763",
  website: "www.rajinihotels.com",
  email: "bookings@rajinihotels.com",
  logoPath: "/images/rajini-logo-flat-color.png",
};

// Cache for hotel info
let cachedHotelInfo: HotelInfo | null = null;

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return supabase !== null;
};

// Get hotel info from database
export async function getHotelInfo(): Promise<HotelInfo> {
  if (!isSupabaseConfigured()) {
    return defaultHotelInfo;
  }

  // Return cached value if available
  if (cachedHotelInfo) {
    return cachedHotelInfo;
  }

  try {
    if (!supabase) {
      return defaultHotelInfo;
    }

    const { data, error } = await supabase
      .from('hotel_info')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      // Check if it's a "table doesn't exist" or "no rows" error
      // PGRST116 = no rows returned (expected if table is empty)
      // 42P01 = relation does not exist (table doesn't exist)
      if (error.code === 'PGRST116' || error.code === '42P01') {
        // Table doesn't exist or no rows - return default (expected case)
        return defaultHotelInfo;
      }
      // Log actual errors (unexpected cases)
      console.error('Error fetching hotel info:', error);
      return defaultHotelInfo;
    }

    if (!data) {
      return defaultHotelInfo;
    }

    // Map database fields to our interface
    const hotelInfo: HotelInfo = {
      id: data.id,
      name: data.name,
      address: data.address,
      city: data.city,
      country: data.country,
      telephone: data.telephone || undefined,
      hotline: data.hotline || undefined,
      usaContact: data.usa_contact || undefined,
      email: data.email || undefined,
      website: data.website || undefined,
      logoPath: data.logo_path || undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    // Cache the result
    cachedHotelInfo = hotelInfo;
    return hotelInfo;
  } catch (error) {
    console.error('Error fetching hotel info:', error);
    return defaultHotelInfo;
  }
}

// Update hotel info
export async function updateHotelInfo(info: Partial<Omit<HotelInfo, "id" | "createdAt" | "updatedAt">>): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Cannot update hotel info.');
    return;
  }

  try {
    if (!supabase) {
      console.warn('Supabase not configured. Cannot update hotel info.');
      return;
    }

    // Check if record exists
    const { data: existingData, error: fetchError } = await supabase
      .from('hotel_info')
      .select('id')
      .limit(1)
      .maybeSingle();

    // Check if table exists (fetchError with code 42P01 means table doesn't exist)
    if (fetchError) {
      if (fetchError.code === '42P01' || fetchError.message?.includes('does not exist')) {
        const errorMsg = 'Hotel info table does not exist. Please run the migration SQL first.';
        console.warn(errorMsg);
        throw new Error(errorMsg);
      }
      // Other fetch errors - log but continue (might be permission issue)
      console.warn('Error checking hotel info:', fetchError);
    }

    // Map our interface to database fields
    const dbData: any = {};
    if (info.name !== undefined) dbData.name = info.name;
    if (info.address !== undefined) dbData.address = info.address;
    if (info.city !== undefined) dbData.city = info.city;
    if (info.country !== undefined) dbData.country = info.country;
    if (info.telephone !== undefined) dbData.telephone = info.telephone || null;
    if (info.hotline !== undefined) dbData.hotline = info.hotline || null;
    if (info.usaContact !== undefined) dbData.usa_contact = info.usaContact || null;
    if (info.email !== undefined) dbData.email = info.email || null;
    if (info.website !== undefined) dbData.website = info.website || null;
    if (info.logoPath !== undefined) dbData.logo_path = info.logoPath || null;
    dbData.updated_at = new Date().toISOString();

    let error;
    let operation = '';

    if (existingData && existingData.id) {
      // Update existing record
      operation = 'update';
      const { error: updateError } = await supabase
        .from('hotel_info')
        .update(dbData)
        .eq('id', existingData.id);
      error = updateError;
    } else {
      // Create new record if it doesn't exist
      operation = 'insert';
      // Use default values for required fields if not provided
      if (!dbData.name) dbData.name = defaultHotelInfo.name;
      if (!dbData.address) dbData.address = defaultHotelInfo.address;
      if (!dbData.city) dbData.city = defaultHotelInfo.city;
      if (!dbData.country) dbData.country = defaultHotelInfo.country;
      
      const { error: insertError } = await supabase
        .from('hotel_info')
        .insert([dbData]);
      error = insertError;
    }

    if (error) {
      // Check if it's a "table doesn't exist" error
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        const errorMsg = 'Hotel info table does not exist. Please run the migration SQL first.';
        console.error(errorMsg, { error, operation });
        throw new Error(errorMsg);
      }
      // Check for permission errors
      if (error.code === '42501' || error.message?.includes('permission denied')) {
        const errorMsg = 'You do not have permission to update hotel info. Admin access required.';
        console.error(errorMsg, { error, operation });
        throw new Error(errorMsg);
      }
      // Log detailed error information
      console.error(`Error ${operation}ing hotel info:`, {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        operation,
        dbData
      });
      throw new Error(error.message || `Failed to ${operation} hotel info. Please check your database connection and permissions.`);
    }

    // Clear cache to force refresh on next fetch
    cachedHotelInfo = null;
  } catch (error) {
    console.error('Error updating hotel info:', error);
    throw error;
  }
}

// Export default hotel info for backward compatibility
// This will be used as fallback and will be replaced by database value when available
export const hotelInfo = defaultHotelInfo;
