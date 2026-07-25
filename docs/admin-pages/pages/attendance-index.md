# Admin Page: Attendance (Index)

## Route
- `GET /admin/attendances` (`admin.attendances.index`)
- Backend: [AttendanceController@index](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/AttendanceController.php#L16-L186)
- UI: [Admin/Attendance/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Attendance/Index.jsx)

## Features
- Lists attendance sessions derived from:
  - class schedules (`classes.schedules`)
  - session overrides (`class_sessions`)
- Filters:
  - date range
  - class
  - coach (effective coach = session override coach else class coach)
- Marks whether a session is “Delivered” (attendance exists).
- Hides future sessions that are not delivered.

## How It Works (Technical)
- Builds an attendance lookup map of distinct `(class_id, attendance_date)` in range.
- Merges scheduled dates + session override dates per class, unique + sorted.
- Filters out:
  - future dates unless delivered
  - non-matching coach filter based on effective coach

