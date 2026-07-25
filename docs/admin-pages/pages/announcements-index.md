# Admin Page: Announcements (Index)

## Route
- `GET /admin/announcements` (`admin.announcements.index`)
- Backend: [AnnouncementController@index](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/AnnouncementController.php#L17-L42)
- UI: [Admin/Announcements/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Announcements/Index.jsx)

## Features
- Announcement history list with:
  - title, channel, audience, status, sent_at, dispatch count
- Filters:
  - channel
  - audience
  - search by title

## How It Works (Technical)
- Query uses `Announcement::withCount('dispatches')` and applies optional filters.
- Pagination: 15 per page.

