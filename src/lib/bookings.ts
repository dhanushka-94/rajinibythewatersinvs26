import { supabase } from './supabase';
import { Booking, BookingStatus } from '@/types/booking';
import { Guest } from '@/types/invoice';
import { createActivityLog } from './activity-logs';

// In-memory fallback if Supabase is not configured
let fallbackBookings: Booking[] = [];

const isSupabaseConfigured = () => {
  return supabase !== null;
};

// Map database row to Booking interface
const mapDbToBooking = (data: any): Booking => {
  return {
    id: data.id,
    bookingNumber: data.booking_number,
    guestId: data.guest_id || undefined,
    guest: data.guest,
    guests: data.guests || undefined,
    checkIn: data.check_in,
    checkOut: data.check_out,
    roomType: data.room_type || undefined,
    adults: data.adults || undefined,
    children: data.children || undefined,
    babies: data.babies || undefined,
    status: data.status || 'booked',
    items: data.items || undefined,
    invoiceId: data.invoice_id || undefined,
    notes: data.notes || undefined,
    // Status change timestamps
    bookedAt: data.booked_at || undefined,
    confirmedAt: data.confirmed_at || undefined,
    checkedInAt: data.checked_in_at || undefined,
    checkedOutAt: data.checked_out_at || undefined,
    cancelledAt: data.cancelled_at || undefined,
    // Early check-in and late checkout
    earlyCheckIn: data.early_check_in || false,
    earlyCheckInTime: data.early_check_in_time || undefined,
    earlyCheckInNotes: data.early_check_in_notes || undefined,
    lateCheckOut: data.late_check_out || false,
    lateCheckOutTime: data.late_check_out_time || undefined,
    lateCheckOutNotes: data.late_check_out_notes || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by || undefined,
    updatedBy: data.updated_by || undefined,
  };
};

// Map Booking interface to database row
const mapBookingToDb = (booking: Booking): any => {
  const dbData: any = {
    booking_number: booking.bookingNumber,
    guest_id: booking.guestId || null,
    guest: booking.guest,
    guests: booking.guests || null,
    check_in: booking.checkIn,
    check_out: booking.checkOut,
    room_type: booking.roomType || null,
    adults: booking.adults || null,
    children: booking.children || null,
    babies: booking.babies || null,
    status: booking.status,
    items: booking.items || null,
    invoice_id: booking.invoiceId || null,
    notes: booking.notes || null,
  };
  
  // Include status timestamps if provided
  if (booking.bookedAt !== undefined) dbData.booked_at = booking.bookedAt || null;
  if (booking.confirmedAt !== undefined) dbData.confirmed_at = booking.confirmedAt || null;
  if (booking.checkedInAt !== undefined) dbData.checked_in_at = booking.checkedInAt || null;
  if (booking.checkedOutAt !== undefined) dbData.checked_out_at = booking.checkedOutAt || null;
  if (booking.cancelledAt !== undefined) dbData.cancelled_at = booking.cancelledAt || null;
  
  // Include early check-in and late checkout if provided
  if (booking.earlyCheckIn !== undefined) dbData.early_check_in = booking.earlyCheckIn;
  if (booking.earlyCheckInTime !== undefined) dbData.early_check_in_time = booking.earlyCheckInTime || null;
  if (booking.earlyCheckInNotes !== undefined) dbData.early_check_in_notes = booking.earlyCheckInNotes || null;
  if (booking.lateCheckOut !== undefined) dbData.late_check_out = booking.lateCheckOut;
  if (booking.lateCheckOutTime !== undefined) dbData.late_check_out_time = booking.lateCheckOutTime || null;
  if (booking.lateCheckOutNotes !== undefined) dbData.late_check_out_notes = booking.lateCheckOutNotes || null;
  
  return dbData;
};

