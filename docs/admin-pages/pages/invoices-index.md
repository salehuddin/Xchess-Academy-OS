# Admin Page: Invoices (Index)

## Route
- `GET /admin/invoices` (`admin.invoices.index`)
- Backend: [InvoiceController@index](app/Http/Controllers/Admin/InvoiceController.php#L16-L25)
- UI: [Admin/Invoices/Index.jsx](resources/js/Pages/Admin/Invoices/Index.jsx)

## Features
- Lists invoices with student relation.
- Paginates newest-first.

## How It Works (Technical)
- Query:
  - `Invoice::with('student')->latest()->paginate(10)`
- No filters/search implemented on this page yet.

