import { supabase } from './supabase';
import { Guest } from '@/types/invoice';

// Re-export Guest type for convenience
export type { Guest };

// Mock guest data - In production, this would come from an API/database
const defaultGuests: Guest[] = [
  {
    id: "g1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    address: "123 Main St",
    city: "New York",
    country: "USA",
    idNumber: "ID123456",
  },
  {
    id: "g2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+1987654321",
    address: "456 Oak Ave",
    city: "Los Angeles",
    country: "USA",
    idNumber: "ID789012",
  },
  {
    id: "g3",
    name: "David Johnson",
    email: "david.j@example.com",
    phone: "+94771234567",
    address: "789 Beach Road",
    city: "Colombo",
    country: "Sri Lanka",
    idNumber: "NIC987654",
  },
  {
    id: "g4",
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    phone: "+94772345678",
    address: "321 Hill Street",
    city: "Kandy",
    country: "Sri Lanka",
    idNumber: "NIC123456",
  },
];

// In-memory fallback if Supabase is not configured
let fallbackGuests: Guest[] = [...defaultGuests];

const isSupabaseConfigured = () => {
  return supabase !== null;
};

// Map database row to Guest interface
const mapDbToGuest = (data: any): Guest => {
  return {
    id: data.id,
    title: data.title || undefined,
    name: data.name || undefined,
    email: data.email || undefined,
    phone: data.phone || undefined,
    phone2: data.phone2 || undefined,
    phone3: data.phone3 || undefined,
    address: data.address || undefined,
    city: data.city || undefined,
    country: data.country || undefined,
    idNumber: data.id_number || undefined,
    birthday: data.birthday || undefined,
  };
};

// Map Guest interface to database row
const mapGuestToDb = (guest: Guest): any => {
  return {
    title: guest.title || null,
    name: guest.name || null,
    email: guest.email || null,
    phone: guest.phone || null,
    phone2: guest.phone2 || null,
    phone3: guest.phone3 || null,
    address: guest.address || null,
    city: guest.city || null,
    country: guest.country || null,
    id_number: guest.idNumber || null,
    birthday: guest.birthday || null,
  };
};

export async function getGuests(): Promise<Guest[]> {
  if (!isSupabaseConfigured()) {
    return fallbackGuests;
  }

  try {
    if (!supabase) {
      return fallbackGuests;
    }
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching guests:', error);
      return fallbackGuests;
    }

    return (data || []).map(mapDbToGuest);
  } catch (error) {
    console.error('Error fetching guests:', error);
    return fallbackGuests;
  }
}

export async function getGuestById(id: string): Promise<Guest | undefined> {
  if (!isSupabaseConfigured()) {
    return fallbackGuests.find((guest) => guest.id === id);
  }

  try {
    if (!supabase) {
      return fallbackGuests.find((guest) => guest.id === id);
    }
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching guest:', error);
      return fallbackGuests.find((guest) => guest.id === id);
    }

    if (!data) return undefined;
    return mapDbToGuest(data);
  } catch (error) {
    console.error('Error fetching guest:', error);
    return fallbackGuests.find((guest) => guest.id === id);
  }
}

export async function addGuest(guest: Omit<Guest, "id">): Promise<Guest> {
  if (!isSupabaseConfigured()) {
    const newGuest: Guest = {
      ...guest,
      id: `g${Date.now()}`,
    };
    fallbackGuests.push(newGuest);
    return newGuest;
  }

  try {
    if (!supabase) {
      const newGuest: Guest = {
        ...guest,
        id: `g${Date.now()}`,
      };
      fallbackGuests.push(newGuest);
      return newGuest;
    }

    const dbData = mapGuestToDb(guest);
    const { data, error } = await supabase
      .from('guests')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('Error adding guest:', error);
      const newGuest: Guest = {
        ...guest,
        id: `g${Date.now()}`,
      };
      fallbackGuests.push(newGuest);
      return newGuest;
    }

    return mapDbToGuest(data);
  } catch (error) {
    console.error('Error adding guest:', error);
    const newGuest: Guest = {
      ...guest,
      id: `g${Date.now()}`,
    };
    fallbackGuests.push(newGuest);
    return newGuest;
  }
}

export async function updateGuest(id: string, guest: Partial<Guest>): Promise<void> {
  if (!isSupabaseConfigured()) {
    const index = fallbackGuests.findIndex((g) => g.id === id);
    if (index !== -1) {
      fallbackGuests[index] = { ...fallbackGuests[index], ...guest };
    }
    return;
  }

  try {
    if (!supabase) {
      const index = fallbackGuests.findIndex((g) => g.id === id);
      if (index !== -1) {
        fallbackGuests[index] = { ...fallbackGuests[index], ...guest };
      }
      return;
    }

    const dbData: any = {};
    if (guest.name !== undefined) dbData.name = guest.name;
    if (guest.email !== undefined) dbData.email = guest.email;
    if (guest.phone !== undefined) dbData.phone = guest.phone;
    if (guest.address !== undefined) dbData.address = guest.address;
    if (guest.city !== undefined) dbData.city = guest.city;
    if (guest.country !== undefined) dbData.country = guest.country;
    if (guest.idNumber !== undefined) dbData.id_number = guest.idNumber;
    dbData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('guests')
      .update(dbData)
      .eq('id', id);

    if (error) {
      console.error('Error updating guest:', error);
    }
  } catch (error) {
    console.error('Error updating guest:', error);
  }
}

export async function deleteGuest(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const index = fallbackGuests.findIndex((g) => g.id === id);
    if (index !== -1) {
      fallbackGuests.splice(index, 1);
    }
    return;
  }

  try {
    if (!supabase) {
      const index = fallbackGuests.findIndex((g) => g.id === id);
      if (index !== -1) {
        fallbackGuests.splice(index, 1);
      }
      return;
    }

    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting guest:', error);
    }
  } catch (error) {
    console.error('Error deleting guest:', error);
  }
}

// Export for backward compatibility
export const mockGuests = defaultGuests;
