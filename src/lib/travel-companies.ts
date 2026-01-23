"use server";

import { supabase } from './supabase';
import { TravelCompany, TravelCompanyCreate, TravelCompanyUpdate } from '@/types/travel-company';
import { createActivityLog } from './activity-logs';
import { nowISOStringSL } from './date-sl';

// Map database row to TravelCompany interface
function mapDbToTravelCompany(data: any): TravelCompany {
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    phone2: data.phone2,
    address: data.address,
    city: data.city,
    country: data.country,
    taxId: data.tax_id,
    contactPerson: data.contact_person,
    notes: data.notes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Map TravelCompany interface to database row
function mapTravelCompanyToDb(company: TravelCompanyCreate | TravelCompanyUpdate): any {
  const dbData: any = {};
  if ('name' in company && company.name !== undefined) dbData.name = company.name;
  if ('email' in company && company.email !== undefined) dbData.email = company.email || null;
  if ('phone' in company && company.phone !== undefined) dbData.phone = company.phone || null;
  if ('phone2' in company && company.phone2 !== undefined) dbData.phone2 = company.phone2 || null;
  if ('address' in company && company.address !== undefined) dbData.address = company.address || null;
  if ('city' in company && company.city !== undefined) dbData.city = company.city || null;
  if ('country' in company && company.country !== undefined) dbData.country = company.country || null;
  if ('taxId' in company && company.taxId !== undefined) dbData.tax_id = company.taxId || null;
  if ('contactPerson' in company && company.contactPerson !== undefined) dbData.contact_person = company.contactPerson || null;
  if ('notes' in company && company.notes !== undefined) dbData.notes = company.notes || null;
  return dbData;
}

// Get all travel companies
export async function getTravelCompanies(): Promise<TravelCompany[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('travel_companies')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching travel companies:', error);
      return [];
    }

    return (data || []).map(mapDbToTravelCompany);
  } catch (error) {
    console.error('Error fetching travel companies:', error);
    return [];
  }
}

// Get travel company by ID
export async function getTravelCompanyById(id: string): Promise<TravelCompany | undefined> {
  if (!supabase) {
    return undefined;
  }

  try {
    const { data, error } = await supabase
      .from('travel_companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching travel company:', error);
      return undefined;
    }

    return data ? mapDbToTravelCompany(data) : undefined;
  } catch (error) {
    console.error('Error fetching travel company:', error);
    return undefined;
  }
}

// Create travel company
export async function createTravelCompany(companyData: TravelCompanyCreate): Promise<TravelCompany> {
  if (!supabase) {
    throw new Error("Database not configured");
  }

  const dbData = mapTravelCompanyToDb(companyData);
  dbData.created_at = nowISOStringSL();
  dbData.updated_at = nowISOStringSL();

  const { data, error } = await supabase
    .from('travel_companies')
    .insert([dbData])
    .select()
    .single();

  if (error) {
    console.error('Error creating travel company:', error);
    throw new Error("Failed to create travel company");
  }

  const createdCompany = mapDbToTravelCompany(data);
  
  // Log activity
  await createActivityLog(
    "travel_company_created",
    "travel_company",
    `Created travel company: ${createdCompany.name}`,
    {
      entityId: createdCompany.id,
      entityName: createdCompany.name,
      metadata: {
        email: createdCompany.email,
        phone: createdCompany.phone,
      },
    }
  );
  
  return createdCompany;
}

// Update travel company
export async function updateTravelCompany(id: string, companyData: TravelCompanyUpdate): Promise<void> {
  if (!supabase) {
    throw new Error("Database not configured");
  }

  const dbData = mapTravelCompanyToDb(companyData);
  dbData.updated_at = nowISOStringSL();

  const { error } = await supabase
    .from('travel_companies')
    .update(dbData)
    .eq('id', id);

  if (error) {
    console.error('Error updating travel company:', error);
    throw new Error("Failed to update travel company");
  } else {
    // Get company details for logging
    const updatedCompany = await getTravelCompanyById(id);
    if (updatedCompany) {
      // Log activity
      await createActivityLog(
        "travel_company_updated",
        "travel_company",
        `Updated travel company: ${updatedCompany.name}`,
        {
          entityId: id,
          entityName: updatedCompany.name,
          metadata: {
            changes: Object.keys(companyData),
          },
        }
      );
    }
  }
}

// Delete travel company
export async function deleteTravelCompany(id: string): Promise<void> {
  if (!supabase) {
    throw new Error("Database not configured");
  }

  // Get company details before deletion for logging
  const companyToDelete = await getTravelCompanyById(id);
  
  const { error } = await supabase
    .from('travel_companies')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting travel company:', error);
    throw new Error("Failed to delete travel company");
  } else if (companyToDelete) {
    // Log activity
    await createActivityLog(
      "travel_company_deleted",
      "travel_company",
      `Deleted travel company: ${companyToDelete.name}`,
      {
        entityId: id,
        entityName: companyToDelete.name,
        metadata: {
          email: companyToDelete.email,
          phone: companyToDelete.phone,
        },
      }
    );
  }
}
