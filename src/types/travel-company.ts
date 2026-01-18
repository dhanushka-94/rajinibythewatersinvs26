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
  contactPerson?: string;
  notes?: string;
}
