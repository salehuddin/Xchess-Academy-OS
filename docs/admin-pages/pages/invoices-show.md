# Admin Page: Invoices (Show)

## Route
- `GET /admin/invoices/{invoice}` (`admin.invoices.show`)
- `PUT /admin/invoices/{invoice}` (`admin.invoices.update`)
- `POST /admin/invoices/{invoice}/send` (`admin.invoices.send`)
- Backend: [InvoiceController](app/Http/Controllers/Admin/InvoiceController.php)
- UI: [Admin/Invoices/Show.jsx](resources/js/Pages/Admin/Invoices/Show.jsx)

## Features
- View invoice details (student, parent, enrolled packages).
- Update finance fields:
  - manual adjustment
  - finance remarks
- Send invoice notification (Draft only).

## How It Works (Technical)
- Update recomputes `total_amount`:
  - `base_amount + tax_amount - recurring_discount_val - manual_adjustment` (clamped to >= 0)
- Send action:
  - changes status Draft → Pending
  - sets `notification_sent=true`
  - sends legacy email mailable if parent email exists
  - triggers notification builder engine: `NotificationEngine::triggerInvoiceSent()`

