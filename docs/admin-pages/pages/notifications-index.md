# Admin Page: Notifications (Index / Builder List)

## Route
- `GET /admin/notifications` (`admin.notifications.index`)
- Backend: [NotificationController@index](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/NotificationController.php#L15-L24)
- UI: [Admin/Notifications/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Notifications/Index.jsx)

## Features
- Lists notification templates (email/whatsapp) and their triggers.
- Entry points to:
  - create/edit templates
  - Dispatch Log
  - Channel Settings

## How It Works (Technical)
- Uses `Notification::latest()->get()` (no pagination).
- Dispatches and settings pages are separate routes:
  - `/admin/notifications/dispatches`
  - `/admin/notifications/settings`

