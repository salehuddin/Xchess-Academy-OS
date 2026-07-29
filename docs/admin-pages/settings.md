# Admin Page: System & Settings Suite

## Overview
The System & Settings suite provides centralized control over academy branding, external service integrations, notification system behavior, user activity auditing, and application system logs.

## Sub-Modules & Routes
1. **Unified Settings Page**:
   - `GET /admin/settings` (`admin.settings.index`)
   - Controller: [SettingController@index](app/Http/Controllers/Admin/SettingController.php)
   - View: [Admin/Settings/Index.jsx](resources/js/Pages/Admin/Settings/Index.jsx)
   - Tabs: Company Profile, Email/SMTP, WhatsApp, Chip Payment Gateway, Notification System

2. **Settings Update Endpoints**:
   - `POST /admin/settings/company` (`admin.settings.company.update`)
   - `POST /admin/settings/services` (`admin.settings.services.update`)
   - `POST /admin/settings/notifications` (`admin.settings.notifications.update`)
   - `POST /admin/settings/test-smtp` (`admin.settings.test-smtp`)
   - `POST /admin/settings/test-chip` (`admin.settings.test-chip`)
   - `POST /admin/settings/test-whatsapp` (`admin.settings.test-whatsapp`)

3. **Activity Audit Logs**:
   - `GET /admin/activity-logs` (`admin.activity-logs.index`)

4. **System Exception Logs**:
   - `GET /admin/system-logs` (`admin.system-logs.index`)
   - `DELETE /admin/system-logs` (`admin.system-logs.clear`)

## Data Security & Encryption
- Credentials (such as Chip API Keys, Webhook Secrets, Mail Passwords, and WhatsApp Tokens) are stored in the `settings` table using Laravel's `Crypt` facade for encrypted persistence.
- Model: [Setting.php](app/Models/Setting.php)
