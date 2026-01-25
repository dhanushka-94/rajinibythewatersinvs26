# Invoice font sizes – Web, Print & Email

Reference for all font sizes used in invoice **web view** (`invoice-layout.tsx`), **print view** (`invoice-print-layout.tsx` + `globals.css`), and **email** (`invoice-email-layout.tsx`).

---

## Tailwind equivalents (web)

| Class        | Size   | px (approx) |
|-------------|--------|-------------|
| `text-[7pt]`| 7pt    | ~9.3px      |
| `text-[8pt]`| 8pt    | ~10.7px     |
| `text-[9px]`| 9px    | 9px         |
| `text-[10px]`| 10px  | 10px        |
| `text-xs`   | 12px   | 12px        |
| `text-sm`   | 14px   | 14px        |
| `text-base` | 16px   | 16px        |
| `text-lg`   | 18px   | 18px        |
| `text-xl`   | 20px   | 20px        |

---

## 1. Web view (`invoice-layout.tsx`)

### Header
| Element | Web | Print (when printing web view) |
|--------|-----|--------------------------------|
| Hotel address, phone, email, website | `text-xs` (12px) | `print:text-[7pt]` |
| "INVOICE" title | `text-xl` (20px) | `print:text-[14pt]` |
| Invoice number | `text-lg` (18px) | `print:text-[12pt]` |
| Currency, Date | `text-xs` (12px) | `print:text-[7pt]` |
| Status badge | `text-xs` | `print:text-[7pt]` |

### Bill To / Guest Info / Booking Details
| Element | Web | Print |
|--------|-----|-------|
| Section titles (Bill To:, Guest Information:, Booking Details:) | `text-base` (16px) | `print:text-sm` (14px) |
| Section body (names, contact, dates, room, guests) | `text-sm` (14px) | `print:text-xs` (12px) |

### Items table
| Element | Web | Print |
|--------|-----|-------|
| **Headers** (Description, Qty/Days, etc.) | `text-sm` (14px), same as Payment Information heading | `print:text-xs` (12px) |
| **Cells** | `text-xs` (12px) | `print:text-[8pt]` |

*Note: `globals.css` overrides **print template** items to 9pt when using `InvoicePrintLayout`. When printing the **web** layout, these Tailwind print classes apply.*

### Summary (Subtotal, Tax, Total, etc.)
| Element | Web | Print |
|--------|-----|-------|
| Subtotal, Service Charge, Tax, etc. | `text-sm` (14px) | `print:text-xs` (12px) |
| "Total Amount:" | `text-lg` (18px) | `print:text-base` (16px) |

### Notes
| Element | Web | Print |
|--------|-----|-------|
| "Notes:" heading | `text-sm` (14px) | `print:text-xs` (12px) |
| Notes body | `text-sm` (14px) | `print:text-xs` (12px) |

### Payment Information
| Element | Web | Print |
|--------|-----|-------|
| "Payment Methods:" | `text-[10px]` | `print:text-[7pt]` |
| Bank Details / Bank #n | `text-[9px]` | `print:text-[7pt]` |
| Bank grid (Bank, Branch, etc.) | `text-[9px]` | `print:text-[7pt]` |
| "Make Checks Payable To:" | `text-[10px]` | `print:text-[7pt]` |

### Footer
| Element | Web | Print |
|--------|-----|-------|
| Thank you / Powered by | `text-xs` (12px) | `print:text-[10px]` |

---

## 2. Print view (`invoice-print-layout.tsx`)

*Uses inline `fontSize` (pt). `globals.css` @media print overrides items table (see below).*

### Header
| Element | Font size |
|--------|-----------|
| Hotel address, phone, email, website | **7pt** |
| "INVOICE" | **14pt** |
| Invoice number | **12pt** |
| Currency, Date | **7pt** |

### Bill To / Guest Info / Booking Details
| Element | Font size |
|--------|-----------|
| Section titles (Bill To:, Guest Information:, Booking Details:) | **11pt** |
| Bill To body (company/guest) | **9pt** |
| Guest Information body | **9pt** |
| Booking Details body (check-in, check-out, room, guests) | **9pt** |

### Items table (headers same as Payment Information heading: 9pt)
| Element | Font size | Override in globals.css |
|--------|-----------|--------------------------|
| **Headers** (Description, Qty/Days, Unit Price, Total) | **9pt** | same as Payment Information heading |
| **Cells** (description, qty, unit price, total) | **9pt** | `.invoice-print-template table td` → 9pt |

