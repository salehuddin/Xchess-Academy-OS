# Admin Page: Payments & Chip Gateway Reconciliation

## Routes & Access
- Admin Base prefix: `/admin/payments/*` (`admin.payments.*`)
- Parent Checkout: `POST /portal/{token}/invoices/{invoice}/checkout` (`portal.invoice.checkout`)
- Chip Webhook: `POST /webhooks/chip` (CSRF-Exempt)
- Access: `auth` + `role:Admin` for Admin panel; Tokenized access for Parent Portal
- Controllers:
  - Admin: [Admin/PaymentController](app/Http/Controllers/Admin/PaymentController.php)
  - Portal & Webhook: [Portal/ChipPaymentController](app/Http/Controllers/Portal/ChipPaymentController.php)

## Features Built

### 1. Chip Online Payment Gateway Integration
- **Online Checkout**: Parents can click **"Pay via Chip"** in the Parent Portal (`/portal/{token}/invoices/{invoice}`).
- **Purchase API Request**: Redirects securely to Chip checkout interface supporting FPX Online Banking, Credit Cards, and E-Wallets.
- **Webhook Reconciliation (`/webhooks/chip`)**:
  - Excluded from CSRF validation in `bootstrap/app.php`.
  - Validates `X-Signature` header using configured `chip_webhook_secret`.
  - Matches invoice ID from purchase payload reference (`INV-{invoice_id}`).
  - Automatically creates a `Payment` record with `payment_method = 'Chip Gateway'` and updates invoice status to `Paid`.

### 2. Manual Payment Recording & History
- Admin can manually record payments (Cash, Bank Transfer, Cheque) against invoices.
- Recalculates total paid vs invoice `total_amount` to set status (`Paid`, `Partial`, or `Pending`).

## Technical Specs
- Controller: [ChipPaymentController.php](app/Http/Controllers/Portal/ChipPaymentController.php)
- Feature Test: [ChipPaymentTest.php](tests/Feature/Portal/ChipPaymentTest.php)
