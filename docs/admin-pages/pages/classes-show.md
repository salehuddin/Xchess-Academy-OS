# Admin Page: Classes (Show)

## Route
- `GET /admin/classes/{class}` (`admin.classes.show`)
- Backend: [ClassController@show](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/ClassController.php#L234-L273)
- UI: [Admin/Classes/Show.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Classes/Show.jsx)

## Features
- Class details and configuration view.
- Enrollment management:
  - enroll: `POST /admin/classes/{class}/enroll` (`admin.classes.enroll`)
  - unenroll: `DELETE /admin/classes/{class}/enroll/{student}` (`admin.classes.unenroll`)
- Schedule editing:
  - update schedules: `PUT /admin/classes/{class}/schedules` (`admin.classes.schedules.update`)
- Attendance counts per date (present count), plus recent session overrides.

## How It Works (Technical)
- Loads class with: `students`, `package`, `coach`, `room`.
- Loads classSessions + attendance records to compute:
  - `attendanceCounts[YYYY-MM-DD] = presentCount`
- Provides `availableStudents` for enrollment picker.
- Schedule update endpoint blocks removal of “protected” dates:
  - if any `Attendance` exists for class+date
  - if any `ClassSession` exists for class+date
- Schedule update logic: [updateSchedules](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/ClassController.php#L200-L232)

