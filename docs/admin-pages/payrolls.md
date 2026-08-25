# Admin Page: Payrolls

## Routes & Access
- Page: `GET /admin/payrolls` (`admin.payrolls.index`)
- View details: `GET /admin/payrolls/{payroll}` (`admin.payrolls.show`)
- Update Draft totals: `PUT /admin/payrolls/{payroll}` (`admin.payrolls.update`)
- Mark processed: `PUT /admin/payrolls/{payroll}/approve` (`admin.payrolls.approve`)
- Mark paid: `PUT /admin/payrolls/{payroll}/paid` (`admin.payrolls.paid`)
- Access: `auth` + `role:Admin`
- Backend controller: [Admin/PayrollController](app/Http/Controllers/Admin/PayrollController.php)

## UI
- Page: [Admin/Payrolls/Index.jsx](resources/js/Pages/Admin/Payrolls/Index.jsx)

## Features Built
### Payroll Listing
- Lists payroll records by month (descending) with associated coach.
- View action opens a detail modal with the saved session breakdown and activity trail.
- Payroll history is also shown on the Admin Coach Details page.

### Status Actions
- Admins can edit `Draft` payroll totals: sessions, average/base rate, and total amount.
- `Processed` and `Paid` payrolls are read-only for editing.
- Mark payroll as `Processed`
- Mark payroll as `Paid`

### Payroll Details
- Session line items show the attendance date, class, package, and snapshotted rate.
- Activity trail records generation, edits, processing, and payment actions with actor and timestamp.
- Payroll detail is available to the owning coach through the coach portal; editing remains admin-only.

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
- Payroll line items: [PayrollLineItem.php](app/Models/PayrollLineItem.php)
  - `payroll_id`, `class_id` (nullable), `class_name`, `package_title`, `attendance_date`, `rate`
- Line-item values are snapshots captured during generation, so the breakdown explains the stored payroll amount even if class/package data changes later.

### How Payroll Is Generated
- Payroll records are generated via Artisan command:
  - `php artisan payroll:generate-monthly {month?}`
- Implementation: [GenerateMonthlyPayroll](app/Console/Commands/GenerateMonthlyPayroll.php)
- Calculation:
  - Delivered sessions are counted as distinct `(class_id, attendance_date)` pairs
  - Filtered by classes where `classes.coach_id = coach.id`
  - Each session uses `packages.coach_rate_per_session`
  - `total_amount = sum(session package coach rates)`
  - Average rate is stored in `base_rate` for display
  - A line-item snapshot is stored for every counted session
  - New records are created as `Draft`; regeneration preserves an existing `Draft`, `Processed`, or `Paid` status

### Activity Logging
- Payroll actions use the existing Spatie activity log with log name `payroll`.
- Generation is attributed to `System`; admin edits and status changes are attributed to the authenticated admin.

## Notes / Constraints
- Session overrides (`class_sessions.coach_id`) are not counted toward payroll generation; only class-level coach assignment is used.
- Existing payrolls created before line-item snapshots may not have breakdown rows.
- Regeneration recomputes totals and line items while preserving the existing status; admins should review the activity trail when regenerating non-Draft payrolls.
