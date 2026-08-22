# Admin Page: Invoices

## Routes & Access
- Base prefix: `/admin/invoices/*`
- Routes:
  - `GET /admin/invoices` (`admin.invoices.index`)
  - `GET /admin/invoices/{invoice}` (`admin.invoices.show`)
  - `GET /admin/invoices/{invoice}/pdf` (`admin.invoices.pdf`)
  - `PUT /admin/invoices/{invoice}` (`admin.invoices.update`)
  - `POST /admin/invoices/{invoice}/send` (`admin.invoices.send`)
  - `POST /admin/invoices/{invoice}/adjustments` (`admin.invoices.adjustments.store`) — record carry-forward adjustment
  - `DELETE /admin/invoices/adjustments/{adjustment}` (`admin.invoices.adjustments.destroy`) — remove pending adjustment
- Access: `auth` + `role:Admin`
- Backend controller: [Admin/InvoiceController](app/Http/Controllers/Admin/InvoiceController.php)

## UI
- Index: [Admin/Invoices/Index.jsx](resources/js/Pages/Admin/Invoices/Index.jsx)
- Show: [Admin/Invoices/Show.jsx](resources/js/Pages/Admin/Invoices/Show.jsx)
- PDF Templates:
  - Invoice: [pdf/invoice.blade.php](resources/views/pdf/invoice.blade.php)
  - Official Receipt: [pdf/receipt.blade.php](resources/views/pdf/receipt.blade.php)

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

### 5. Finance Adjustments (itemized credits & charges)
- Admin can add **adjustment line items** to a Draft invoice — each with a **type** (`credit` or `charge`), **amount**, and **reason** — plus `finance_remarks`.
- Involves `invoice_adjustments` records; the net (charges − credits) is mirrored into `manual_adjustment` for compatibility.
- Total is recomputed: `total_amount = base + tax − recurring_discount + Σcharges − Σcredits` (clamped ≥ 0).
- Adjustments are editable **only while the invoice is `Draft`** (edits to non-Draft are rejected).

### 6. Carry-Forward Adjustments (refunds & additional fees)
- **"Record Adjustment for Next Month"** stores a pending credit (refund) or charge (additional fee) against the student.
- `invoices:generate-monthly` auto-applies all **pending** adjustments to that student's next month's Draft invoice on the 1st of the month.
- Applied rows flip `pending → applied` (never used twice). Pending adjustments can be removed; applied adjustments are managed via the Draft update flow.

### 7. Send Invoice Control
- `Draft` invoices are sent to parents via email and notification engine, moving status to `Pending`.

## Notes
- PDF rendering powered by `barryvdh/laravel-dompdf` (v3.1).
