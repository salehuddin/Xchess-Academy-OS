# Admin Page: Dashboard

## Route
- `GET /dashboard` (`dashboard`)
- Backend: [DashboardController@index](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/DashboardController.php#L16-L36)
- UI: [Dashboard.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Dashboard.jsx)

## Features
- Admin KPI cards:
  - total students
  - total classes
  - pending invoices
  - monthly revenue

## How It Works (Technical)
- Students count: `Student::count()`
- Classes count: `ChessClass::count()`
- Pending invoices count: `Invoice::where('status', 'Pending')->count()`
- Monthly revenue:
  - sums `Paid` invoices for current `month_year` (`YYYY-MM`) using `total_amount`

## Role Behavior
- Admin: renders this page.
- Coach: redirected to `coach.dashboard`.

