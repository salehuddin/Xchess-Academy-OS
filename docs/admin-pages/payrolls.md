# Admin Page: Payrolls

## Routes & Access
- Page: `GET /admin/payrolls` (`admin.payrolls.index`)
- Mark processed: `POST /admin/payrolls/{payroll}/approve` (`admin.payrolls.approve`)
- Mark paid: `POST /admin/payrolls/{payroll}/mark-paid` (`admin.payrolls.markPaid`)
- Access: `auth` + `role:Admin`
- Backend controller: [Admin/PayrollController](app/Http/Controllers/Admin/PayrollController.php)

## UI
- Page: [Admin/Payrolls/Index.jsx](resources/js/Pages/Admin/Payrolls/Index.jsx)

## Features Built
### Payroll Listing
- Lists payroll records by month (descending) with associated coach.

### Status Actions
- Mark payroll as `Processed`
- Mark payroll as `Paid`

## Technical Specs
### Data Model
- Payroll model: [Payroll.php](app/Models/Payroll.php)
- Fields:
  - `month_year` (`YYYY-MM`)
  - `total_sessions` (int)
  - `base_rate` (decimal)
  - `total_amount` (decimal)
  - `status` (`Draft|Processed|Paid`)
  - `generated_at` (datetime)

### How Payroll Is Generated
- Payroll records are generated via Artisan command:
  - `php artisan payroll:generate-monthly {month?}`
- Implementation: [GenerateMonthlyPayroll](app/Console/Commands/GenerateMonthlyPayroll.php)
- Calculation:
  - Delivered sessions are counted as distinct `(class_id, attendance_date)` pairs
  - Filtered by classes where `classes.coach_id = coach.id`
  - `total_amount = sessionCount * coach.hourly_rate`
  - Stored using `Payroll::updateOrCreate()` per coach + month

## Notes / Constraints
- Payroll is currently based on `user.hourly_rate` and delivered sessions, not `package.coach_rate_per_session`.
- Session overrides (`class_sessions.coach_id`) are not counted toward payroll generation; only class-level coach assignment is used.
