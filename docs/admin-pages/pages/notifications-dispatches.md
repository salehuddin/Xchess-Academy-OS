# Admin Page: Notifications (Dispatch Log)

## Route
- `GET /admin/notifications/dispatches` (`admin.notifications.dispatches`)
- Backend: [NotificationController@dispatches](app/Http/Controllers/Admin/NotificationController.php#L26-L55)
- UI: [Admin/Notifications/Dispatches.jsx](resources/js/Pages/Admin/Notifications/Dispatches.jsx)

## Features
- History of queued/sent notification dispatches.
- Filters:
  - status (Pending/Sent/Failed/Skipped)
  - channel (email/whatsapp)
  - search (recipient or error)

## How It Works (Technical)
- Data source: `notification_dispatches` with eager-loaded `notification`.
- Sorted by `scheduled_for desc`, then id desc.
- Pagination: 20 per page.