// Generate unique booking number
const generateBookingNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BK-${timestamp}-${random}`;
};

export async function getBookings(): Promise<Booking[]> {
  if (!isSupabaseConfigured()) {
    return fallbackBookings;
  }

  try {
    if (!supabase) {
      return fallbackBookings;
    }
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      return fallbackBookings;
    }

    return (data || []).map(mapDbToBooking);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return fallbackBookings;
  }
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
  if (!isSupabaseConfigured()) {
    return fallbackBookings.find((booking) => booking.id === id);
  }

  try {
    if (!supabase) {
      return fallbackBookings.find((booking) => booking.id === id);
    }
    
    if (!id || id.trim() === '') {
      return undefined;
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // PGRST116 means no rows returned (booking not found) - this is expected
      if (error.code === 'PGRST116') {
        return undefined;
      }
      // Log other errors with more details - handle case where error might be empty or have different structure
      console.error('Error fetching booking from Supabase:', {
        error: error,
        errorString: String(error),
        errorJSON: JSON.stringify(error),
        message: error?.message || 'No message',
        details: error?.details || 'No details',
        hint: error?.hint || 'No hint',
        code: error?.code || 'No code',
        bookingId: id
      });
      // Try fallback
      const fallback = fallbackBookings.find((booking) => booking.id === id);
      if (fallback) {
        return fallback;
      }
      return undefined;
    }

    if (!data) {
      console.warn('No booking found with id:', id);
      return undefined;
    }
    
    return mapDbToBooking(data);
  } catch (error) {
    // Handle unexpected errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Unexpected error fetching booking:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      bookingId: id,
      error: error
    });
    // Try fallback
    const fallback = fallbackBookings.find((booking) => booking.id === id);
    if (fallback) {
      return fallback;
    }
    return undefined;
  }
}

export async function getBookingByNumber(bookingNumber: string): Promise<Booking | undefined> {
  if (!isSupabaseConfigured()) {
    return fallbackBookings.find((booking) => booking.bookingNumber === bookingNumber);
  }

  try {
    if (!supabase) {
      return fallbackBookings.find((booking) => booking.bookingNumber === bookingNumber);
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('booking_number', bookingNumber)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return undefined;
      }
      console.error('Error fetching booking:', error);
      return undefined;
    }

    if (!data) return undefined;
    return mapDbToBooking(data);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return undefined;
  }
}

export async function createBooking(booking: Omit<Booking, "id" | "bookingNumber" | "createdAt" | "updatedAt">): Promise<Booking> {
  if (!isSupabaseConfigured()) {
    const newBooking: Booking = {
      ...booking,
      id: `bk-${Date.now()}`,
      bookingNumber: generateBookingNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    fallbackBookings.push(newBooking);
    return newBooking;
  }

  try {
    if (!supabase) {
      const newBooking: Booking = {
        ...booking,
        id: `bk-${Date.now()}`,
        bookingNumber: generateBookingNumber(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      fallbackBookings.push(newBooking);
      return newBooking;
    }

    const bookingNumber = generateBookingNumber();
    const dbData = mapBookingToDb({
      ...booking,
      bookingNumber,
    } as Booking);
    
    // Set initial status timestamp based on booking status
    const now = new Date().toISOString();
    if (booking.status === 'booked') {
      dbData.booked_at = now;
    } else if (booking.status === 'confirmed') {
      dbData.confirmed_at = now;
    } else if (booking.status === 'checked_in') {
      dbData.checked_in_at = now;
    } else if (booking.status === 'checked_out') {
      dbData.checked_out_at = now;
    } else if (booking.status === 'cancelled') {
      dbData.cancelled_at = now;
    }
    
    // Include early check-in and late checkout fields
    if (booking.earlyCheckIn !== undefined) {
      dbData.early_check_in = booking.earlyCheckIn;
    }
    if (booking.earlyCheckInTime !== undefined) {
      dbData.early_check_in_time = booking.earlyCheckInTime || null;
    }
    if (booking.earlyCheckInNotes !== undefined) {
      dbData.early_check_in_notes = booking.earlyCheckInNotes || null;
    }
    if (booking.lateCheckOut !== undefined) {
      dbData.late_check_out = booking.lateCheckOut;
    }
    if (booking.lateCheckOutTime !== undefined) {
      dbData.late_check_out_time = booking.lateCheckOutTime || null;
    }
    if (booking.lateCheckOutNotes !== undefined) {
      dbData.late_check_out_notes = booking.lateCheckOutNotes || null;
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      const newBooking: Booking = {
        ...booking,
        id: `bk-${Date.now()}`,
        bookingNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      fallbackBookings.push(newBooking);
      return newBooking;
    }

    const createdBooking = mapDbToBooking(data);
    
    // Log activity
    await createActivityLog(
      "booking_created",
      "booking",
      `Created booking ${createdBooking.bookingNumber} for ${booking.guest.name}`,
      {
        entityId: createdBooking.id,
        entityName: createdBooking.bookingNumber,
        metadata: {
          guestName: booking.guest.name,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          status: booking.status,
        },
      }
    );
    
    return createdBooking;
  } catch (error) {
    console.error('Error creating booking:', error);
    const newBooking: Booking = {
      ...booking,
      id: `bk-${Date.now()}`,
      bookingNumber: generateBookingNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    fallbackBookings.push(newBooking);
    return newBooking;
  }
}

export async function updateBooking(id: string, booking: Partial<Booking>): Promise<void> {
  if (!isSupabaseConfigured()) {
    const index = fallbackBookings.findIndex((b) => b.id === id);
    if (index !== -1) {
      fallbackBookings[index] = { ...fallbackBookings[index], ...booking };
    }
    return;
  }

  try {
    if (!supabase) {
      const index = fallbackBookings.findIndex((b) => b.id === id);
      if (index !== -1) {
        fallbackBookings[index] = { ...fallbackBookings[index], ...booking };
      }
      return;
    }

    // Get existing booking to check status changes
    const existingBooking = await getBookingById(id);
    if (!existingBooking) {
      throw new Error("Booking not found");
    }

    const dbData: any = {};
    
    // Helper function to check if a value is valid (not undefined, null, or string "undefined")
    const isValidValue = (value: any): boolean => {
      return value !== undefined && value !== null && value !== 'undefined' && String(value).trim() !== '';
    };
    
    // Helper function to validate UUID
    const isValidUUID = (value: any): boolean => {
      if (!isValidValue(value)) return false;
      // Basic UUID format check (8-4-4-4-12 hex characters)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return typeof value === 'string' && uuidRegex.test(value);
    };
    
    // Only include fields that are explicitly provided and valid
    if (booking.bookingNumber !== undefined && booking.bookingNumber !== null) {
      dbData.booking_number = booking.bookingNumber;
    }
    
    // Only include guestId if it's a valid UUID, otherwise skip it entirely
    if (booking.guestId !== undefined) {
      if (isValidUUID(booking.guestId)) {
        dbData.guest_id = booking.guestId;
      } else if (booking.guestId === null) {
        dbData.guest_id = null;
      }
      // If it's undefined or invalid string, don't include it in the update
    }
    
    if (booking.guest !== undefined && booking.guest !== null) {
      dbData.guest = booking.guest;
    }
    
    if (booking.guests !== undefined) {
      dbData.guests = booking.guests || null;
    }
    
    if (booking.checkIn !== undefined && booking.checkIn !== null) {
      dbData.check_in = booking.checkIn;
    }
    
    if (booking.checkOut !== undefined && booking.checkOut !== null) {
      dbData.check_out = booking.checkOut;
    }
    
    if (booking.roomType !== undefined) {
      dbData.room_type = booking.roomType || null;
    }
    
    if (booking.adults !== undefined) {
      dbData.adults = booking.adults || null;
    }
    
    if (booking.children !== undefined) {
      dbData.children = booking.children || null;
    }
    
    if (booking.babies !== undefined) {
      dbData.babies = booking.babies || null;
    }
    
    if (booking.status !== undefined && booking.status !== null) {
      const oldStatus = existingBooking.status;
      const newStatus = booking.status;
      
      // Only update status if it's actually changing
      if (oldStatus !== newStatus) {
        dbData.status = newStatus;
        
        // Track status change timestamps
        const now = new Date().toISOString();
        if (newStatus === 'booked') {
          dbData.booked_at = now;
        } else if (newStatus === 'confirmed') {
          dbData.confirmed_at = now;
        } else if (newStatus === 'checked_in') {
          dbData.checked_in_at = now;
        } else if (newStatus === 'checked_out') {
          dbData.checked_out_at = now;
        } else if (newStatus === 'cancelled') {
          dbData.cancelled_at = now;
        }
      }
    }
    
    // Early check-in and late checkout fields
    if (booking.earlyCheckIn !== undefined) {
      dbData.early_check_in = booking.earlyCheckIn;
    }
    if (booking.earlyCheckInTime !== undefined) {
      dbData.early_check_in_time = booking.earlyCheckInTime || null;
    }
    if (booking.earlyCheckInNotes !== undefined) {
      dbData.early_check_in_notes = booking.earlyCheckInNotes || null;
    }
    if (booking.lateCheckOut !== undefined) {
      dbData.late_check_out = booking.lateCheckOut;
    }
    if (booking.lateCheckOutTime !== undefined) {
      dbData.late_check_out_time = booking.lateCheckOutTime || null;
    }
    if (booking.lateCheckOutNotes !== undefined) {
      dbData.late_check_out_notes = booking.lateCheckOutNotes || null;
    }
    
    // Only include invoiceId if it's a valid UUID, otherwise skip it entirely
    if (booking.invoiceId !== undefined) {
      if (isValidUUID(booking.invoiceId)) {
        dbData.invoice_id = booking.invoiceId;
      } else if (booking.invoiceId === null) {
        dbData.invoice_id = null;
      }
      // If it's undefined or invalid string, don't include it in the update
    }
    
    if (booking.items !== undefined) {
      dbData.items = booking.items && booking.items.length > 0 ? booking.items : null;
    }
    
    if (booking.notes !== undefined) {
      dbData.notes = booking.notes || null;
    }
    
    dbData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('bookings')
      .update(dbData)
      .eq('id', id);

    if (error) {
      console.error('Error updating booking:', error);
      throw new Error(`Failed to update booking: ${error.message || 'Unknown error'}`);
    } else {
      // Get booking details for logging
      const updatedBooking = await getBookingById(id);
      if (updatedBooking) {
        // Log activity
        await createActivityLog(
          "booking_updated",
          "booking",
          `Updated booking ${updatedBooking.bookingNumber}`,
          {
            entityId: id,
            entityName: updatedBooking.bookingNumber,
            metadata: {
              changes: Object.keys(dbData),
              status: updatedBooking.status,
            },
          }
        );
      }
    }
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
}

export async function deleteBooking(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const index = fallbackBookings.findIndex((b) => b.id === id);
    if (index !== -1) {
      fallbackBookings.splice(index, 1);
    }
    return;
  }

  try {
    if (!supabase) {
      const index = fallbackBookings.findIndex((b) => b.id === id);
      if (index !== -1) {
        fallbackBookings.splice(index, 1);
      }
      return;
    }

    // Get booking details before deletion for logging
    const bookingToDelete = await getBookingById(id);
    
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting booking:', error);
      throw new Error("Failed to delete booking");
    } else if (bookingToDelete) {
      // Log activity
      await createActivityLog(
        "booking_deleted",
        "booking",
        `Deleted booking ${bookingToDelete.bookingNumber}`,
        {
          entityId: id,
          entityName: bookingToDelete.bookingNumber,
          metadata: {
            guestName: bookingToDelete.guest.name,
            checkIn: bookingToDelete.checkIn,
            checkOut: bookingToDelete.checkOut,
          },
        }
      );
    }
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
}

// Get bookings by status
export async function getBookingsByStatus(status: BookingStatus): Promise<Booking[]> {
  const allBookings = await getBookings();
  return allBookings.filter((booking) => booking.status === status);
}

// Get bookings by date range
export async function getBookingsByDateRange(startDate: string, endDate: string): Promise<Booking[]> {
  const allBookings = await getBookings();
  return allBookings.filter((booking) => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check if booking overlaps with date range
    return (checkIn <= end && checkOut >= start);
  });
}

// Link booking to invoice
export async function linkBookingToInvoice(bookingId: string, invoiceId: string): Promise<void> {
  await updateBooking(bookingId, { invoiceId });
}
