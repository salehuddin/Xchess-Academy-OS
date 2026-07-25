# Admin Page: Packages

## Routes & Access
- Base prefix: `/admin/packages/*`
- Resource routes: `admin.packages.*` via [web.php](file:///c:/laragon/www/xchess-academy-os/routes/web.php#L88-L90)
- Access: `auth` + `role:Admin`
- Backend controller: [Admin/PackageController](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/PackageController.php)

## UI
- Page: [Admin/Packages/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Packages/Index.jsx)

## Features Built
### Package CRUD (Inline)
- Create package with:
  - title
  - monthly fee
  - sessions per month
  - coach rate per session
- Update package
- Delete package:
  - blocked if package has associated classes

### Package Listing
- Search by title
- Sort by any column via `sort` + `direction`
- Displays `classes_count`

## Technical Specs
### Data Model
- Package model: [Package.php](file:///c:/laragon/www/xchess-academy-os/app/Models/Package.php)
- Key fields:
  - `monthly_fee`
  - `sessions_per_month` (also used by Schedule Generator)
  - `coach_rate_per_session` (used in payroll computations)

### Schedule Integration
- Schedule Generator applies a limit per class based on:
  - `package.sessions_per_month` or `class.sessions_per_month` fallback
- Controller: [ScheduleController@store](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/ScheduleController.php#L129-L135)
