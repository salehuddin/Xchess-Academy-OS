# Admin Page: Notifications (Create)

## Route
- `GET /admin/notifications/create` (`admin.notifications.create`)
- `POST /admin/notifications` (`admin.notifications.store`)
- Backend: [NotificationController@create/store](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/NotificationController.php#L108-L121)
- UI: [Admin/Notifications/Create.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Notifications/Create.jsx)

## Features
- Create a notification template for Email or WhatsApp.
- Select a trigger:
  - `invoice_sent`
  - `invoice_overdue` (supports reminder offsets)
  - `announcement` (reserved trigger type; announcements are currently a separate module)
- Optional condition: class mode (All/Online/Physical).
- Overdue schedule: comma-separated offset days (e.g. `0,3,7,14`).

## How It Works (Technical)
- Form posts to controller validation:
  - [validateNotification](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/NotificationController.php#L145-L189)
- Overdue offsets are normalized into a JSON schedule:
  - `{ "type": "offset_days", "days": [0,3,7,14] }`

