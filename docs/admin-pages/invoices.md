# Admin Page: Invoices

## Routes & Access
- Base prefix: `/admin/invoices/*`
- Routes:
  - `GET /admin/invoices` (`admin.invoices.index`)
  - `GET /admin/invoices/{invoice}` (`admin.invoices.show`)
  - `GET /admin/invoices/{invoice}/pdf` (`admin.invoices.pdf`)
  - `PUT /admin/invoices/{invoice}` (`admin.invoices.update`)
  - `POST /admin/invoices/{invoice}/send` (`admin.invoices.send`)
- Access: `auth` + `role:Admin`
- Backend controller: [Admin/InvoiceController](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/InvoiceController.php)

## UI
- Index: [Admin/Invoices/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Invoices/Index.jsx)
- Show: [Admin/Invoices/Show.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Invoices/Show.jsx)
- PDF Templates:
  - Invoice: [pdf/invoice.blade.php](file:///c:/laragon/www/xchess-academy-os/resources/views/pdf/invoice.blade.php)
  - Official Receipt: [pdf/receipt.blade.php](file:///c:/laragon/www/xchess-academy-os/resources/views/pdf/receipt.blade.php)

## Features Built

### 1. Invoice Listing & Details
- Server-side pagination with student & parent relationships.
- Shows itemized tuition breakdown, tax, recurring student discount, and total payable.

### 2. PDF Invoice Generation
- Admins can click **"Download PDF Invoice"** to stream official PDF invoices (`/admin/invoices/{invoice}/pdf`).
- Dynamic company profile data (Company Name, SSM Reg No, Address, Phone, Email, and Bank Account Details) embedded into printable PDF template.

### 3. Chip Online Payment Gateway & Webhook Reconciliation
- Tokenized Parent Portal invoice checkout link (`/portal/{token}/invoices/{invoice}/checkout`).
- Parents can pay online via FPX, Credit Cards, or E-Wallets via Chip.
- CSRF-exempt `/webhooks/chip` webhook automatically reconciles invoice status to `Paid` and generates a `Payment` record in real-time.

### 4. Official Payment Receipts
- Paid invoices generate downloadable **Official Receipts** (`/portal/{token}/invoices/{invoice}/receipt-pdf`).
- Features payment date, transaction reference ID, payment method, and verified electronic stamp.

### 5. Finance Adjustments
- Admin can adjust `manual_adjustment` and `finance_remarks`.
- Recomputes `total_amount = base_amount + tax_amount - recurring_discount_val - manual_adjustment` (clamped to min 0).

### 6. Send Invoice Control
- `Draft` invoices are sent to parents via email and notification engine, moving status to `Pending`.

## Notes
- PDF rendering powered by `barryvdh/laravel-dompdf` (v3.1).
