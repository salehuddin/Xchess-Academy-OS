# Admin Page: Reports (Index)

## Route
- `GET /admin/reports` (`admin.reports.index`)
- Backend: [ReportController@index](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/ReportController.php#L14-L31)
- UI: [Admin/Reports/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Reports/Index.jsx)

## Features
- High-level financial KPIs:
  - total revenue (paid invoices)
  - total expenses (paid payrolls)
  - net income
- Monthly breakdown based on existing paid months.

## How It Works (Technical)
- Revenue source: `invoices.total_amount` where status Paid.
- Expense source: `payrolls.total_amount` where status Paid.
- Monthly stats derived by collecting distinct `month_year` values from both tables and summing per month.

