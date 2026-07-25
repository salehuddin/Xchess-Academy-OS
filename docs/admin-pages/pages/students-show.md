# Admin Page: Students (Show)

## Route
- `GET /admin/students/{student}` (`admin.students.show`)
- Backend: [StudentController@show](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/StudentController.php#L250-L268)
- UI: [Admin/Students/Show.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Students/Show.jsx)

## Features
- Student profile page with:
  - parent details
  - enrolled classes (package + coach)
  - invoice list
- Provides `availableClasses` for enrollment UI (classes not enrolled yet).

## How It Works (Technical)
- Loads student graph:
  - `parent`
  - `classes.package`
  - `classes.coach`
  - `invoices`
- Computes `availableClasses` by:
  - fetching active classes and removing currently enrolled IDs.