### Summary
| Element | Font size |
|--------|-----------|
| Subtotal, Service Charge, Tax, etc. | **8pt** |
| "Total Amount:" | **11pt** |

### Notes
| Element | Font size |
|--------|-----------|
| "Notes:" heading | **9pt** |
| Notes body | **9pt** |

### Payment Information
| Element | Font size |
|--------|-----------|
| "Payment Information" heading | **9pt** |
| Payment Methods text | **7pt** |
| "Bank Details:" / "Bank #n:" | **7pt** |
| Bank grid (Bank, Branch, Account, etc.) | **7pt** |
| "Make Checks Payable To:" | **7pt** |

### Footer
| Element | Font size |
|--------|-----------|
| Thank you / Powered by | **8pt** |

---

## 3. Email view (`invoice-email-layout.tsx`)

*Inline `font-size` (px). HTML email; matches web structure.*

### Header
| Element | Font size |
|--------|-----------|
| Hotel address, phone, email, website | **12px** |
| "INVOICE" | **20px** |
| Invoice number | **18px** |
| Currency, Date, Status badge | **12px** / **11px** (badge) |

### Bill To / Guest Info / Booking Details
| Element | Font size |
|--------|-----------|
| Section titles (Bill To:, Guest Information:, Booking Details:) | **16px** |
| Section body (company, guest, contact, dates, room, guests) | **14px** |

### Items table (headers same as Payment Information heading: 14px)
| Element | Font size |
|--------|-----------|
| **Headers** (Description, Qty/Days, Unit Price, Total) | **14px** |
| **Cells** | **12px** |

### Summary
| Element | Font size |
|--------|-----------|
| Subtotal, Service Charge, Tax, etc. | **14px** |
| "Total Amount:" | **18px** |

### Notes
| Element | Font size |
|--------|-----------|
| "Notes:" heading | **14px** |
| Notes body | **14px** |

### Payment Information
| Element | Font size |
|--------|-----------|
| "Payment Information" heading | **14px** |
| Payment Methods, Make Checks Payable To | **10px** |
| Bank Details / Bank #n, grid (Bank, Branch, etc.) | **9px** |

### Footer
| Element | Font size |
|--------|-----------|
| Thank you / Powered by | **12px** |

---

## 4. `globals.css` – Print-related font sizes

### @media print (general)
| Selector | Font size |
|----------|-----------|
| `@page @bottom-center` (page number) | **9pt** |
| `body` | **12pt** |
| `th, td` (all tables) | **11pt** (default) |

### @media print – Invoice print template overrides
| Selector | Font size |
|----------|-----------|
| `.invoice-print-template table th, .invoice-print-template table td` | **9pt** |

Matches web view items table (text-xs / 12px). Overrides the general `th, td` 11pt for the print template items table.

---

## 5. Summary table (all views)

| Section | Web view | Print view | Email |
|---------|----------|------------|-------|
| **Header** (hotel, INVOICE, number, date) | 12px–20px (xs–xl) | 7pt–14pt | 12px–20px |
| **Bill To / Guest / Booking** titles | 16px (base) | 11pt | 16px |
| **Bill To / Guest / Booking** body | 14px (sm) | 9pt | 14px |
| **Items table** headers | 14px (sm), same as Payment Info heading | 9pt | 14px |
| **Items table** cells | 12px (xs) | 9pt | 12px |
| **Summary** lines | 14px (sm) | 8pt | 14px |
| **Total Amount** | 18px (lg) | 11pt | 18px |
| **Notes** | 14px (sm) | 9pt | 14px |
| **Payment Information** | 9–10px | 7–9pt | 9–14px |
| **Footer** | 12px (xs) | 8pt | 12px |

---

## 6. Where to change font sizes

- **Web view:** `src/components/invoice/invoice-layout.tsx` (Tailwind: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-[9px]`, `text-[10px]`, `print:text-[7pt]`, etc.).
- **Print view:** `src/components/invoice/invoice-print-layout.tsx` (inline `fontSize` in `style`, pt).
- **Email view:** `src/components/invoice/invoice-email-layout.tsx` (inline `font-size` in style, px).
- **Print overrides (items table):** `src/app/globals.css` → `@media print` → `.invoice-print-template table th, .invoice-print-template table td` → 9pt.
