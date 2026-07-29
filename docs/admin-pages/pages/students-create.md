# Admin Page: Students (Create)

## Route
- `GET /admin/students/create` (`admin.students.create`)
- `POST /admin/students` (`admin.students.store`)
- Backend: [StudentController@create/store](app/Http/Controllers/Admin/StudentController.php#L82-L136)
- UI: [Admin/Students/Create.jsx](resources/js/Pages/Admin/Students/Create.jsx)

## Features
- Create a student and link to a parent:
  - Select existing parent, or
  - Create a new parent inline
- Generates a unique student UID with `STU-` prefix.

## How It Works (Technical)
- Parent handling is controlled by `parent_mode`:
  - `existing` → `parent_id` is required
  - `new` → creates a new parent row with `unique_access_token` UUID
- Student UID generation:
  - `STU-` + random 6-char string with uniqueness retry loop.

