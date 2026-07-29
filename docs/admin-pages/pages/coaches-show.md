# Admin Page: Coaches (Show)

## Route
- `GET /admin/coaches/{coach}` (`admin.coaches.show`)
- Backend: [CoachController@show](app/Http/Controllers/Admin/CoachController.php#L109-L172)
- UI: [Admin/Coaches/Show.jsx](resources/js/Pages/Admin/Coaches/Show.jsx)

## Features
- Coach profile overview.
- Assigned classes list (package, room, day, time, mode, status).
- Recent attendance (last 100) across coach classes as proof-of-delivery snapshot.
- Coach options list (for reassignment/selectors in UI).

## How It Works (Technical)
- Loads coach + profile, aborts 404 if not a coach-like user.
- Fetches classes where `coach_id = coach.id` and maps them into simplified DTOs.
- Fetches attendances:
  - `Attendance::whereHas('class', fn ($q) => $q->where('coach_id', coach.id))`
  - includes student name, class/package/room, date/time

