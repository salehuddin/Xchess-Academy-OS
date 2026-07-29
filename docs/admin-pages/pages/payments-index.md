# Admin Page: Payments (Index)

## Route
- `GET /admin/payments` (`admin.payments.index`)
- Backend: [PaymentController@index](app/Http/Controllers/Admin/PaymentController.php#L16-L25)
- UI: [Admin/Payments/Index.jsx](resources/js/Pages/Admin/Payments/Index.jsx)

## Features
- Record a payment against an invoice.
- View payment history list.
- Provides invoice picker of invoices that are not Paid.

## How It Works (Technical)
- Index loads:
  - payments with `invoice.student.user`
  - unpaid invoices list with `student.user`
- Store recalculates invoice status by summing payments.

## Known Gaps (Current Build)
- Controller references `$invoice->amount` and may set invoice status to `Unpaid`, but invoices use `total_amount` and supported statuses are `Draft|Pending|Paid|Overdue|Partial`.

