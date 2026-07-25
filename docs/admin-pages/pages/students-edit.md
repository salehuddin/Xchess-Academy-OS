# Admin Page: Students (Edit)

## Route
- `GET /admin/students/{student}/edit` (`admin.students.edit`)
- `PUT/PATCH /admin/students/{student}` (`admin.students.update`)
- Backend: [StudentController@edit/update](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/StudentController.php#L211-L248)
- UI: [Admin/Students/Edit.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Students/Edit.jsx)

## Features
- Edit student information:
  - identity fields
  - preferred language, level, status
  - registration date
- Can change linked parent.

## How It Works (Technical)
- Loads student with parent for initial form state.
- Validates key student fields on update.
- Writes updates to the `students` row (and `parent_id` if changed).

