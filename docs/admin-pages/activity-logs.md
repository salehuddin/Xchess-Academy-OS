# Admin Page: Activity Audit Logs

## Routes & Access
- Route: `GET /admin/activity-logs` (`admin.activity-logs.index`)
- Access: `auth` + `role:Admin`
- Controller: [ActivityLogController](app/Http/Controllers/Admin/ActivityLogController.php)
- View: [Admin/ActivityLogs/Index.jsx](resources/js/Pages/Admin/ActivityLogs/Index.jsx)

## Features Built
- Audits critical administrative actions across the application using `spatie/laravel-activitylog`.
- Tracks:
  - Causer (Admin user who performed the action)
  - Action description & event type
  - Subject model & ID
  - Date and time timestamp
- Includes real-time search filter and server-side pagination.
- Payroll actions use the `payroll` log name and include:
  - System payroll generation/regeneration
  - Admin Draft payroll edits with before/after values
  - Admin processing and payment status transitions
