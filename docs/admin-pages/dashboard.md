# Admin Page: Dashboard

## Route & Access
- Route: `GET /dashboard`
- Route name: `dashboard`
- Access: `auth` + `verified` middleware; Admin users see the Admin dashboard view.
- Backend entry: [DashboardController@index](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/DashboardController.php#L16-L36)

## UI
- Inertia page: [Dashboard.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Dashboard.jsx)
- Layout: [AuthenticatedLayout.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Layouts/AuthenticatedLayout.jsx)
- Tech stack: Laravel 12 + Inertia (React) + HeroUI + Tailwind + Ziggy routes.

## Features Built
### Admin KPI Cards (Stats)
- Total students
- Total classes
- Pending invoices count
- Monthly revenue (sum of Paid invoices for current `YYYY-MM`)

## Technical Specs
### Data Sources
- Students: `Student::count()`
- Classes: `ChessClass::count()`
- Pending invoices: `Invoice::where('status', 'Pending')->count()`
- Monthly revenue: `Invoice::where('status', 'Paid')->where('month_year', now()->format('Y-m'))->sum('total_amount')`

### Role-Specific Behavior
- Admin: renders `Dashboard` with `stats`.
- Coach: redirected to `coach.dashboard`.

## Notes / Constraints
- Dashboard currently only branches on `Admin` and `Coach` roles. Other roles (e.g., Ops/Finance) are not routed explicitly in the controller.
