# Admin Page: Notifications (Channel Settings)

## Route
- `GET /admin/notifications/settings` (`admin.notifications.settings`)
- Backend: [NotificationController@settings](app/Http/Controllers/Admin/NotificationController.php#L57-L106)
- UI: [Admin/Notifications/Settings.jsx](resources/js/Pages/Admin/Notifications/Settings.jsx)

## Features
- Read-only visibility into notification channel configuration:
  - email mailer + SMTP host/port + credentials presence
  - provider key presence (Postmark/Resend/SES)
  - WhatsApp driver + provider key presence (Twilio/Meta Cloud)

## How It Works (Technical)
- Reads configuration from:
  - [config/mail.php](config/mail.php)
  - [config/services.php](config/services.php)
- Only exposes “is set” booleans for secrets (never the secret values).

