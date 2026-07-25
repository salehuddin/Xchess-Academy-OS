# Admin Page: Classes (Create)

## Route
- `GET /admin/classes/create` (`admin.classes.create`)
- `POST /admin/classes` (`admin.classes.store`)
- Backend: [ClassController@create/store](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/ClassController.php#L60-L198)
- UI: [Admin/Classes/Create.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Classes/Create.jsx)

## Features
- Create a class with:
  - package, room, coach (optional)
  - mode (Online/Physical) + status
  - weekly day + start/end time
  - online meeting fields (zoom_link, meeting_id, link_expiry) when Online

## How It Works (Technical)
- Loads dropdown data:
  - coaches (role Coach)
  - packages (title + sessions_per_month)
  - rooms (name/mode/location/platform)
- Validation includes:
  - required: uid/name/package/mode/status/day/time/room
  - optional: coach_id
  - conflict prevention:
    - coach overlap check (same day + time overlap)
    - room overlap check (same day + time overlap)
- UID generation:
  - `CLS-` + random string with uniqueness check in controller.

