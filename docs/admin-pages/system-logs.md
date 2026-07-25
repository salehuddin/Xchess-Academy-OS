# Admin Page: System Exception Logs

## Routes & Access
- Index Route: `GET /admin/system-logs` (`admin.system-logs.index`)
- Clear Route: `DELETE /admin/system-logs` (`admin.system-logs.clear`)
- Access: `auth` + `role:Admin`
- Controller: [SystemLogController](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/SystemLogController.php)
- View: [Admin/SystemLogs/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/SystemLogs/Index.jsx)

## Features Built
- Real-time viewer for Laravel system log files (`storage/logs/laravel.log`).
- Parses raw log output into structured log entries (Timestamp, Environment, Log Level, Message, Stacktrace).
- Level Badges (`EMERGENCY`, `CRITICAL`, `ERROR`, `WARNING`, `INFO`).
- Features a **"Clear System Logs"** button for log maintenance.
