import { Currency } from "@/types/invoice";

export const currencySymbols: Record<Currency, string> = {
  USD: "USD",
  LKR: "LKR",
};

export const currencyNames: Record<Currency, string> = {
  USD: "US Dollar",
  LKR: "Sri Lankan Rupee",
};

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = currencySymbols[currency];
  
  // Format with commas and currency code
  return `${symbol} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
