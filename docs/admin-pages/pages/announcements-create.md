# Admin Page: Announcements (Create)

## Route
- `GET /admin/announcements/create` (`admin.announcements.create`)
- `POST /admin/announcements` (`admin.announcements.store`)
- Backend: [AnnouncementController@create/store](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/AnnouncementController.php#L44-L68)
- UI: [Admin/Announcements/Create.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Announcements/Create.jsx)

## Features
- Create a broadcast announcement:
  - channel: email or WhatsApp
  - audience: all parents or a specific class
  - email subject (email only)
  - body
  - optional “Send now” toggle

## How It Works (Technical)
- Loads class list for audience targeting:
  - `ChessClass::select(id, uid, name, mode)->orderBy(name)`
- On create with `send_now=true`, calls:
  - [AnnouncementEngine@sendNow](file:///c:/laragon/www/xchess-academy-os/app/Services/Announcements/AnnouncementEngine.php#L18-L58)
- Recipient resolution pulls from `parents` table and filters based on:
  - email/phone presence
  - enrollment in selected class (if class audience)

