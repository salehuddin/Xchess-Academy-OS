# Admin Page: Classes

## Routes & Access
- Base prefix: `/admin/classes/*`
- Resource routes: `admin.classes.*` via [web.php](file:///c:/laragon/www/xchess-academy-os/routes/web.php#L44-L48)
- Additional routes:
  - Enroll student: `POST /admin/classes/{class}/enroll` (`admin.classes.enroll`)
  - Unenroll student: `DELETE /admin/classes/{class}/enroll/{student}` (`admin.classes.unenroll`)
  - Update JSON schedules: `PUT /admin/classes/{class}/schedules` (`admin.classes.schedules.update`)
- Access: `auth` + `role:Admin`
- Backend controller: [Admin/ClassController](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/ClassController.php)
- Enrollment controller: [Admin/EnrollmentController](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/EnrollmentController.php)

## UI
- Index: [Admin/Classes/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Classes/Index.jsx)
- Create: [Admin/Classes/Create.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Classes/Create.jsx)
- Show: [Admin/Classes/Show.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Classes/Show.jsx)

## Features Built
### Class CRUD
- Create/update class with:
  - `mode`: `Online` or `Physical`
  - `status`: `Active|Pending|Paused|Stopped`
  - weekly day + start/end time
  - room assignment
  - optional coach assignment
  - online metadata (`zoom_link`, `meeting_id`, `link_expiry`) when mode is Online

### Conflict Prevention (Coach & Room)
- On create/update, validates:
  - coach cannot be double-booked on same day/time window
  - room cannot be double-booked on same day/time window
- Implemented as custom validation closures in [ClassController](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/ClassController.php#L71-L188)

### Enrollment Management
- Enroll/unenroll students into classes via `student_classes` pivot table.

### JSON Schedule Editing (classes.schedules)
- Each class stores scheduled dates as `classes.schedules` (JSON array of `YYYY-MM-DD`).
- Admin can update schedules per class.
- Safety check prevents removing schedule dates that already have:
  - attendance records (`attendances`)
  - class session overrides (`class_sessions`)
- Implemented in [updateSchedules](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/ClassController.php#L200-L232)

### Class Details View
- Shows:
  - class metadata (coach, package, room, schedules)
  - enrolled students
  - `attendanceCounts` aggregated by date (present count)
  - recent session overrides via `classSessions`

## Technical Specs
### Data Model
- Class model: [ChessClass.php](file:///c:/laragon/www/xchess-academy-os/app/Models/ChessClass.php)
- Key fields:
  - `uid` auto-generated (e.g., `CLS-XXXXXXXX`)
  - `mode`, `status`, `day`, `start_time`, `end_time`, `room_id`, `coach_id`
  - `schedules` (casted to array)
- Relations:
  - `students()` many-to-many (pivot `student_classes`)
  - `classSessions()` hasMany overrides (date-based session metadata)

### How “Scheduled Sessions” Are Determined
- Default sessions come from JSON `classes.schedules`.
- Per-date overrides come from `class_sessions`:
  - can override coach for a specific date
  - can store topic/notes

## Notes / Constraints
- Room conflicts in schedule generation are handled in Room/Schedule UI and generator workflow; Class create/update prevents only same-day/time clashes by `room_id`.
