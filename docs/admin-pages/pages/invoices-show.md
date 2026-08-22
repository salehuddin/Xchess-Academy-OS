# Admin Page: Invoices (Show)

## Route
- `GET /admin/invoices/{invoice}` (`admin.invoices.show`)
- `PUT /admin/invoices/{invoice}` (`admin.invoices.update`)
- `POST /admin/invoices/{invoice}/send` (`admin.invoices.send`)
- `POST /admin/invoices/{invoice}/adjustments` (`admin.invoices.adjustments.store`)
- `DELETE /admin/invoices/adjustments/{adjustment}` (`admin.invoices.adjustments.destroy`)
- Backend: [InvoiceController](app/Http/Controllers/Admin/InvoiceController.php)
- UI: [Admin/Invoices/Show.jsx](resources/js/Pages/Admin/Invoices/Show.jsx)

## Features
- View invoice details (student, parent, enrolled packages).
- Update finance fields (Draft only):
  - itemized **adjustment line items** (`credit` / `charge`, each with amount + reason)
  - finance remarks
- **Record Adjustment for Next Month** (carry-forward refund credit / additional charge).
- Send invoice notification (Draft only).

## How It Works (Technical)
- Update recomputes `total_amount`:
  - `max(0, base + tax − recurring_discount + Σcharges − Σcredits)`
  - net (charges − credits) mirrored into `manual_adjustment` for compatibility
  - Only allowed when status is `Draft`; otherwise rejected.
- Record carry-forward creates a `status=pending` `invoice_adjustments` row (invoice_id null, student_id set).
- Monthly generator (`invoices:generate-monthly`) applies pending adjustments to the next month's Draft invoice and flips them to `applied`.
- Send action:
  - changes status Draft → Pending
  - sets `notification_sent=true`
  - sends legacy email mailable if parent email exists
  - triggers notification builder engine: `NotificationEngine::triggerInvoiceSent()`
