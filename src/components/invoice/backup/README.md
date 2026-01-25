# Invoice layout backups

Backup of the **original** invoice web view and print view before applying professional font sizing and styling.

- **`invoice-layout.backup.tsx`** – Web view (`InvoiceLayout`)
- **`invoice-print-layout.backup.tsx`** – Print view (`InvoicePrintLayout`)

## Restore

To revert to the original layouts:

1. Copy `invoice-layout.backup.tsx` → `../invoice-layout.tsx`
2. Copy `invoice-print-layout.backup.tsx` → `../invoice-print-layout.tsx`
3. Restore any `globals.css` changes (see `docs/INVOICE_FONT_SIZES.md` or `INVOICE_BACKUP_README` for referenced rules).
