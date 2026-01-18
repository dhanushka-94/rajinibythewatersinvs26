import { supabase } from './supabase';
import { InvoiceItem } from '@/types/invoice';
import { createActivityLog } from './activity-logs';

// Default saved invoice items
const defaultItems: InvoiceItem[] = [
  {
    id: "item-1",
    description: "Deluxe Suite - Per Night",
    quantity: 1,
    unitPrice: 150,
    total: 150,
  },
  {
    id: "item-2",
    description: "Standard Room - Per Night",
    quantity: 1,
    unitPrice: 100,
    total: 100,
  },
  {
    id: "item-3",
    description: "Executive Suite - Per Night",
    quantity: 1,
    unitPrice: 200,
    total: 200,
  },
  {
    id: "item-4",
    description: "Presidential Suite - Per Night",
    quantity: 1,
    unitPrice: 500,
    total: 500,
  },
  {
    id: "item-5",
    description: "Room Service",
    quantity: 1,
    unitPrice: 45,
    total: 45,
  },
  {
    id: "item-6",
    description: "Laundry Service",
    quantity: 1,
    unitPrice: 25,
    total: 25,
  },
  {
    id: "item-7",
    description: "Mini Bar",
    quantity: 1,
    unitPrice: 30,
    total: 30,
  },
  {
    id: "item-8",
    description: "Spa Service",
    quantity: 1,
    unitPrice: 75,
    total: 75,
  },
  {
    id: "item-9",
    description: "Airport Transfer",
    quantity: 1,
    unitPrice: 50,
    total: 50,
  },
  {
    id: "item-10",
    description: "Breakfast Buffet",
    quantity: 1,
    unitPrice: 20,
    total: 20,
  },
];

// In-memory fallback if Supabase is not configured
let fallbackItems: InvoiceItem[] = [...defaultItems];

const isSupabaseConfigured = () => {
  return supabase !== null;
};

// Map database row to InvoiceItem interface
const mapDbToItem = (data: any): InvoiceItem => {
  return {
    id: data.id,
    description: data.description,
    quantity: data.quantity,
    unitPrice: data.unit_price,
    total: data.total,
    currency: data.currency || undefined,
  };
};

// Map InvoiceItem interface to database row
const mapItemToDb = (item: InvoiceItem): any => {
  return {
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total: item.total,
    currency: item.currency || null,
  };
};

export async function getSavedItems(): Promise<InvoiceItem[]> {
  if (!isSupabaseConfigured()) {
    return fallbackItems;
  }

  try {
    if (!supabase) {
      return fallbackItems;
    }
    const { data, error } = await supabase
      .from('invoice_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoice items:', error);
      return fallbackItems;
    }

    return (data || []).map(mapDbToItem);
  } catch (error) {
    console.error('Error fetching invoice items:', error);
    return fallbackItems;
  }
}

export async function getSavedItemById(id: string): Promise<InvoiceItem | undefined> {
  if (!isSupabaseConfigured()) {
    return fallbackItems.find((item) => item.id === id);
  }

  try {
    if (!supabase) {
      return fallbackItems.find((item) => item.id === id);
    }
    
    const { data, error } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching invoice item:', error);
      return fallbackItems.find((item) => item.id === id);
    }

    if (!data) return undefined;
    return mapDbToItem(data);
  } catch (error) {
    console.error('Error fetching invoice item:', error);
    return fallbackItems.find((item) => item.id === id);
  }
}

export async function addSavedItem(item: Omit<InvoiceItem, "id">): Promise<InvoiceItem> {
  if (!isSupabaseConfigured()) {
    const newItem: InvoiceItem = {
      ...item,
      id: `item-${Date.now()}`,
    };
    fallbackItems.push(newItem);
    return newItem;
  }

  try {
    if (!supabase) {
      const newItem: InvoiceItem = {
        ...item,
        id: `item-${Date.now()}`,
      };
      fallbackItems.push(newItem);
      return newItem;
    }

    const dbData = mapItemToDb(item as InvoiceItem);
    const { data, error } = await supabase
      .from('invoice_items')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('Error adding invoice item:', error);
      const newItem: InvoiceItem = {
        ...item,
        id: `item-${Date.now()}`,
      };
      fallbackItems.push(newItem);
      return newItem;
    }

    const createdItem = mapDbToItem(data);
    
    // Log activity
    await createActivityLog(
      "other",
      "invoice_item",
      `Created invoice item: ${createdItem.description}`,
      {
        entityId: createdItem.id,
        entityName: createdItem.description,
        metadata: {
          unitPrice: createdItem.unitPrice,
          currency: createdItem.currency,
        },
      }
    );
    
    return createdItem;
  } catch (error) {
    console.error('Error adding invoice item:', error);
    const newItem: InvoiceItem = {
      ...item,
      id: `item-${Date.now()}`,
    };
    fallbackItems.push(newItem);
    return newItem;
  }
}

export async function updateSavedItem(id: string, item: Partial<InvoiceItem>): Promise<void> {
  if (!isSupabaseConfigured()) {
    const index = fallbackItems.findIndex((i) => i.id === id);
    if (index !== -1) {
      fallbackItems[index] = { ...fallbackItems[index], ...item };
    }
    return;
  }

  try {
    if (!supabase) {
      const index = fallbackItems.findIndex((i) => i.id === id);
      if (index !== -1) {
        fallbackItems[index] = { ...fallbackItems[index], ...item };
      }
      return;
    }

    const dbData: any = {};
    if (item.description !== undefined) dbData.description = item.description;
    if (item.quantity !== undefined) dbData.quantity = item.quantity;
    if (item.unitPrice !== undefined) dbData.unit_price = item.unitPrice;
    if (item.total !== undefined) dbData.total = item.total;
    if (item.currency !== undefined) dbData.currency = item.currency;
    dbData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('invoice_items')
      .update(dbData)
      .eq('id', id);

    if (error) {
      console.error('Error updating invoice item:', error);
    } else {
      // Get item details for logging
      const updatedItem = await getSavedItemById(id);
      if (updatedItem) {
        // Log activity
        await createActivityLog(
          "other",
          "invoice_item",
          `Updated invoice item: ${updatedItem.description}`,
          {
            entityId: id,
            entityName: updatedItem.description,
            metadata: {
              changes: Object.keys(item),
            },
          }
        );
      }
    }
  } catch (error) {
    console.error('Error updating invoice item:', error);
  }
}

export async function deleteSavedItem(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const index = fallbackItems.findIndex((i) => i.id === id);
    if (index !== -1) {
      fallbackItems.splice(index, 1);
    }
    return;
  }

  try {
    if (!supabase) {
      const index = fallbackItems.findIndex((i) => i.id === id);
      if (index !== -1) {
        fallbackItems.splice(index, 1);
      }
      return;
    }

    // Get item details before deletion for logging
    const itemToDelete = await getSavedItemById(id);
    
    const { error } = await supabase
      .from('invoice_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting invoice item:', error);
    } else if (itemToDelete) {
      // Log activity
      await createActivityLog(
        "other",
        "invoice_item",
        `Deleted invoice item: ${itemToDelete.description}`,
        {
          entityId: id,
          entityName: itemToDelete.description,
          metadata: {
            unitPrice: itemToDelete.unitPrice,
            currency: itemToDelete.currency,
          },
        }
      );
    }
  } catch (error) {
    console.error('Error deleting invoice item:', error);
  }
}
