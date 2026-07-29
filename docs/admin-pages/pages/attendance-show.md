# Admin Page: Attendance (Show)

## Route
- `GET /admin/attendances/{class}/{date}` (`admin.attendances.show`)
- `POST /admin/attendances/{class}/{date}` (`admin.attendances.store`)
- `DELETE /admin/attendances/{class}/{date}` (`admin.attendances.destroy`)
- Backend: [AttendanceController](app/Http/Controllers/Admin/AttendanceController.php#L188-L273)
- UI: [Admin/Attendance/Show.jsx](resources/js/Pages/Admin/Attendance/Show.jsx), [AttendanceModal.jsx](resources/js/Pages/Admin/Attendance/AttendanceModal.jsx)

## Features
- Takes attendance for a given class/date.
- Stores session metadata:
  - topic, notes, coach override (per date) via `class_sessions`
- Stores presence per student via `attendances`.
- Prevents attendance submission for future dates.
- Supports deleting attendance (removes attendances + class_session for that date).

## How It Works (Technical)
- Roster assembly:
  - includes Active students in class
  - plus any student already having attendance records for that class/date
- Store uses a DB transaction:
  - upserts `ClassSession` for `class_id + session_date`
  - replaces attendance rows for class/date with submitted values

