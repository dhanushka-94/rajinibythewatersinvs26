import { supabase } from './supabase';

export interface BankDetail {
  id: string;
  accountName: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  bankAddress: string;
  swiftCode: string;
  createdAt?: string;
  updatedAt?: string;
}

// Default bank detail template
const defaultBankDetail: BankDetail = {
  id: "bank-1",
  accountName: "Phoenix Global Solutions",
  bankName: "Chase Bank",
  branch: "Mission Hills",
  accountNumber: "966553973",
  bankAddress: "270 Park Ave, New York, NY 10017",
  swiftCode: "CHASUS33",
};

// In-memory fallback if Supabase is not configured
let fallbackBankDetails: BankDetail[] = [defaultBankDetail];

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return supabase !== null;
};

export async function getBankDetails(): Promise<BankDetail[]> {
  if (!isSupabaseConfigured()) {
    return fallbackBankDetails;
  }

  try {
    if (!supabase) {
      return fallbackBankDetails;
    }
    const { data, error } = await supabase
      .from('bank_details')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bank details:', error);
      return fallbackBankDetails;
    }

    // Map database fields to our interface
    return (data || []).map((item: any) => ({
      id: item.id,
      accountName: item.account_name,
      bankName: item.bank_name,
      branch: item.branch,
      accountNumber: item.account_number,
      bankAddress: item.bank_address,
      swiftCode: item.swift_code,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })) || fallbackBankDetails;
  } catch (error) {
    console.error('Error fetching bank details:', error);
    return fallbackBankDetails;
  }
}

export async function getBankDetailById(id: string): Promise<BankDetail | undefined> {
  if (!isSupabaseConfigured()) {
    return fallbackBankDetails.find((bank) => bank.id === id);
  }

  try {
    if (!supabase) {
      return fallbackBankDetails.find((bank) => bank.id === id);
    }
    const { data, error } = await supabase
      .from('bank_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching bank detail:', error);
      return fallbackBankDetails.find((bank) => bank.id === id);
    }

    if (!data) return undefined;

    // Map database fields to our interface
    return {
      id: data.id,
      accountName: data.account_name,
      bankName: data.bank_name,
      branch: data.branch,
      accountNumber: data.account_number,
      bankAddress: data.bank_address,
      swiftCode: data.swift_code,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error fetching bank detail:', error);
    return fallbackBankDetails.find((bank) => bank.id === id);
  }
}

export async function addBankDetail(bank: Omit<BankDetail, "id" | "createdAt" | "updatedAt">): Promise<BankDetail> {
  if (!isSupabaseConfigured()) {
    const newBank: BankDetail = {
      ...bank,
      id: `bank-${Date.now()}`,
    };
    fallbackBankDetails.push(newBank);
    return newBank;
  }

  try {
    if (!supabase) {
      const newBank: BankDetail = {
        ...bank,
        id: `bank-${Date.now()}`,
      };
      fallbackBankDetails.push(newBank);
      return newBank;
    }
    
    // Map our interface to database fields
    const dbData = {
      account_name: bank.accountName,
      bank_name: bank.bankName,
      branch: bank.branch,
      account_number: bank.accountNumber,
      bank_address: bank.bankAddress,
      swift_code: bank.swiftCode,
    };

    const { data, error } = await supabase
      .from('bank_details')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('Error adding bank detail:', error);
      const newBank: BankDetail = {
        ...bank,
        id: `bank-${Date.now()}`,
      };
      fallbackBankDetails.push(newBank);
      return newBank;
    }

    // Map database response to our interface
    return {
      id: data.id,
      accountName: data.account_name,
      bankName: data.bank_name,
      branch: data.branch,
      accountNumber: data.account_number,
      bankAddress: data.bank_address,
      swiftCode: data.swift_code,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error adding bank detail:', error);
    const newBank: BankDetail = {
      ...bank,
      id: `bank-${Date.now()}`,
    };
    fallbackBankDetails.push(newBank);
    return newBank;
  }
}

export async function updateBankDetail(id: string, bank: Partial<BankDetail>): Promise<void> {
  if (!isSupabaseConfigured()) {
    const index = fallbackBankDetails.findIndex((b) => b.id === id);
    if (index !== -1) {
      fallbackBankDetails[index] = { ...fallbackBankDetails[index], ...bank };
    }
    return;
  }

  try {
    if (!supabase) {
      const index = fallbackBankDetails.findIndex((b) => b.id === id);
      if (index !== -1) {
        fallbackBankDetails[index] = { ...fallbackBankDetails[index], ...bank };
      }
      return;
    }

    // Map our interface to database fields
    const dbData: any = {};
    if (bank.accountName !== undefined) dbData.account_name = bank.accountName;
    if (bank.bankName !== undefined) dbData.bank_name = bank.bankName;
    if (bank.branch !== undefined) dbData.branch = bank.branch;
    if (bank.accountNumber !== undefined) dbData.account_number = bank.accountNumber;
    if (bank.bankAddress !== undefined) dbData.bank_address = bank.bankAddress;
    if (bank.swiftCode !== undefined) dbData.swift_code = bank.swiftCode;
    dbData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('bank_details')
      .update(dbData)
      .eq('id', id);

    if (error) {
      console.error('Error updating bank detail:', error);
      const index = fallbackBankDetails.findIndex((b) => b.id === id);
      if (index !== -1) {
        fallbackBankDetails[index] = { ...fallbackBankDetails[index], ...bank };
      }
    }
  } catch (error) {
    console.error('Error updating bank detail:', error);
  }
}

export async function deleteBankDetail(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const index = fallbackBankDetails.findIndex((b) => b.id === id);
    if (index !== -1) {
      fallbackBankDetails.splice(index, 1);
    }
    return;
  }

  try {
    if (!supabase) {
      const index = fallbackBankDetails.findIndex((b) => b.id === id);
      if (index !== -1) {
        fallbackBankDetails.splice(index, 1);
      }
      return;
    }
    const { error } = await supabase
      .from('bank_details')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting bank detail:', error);
      const index = fallbackBankDetails.findIndex((b) => b.id === id);
      if (index !== -1) {
        fallbackBankDetails.splice(index, 1);
      }
    }
  } catch (error) {
    console.error('Error deleting bank detail:', error);
  }
}
