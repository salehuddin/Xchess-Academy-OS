# Admin Page: Students (Index)

## Route
- `GET /admin/students` (`admin.students.index`)
- Backend: [StudentController@index](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/StudentController.php#L27-L80)
- UI: [Admin/Students/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Students/Index.jsx)

## Features
- Student directory with server-side:
  - search (student + parent fields)
  - filters (status, parent, registration date range)
  - sorting + pagination
- Launches detail modals:
  - parent details
  - student quick details
- Bulk actions:
  - update status/level/preferred_language
  - delete

## How It Works (Technical)
- Query uses `Student::with('parent')` plus:
  - `whereHas('parent', ...)` for parent search
  - status filter supports comma-separated list (except `all`)
- Bulk action endpoint:
  - `POST /admin/students/bulk-action` (`admin.students.bulk-action`)
  - Backend: [bulkAction](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/StudentController.php#L138-L209)

