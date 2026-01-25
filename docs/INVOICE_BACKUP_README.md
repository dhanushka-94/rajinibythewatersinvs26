# Invoice backup & professional styling

## Backup location

- **Web view:** `src/components/invoice/backup/invoice-layout.backup.tsx`
- **Print view:** `src/components/invoice/backup/invoice-print-layout.backup.tsx`

## globals.css (print)

The live invoice print view uses `@media print` rules in `src/app/globals.css`:

- `th, td`: default `font-size: 11pt`, `padding: 8px 4px`
- `.invoice-print-template table th, .invoice-print-template table td`: override to `9pt`

If you change these, keep a copy of the original block for restore.

## Restore original layouts

```bash
cp src/components/invoice/backup/invoice-layout.backup.tsx src/components/invoice/invoice-layout.tsx
cp src/components/invoice/backup/invoice-print-layout.backup.tsx src/components/invoice/invoice-print-layout.tsx
```

(Use `copy` on Windows.)

## Professional styling (current live)

The **live** layouts use professional font sizing and styling:

**Web:** 10px–22px scale; `antialiased`; header 11px, INVOICE 22px `tracking-tight`, section titles 14px, body 13px, table 12px headers / 11px cells, summary 13px / Total 16px, payment 10–12px, footer 11px. Icons `text-gray-600` for hierarchy.

**Print:** 8pt–14pt scale; hotel 8pt, INVOICE 14pt `letter-spacing: -0.02em`, section titles 10pt, body 9pt, table 9pt, summary 9pt / Total 11pt, payment 8–9pt, footer 8pt. Icons `#6b7280`.

See `docs/INVOICE_FONT_SIZES.md` for the full reference.

---

## Many items / multi-page A4

When an invoice has **too many items** to fit on one A4 page:

- The **items table** is allowed to **break across pages** (no `page-break-inside: avoid` on the table wrapper).
- The **table header** (Description, Qty/Days, Unit Price, Total) **repeats on each continued page** via `thead { display: table-header-group }` in print CSS.
- **Individual rows** stay together (`page-break-inside: avoid` on `tr`); breaks occur *between* rows.
- The table wrapper uses `overflow: visible` in print so content is not clipped.
