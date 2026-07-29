# Admin Page: Notifications (Edit)

## Route
- `GET /admin/notifications/{notification}/edit` (`admin.notifications.edit`)
- `PUT /admin/notifications/{notification}` (`admin.notifications.update`)
- Backend: [NotificationController@edit/update](app/Http/Controllers/Admin/NotificationController.php#L123-L136)
- UI: [Admin/Notifications/Edit.jsx](resources/js/Pages/Admin/Notifications/Edit.jsx)

## Features
- Edit template fields:
  - name, channel, trigger
  - subject/body
  - active toggle
  - conditions (class mode)
  - overdue schedule offsets

## How It Works (Technical)
- Uses the same validation builder as create:
  - [validateNotification](app/Http/Controllers/Admin/NotificationController.php#L145-L189)
- Updates the `notifications` record; dispatch history is stored separately.

