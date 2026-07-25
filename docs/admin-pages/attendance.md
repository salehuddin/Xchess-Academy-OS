# Admin Page: Attendance

## Routes & Access
- Index: `GET /admin/attendances` (`admin.attendances.index`)
- Show: `GET /admin/attendances/{class}/{date}` (`admin.attendances.show`)
- Store: `POST /admin/attendances/{class}/{date}` (`admin.attendances.store`)
- Delete: `DELETE /admin/attendances/{class}/{date}` (`admin.attendances.destroy`)
- Access: `auth` + `role:Admin`
- Backend controller: [Admin/AttendanceController](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/AttendanceController.php)

## UI
- Index: [Admin/Attendance/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Attendance/Index.jsx)
- Show: [Admin/Attendance/Show.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Attendance/Show.jsx)
- Reusable modal: [AttendanceModal.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Attendance/AttendanceModal.jsx)

## Features Built
### Attendance Schedule Index
- Displays a list of sessions derived from:
  - `classes.schedules` JSON dates in range, plus
  - `class_sessions` dates in range (overrides)
- Filters:
  - date range (`start_date`, `end_date`)
  - class
  - coach (effective coach is `class_sessions.coach_id` if present, otherwise `classes.coach_id`)
- Delivered logic:
  - A schedule date is “delivered” if attendance exists for that class+date.
  - Future dates without delivery are hidden.

### Attendance Taking (Show / Modal)
- Loads roster as:
  - all Active students in the class, plus
  - any student who already has an attendance record on that date (even if not Active)
- Allows recording:
  - `is_present` per student
  - `topic`, `notes`, and per-session `coach_id` (stored in `class_sessions`)
- Safeguard: cannot submit attendance for future dates.

### Attendance Deletion
- Deletes both:
  - `class_sessions` record for that class+date
  - all `attendances` records for that class+date

## Technical Specs
### Data Model
- Attendance: [Attendance.php](file:///c:/laragon/www/xchess-academy-os/app/Models/Attendance.php)
- Session overrides: [ClassSession.php](file:///c:/laragon/www/xchess-academy-os/app/Models/ClassSession.php)
- Class schedules: `classes.schedules` JSON array

### “Effective Coach” Resolution
- If `ClassSession` exists for date: use `class_sessions.coach_id`
- Else: use `classes.coach_id`

### Data Assembly (Index)
- Pull classes + constrained `classSessions` in range.
- Build an `attendanceMap` grouped by class_id and date for fast delivered checks.
- For each class, merge `schedules` dates + `classSessions` dates, unique + sorted.
- Filter out:
  - dates outside range
  - future dates without delivery

## Notes / Constraints
- Attendance is used as proof-of-delivery and is independent of invoice/payment state.
