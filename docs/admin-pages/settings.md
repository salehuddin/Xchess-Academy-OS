# Admin Page: System & Settings Suite

## Overview
The System & Settings suite provides centralized control over academy branding, external service integrations, user activity auditing, and application system logs.

## Sub-Modules & Routes
1. **Company Profile & Branding**:
   - `GET /admin/settings/company` (`admin.settings.company`)
   - `POST /admin/settings/company` (`admin.settings.company.update`)
   - Controller: [SettingController@company](app/Http/Controllers/Admin/SettingController.php)
   - View: [Admin/Settings/Company.jsx](resources/js/Pages/Admin/Settings/Company.jsx)

2. **External Services**:
   - `GET /admin/settings/services` (`admin.settings.services`)
   - `POST /admin/settings/services` (`admin.settings.services.update`)
   - Controller: [SettingController@services](app/Http/Controllers/Admin/SettingController.php)
   - View: [Admin/Settings/Services.jsx](resources/js/Pages/Admin/Settings/Services.jsx)

3. **Activity Audit Logs**:
   - `GET /admin/activity-logs` (`admin.activity-logs.index`)
   - Controller: [ActivityLogController](app/Http/Controllers/Admin/ActivityLogController.php)
   - View: [Admin/ActivityLogs/Index.jsx](resources/js/Pages/Admin/ActivityLogs/Index.jsx)

4. **System Exception Logs**:
   - `GET /admin/system-logs` (`admin.system-logs.index`)
   - `DELETE /admin/system-logs` (`admin.system-logs.clear`)
   - Controller: [SystemLogController](app/Http/Controllers/Admin/SystemLogController.php)
   - View: [Admin/SystemLogs/Index.jsx](resources/js/Pages/Admin/SystemLogs/Index.jsx)

## Data Security & Encryption
- Credentials (such as Chip API Keys, Webhook Secrets, Mail Passwords, and WhatsApp Tokens) are stored in the `settings` table using Laravel's `Crypt` facade for encrypted persistence.
- Model: [Setting.php](app/Models/Setting.php)
