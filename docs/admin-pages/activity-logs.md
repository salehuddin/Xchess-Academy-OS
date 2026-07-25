# Admin Page: Activity Audit Logs

## Routes & Access
- Route: `GET /admin/activity-logs` (`admin.activity-logs.index`)
- Access: `auth` + `role:Admin`
- Controller: [ActivityLogController](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/ActivityLogController.php)
- View: [Admin/ActivityLogs/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/ActivityLogs/Index.jsx)

## Features Built
- Audits critical administrative actions across the application using `spatie/laravel-activitylog`.
- Tracks:
  - Causer (Admin user who performed the action)
  - Action description & event type
  - Subject model & ID
  - Date and time timestamp
- Includes real-time search filter and server-side pagination.
