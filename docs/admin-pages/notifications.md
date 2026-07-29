# Admin Page: Notifications (Builder)

## Routes & Access
- Builder list: `GET /admin/notifications` (`admin.notifications.index`)
- Create: `GET /admin/notifications/create` (`admin.notifications.create`)
- Store: `POST /admin/notifications` (`admin.notifications.store`)
- Edit: `GET /admin/notifications/{notification}/edit` (`admin.notifications.edit`)
- Update: `PUT /admin/notifications/{notification}` (`admin.notifications.update`)
- Delete: `DELETE /admin/notifications/{notification}` (`admin.notifications.destroy`)
- Dispatch log: `GET /admin/notifications/dispatches` (`admin.notifications.dispatches`)
- Channel settings: `GET /admin/notifications/settings` (`admin.notifications.settings`)
- Access: `auth` + `role:Admin`
- Backend controller: [Admin/NotificationController](app/Http/Controllers/Admin/NotificationController.php)

## UI
- Builder index: [Admin/Notifications/Index.jsx](resources/js/Pages/Admin/Notifications/Index.jsx)
- Create: [Admin/Notifications/Create.jsx](resources/js/Pages/Admin/Notifications/Create.jsx)
- Edit: [Admin/Notifications/Edit.jsx](resources/js/Pages/Admin/Notifications/Edit.jsx)
- Dispatch log: [Admin/Notifications/Dispatches.jsx](resources/js/Pages/Admin/Notifications/Dispatches.jsx)
- Channel settings: [Admin/Notifications/Settings.jsx](resources/js/Pages/Admin/Notifications/Settings.jsx)

## Features Built
### Notification Template Builder
- Create templates for:
  - Email (subject + body)
  - WhatsApp (body)
- Enable/disable templates via `is_active`.

### Triggers (Event Sources)
- `invoice_sent`
  - Fired when Admin clicks “Send Invoice” in Invoices.
  - Backend: [InvoiceController@send](app/Http/Controllers/Admin/InvoiceController.php#L57-L77) → `NotificationEngine::triggerInvoiceSent()`
- `invoice_overdue`
  - Fired by scheduler/command based on `invoice.due_date`.
- `announcement`
  - Trigger type is present in builder; broadcast announcements are implemented in a separate module (Announcements page).

### Overdue Reminder Frequency (Admin-Controlled)
- For trigger `invoice_overdue`, template supports offset-day schedule:
  - `0,3,7,14` means “send on due date, then +3 days, +7 days, +14 days”.
- Stored as `schedule = { type: 'offset_days', days: [...] }`.
- Backend parsing: [validateNotification](app/Http/Controllers/Admin/NotificationController.php#L145-L189)

### Dispatch Log (History)
- Shows queued/sent notifications with status:
  - `Pending|Sent|Failed|Skipped`
- Supports filters: status, channel, free-text search.
- Backend: [dispatches](app/Http/Controllers/Admin/NotificationController.php#L26-L55)

### Channel Settings (Visibility Only)
- Shows email configuration state (without exposing secrets):
  - mail driver, from name/address, SMTP host/port, and whether username/password are set
  - provider keys presence indicators (Postmark, Resend, SES)
- Shows WhatsApp driver and whether provider env vars exist.

## Technical Specs
### Data Model
- Notification template: [Notification.php](app/Models/Notification.php)
- Dispatch history: [NotificationDispatch.php](app/Models/NotificationDispatch.php)
- Dispatch record includes:
  - `notifiable_type/notifiable_id` (currently invoices)
  - `scheduled_for`, `sent_at`, `status`, `error`, `context`

### Processing (CLI Command)
- Command: `php artisan notifications:run --date=YYYY-MM-DD --limit=250`
- Implementation: [ProcessNotifications](app/Console/Commands/ProcessNotifications.php)
- Steps:
  1. Mark invoices `Overdue` when `due_date <= today` (on-the-dot behavior): [markInvoicesOverdue](app/Services/Notifications/NotificationEngine.php#L132-L141)
  2. Queue overdue dispatches if the date matches configured offset days: [queueOverdueForDate](app/Services/Notifications/NotificationEngine.php#L24-L89)
  3. Send due dispatches: [sendDueDispatches](app/Services/Notifications/NotificationEngine.php#L91-L130)

### Rendering (Template Variables)
- Uses a renderer to substitute placeholders in subject/body based on stored context.
- Context for invoices includes:
  - `parent_name`, `student_name`, `invoice_total_amount`, `invoice_due_date`, `portal_url`, etc.
- Builder context: [buildContext](app/Services/Notifications/NotificationEngine.php#L276-L291)

### Provider Configuration
- Email: configured via `config/mail.php` and `.env` variables (`MAIL_*`), surfaced read-only in Settings UI.
- WhatsApp: configured via `config/services.php`:
  - [services.php whatsapp config](config/services.php#L38-L50)

## Notes / Constraints
- The invoice send flow currently sends both:
  - legacy `InvoiceCreated` email, and
  - builder-driven notifications (if configured for invoice_sent)
- If you configure an email template for `invoice_sent`, parents may receive duplicate emails unless legacy email sending is removed or disabled.
