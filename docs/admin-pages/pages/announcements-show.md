# Admin Page: Announcements (Show)

## Route
- `GET /admin/announcements/{announcement}` (`admin.announcements.show`)
- `POST /admin/announcements/{announcement}/send` (`admin.announcements.send`)
- Backend: [AnnouncementController@show/send](app/Http/Controllers/Admin/AnnouncementController.php#L70-L92)
- UI: [Admin/Announcements/Show.jsx](resources/js/Pages/Admin/Announcements/Show.jsx)

## Features
- Shows announcement content (title, channel, audience, subject/body).
- Shows delivery history (dispatch log) for this announcement.
- Allows sending Draft announcements via “Send Now”.

## How It Works (Technical)
- Loads dispatches:
  - `AnnouncementDispatch::where('announcement_id', id)->orderByDesc('scheduled_for')->paginate(30)`
- Send action calls the engine which:
  - creates dispatch rows per recipient
  - sends immediately via EmailChannel or WhatsAppChannel
- Engine: [AnnouncementEngine](app/Services/Announcements/AnnouncementEngine.php)

