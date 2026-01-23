export interface TravelCompany {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  phone2?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string; // Tax ID or VAT number
  contactPersonTitle?: string; // Title for contact person (Mr, Mrs, Dr, etc.)
  contactPerson?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TravelCompanyCreate {
  name: string;
  email?: string;
  phone?: string;
  phone2?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  contactPersonTitle?: string;
  contactPerson?: string;
  notes?: string;
}

export interface TravelCompanyUpdate {
  name?: string;
  email?: string;
  phone?: string;
  phone2?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  contactPersonTitle?: string;
  contactPerson?: string;
  notes?: string;
}
