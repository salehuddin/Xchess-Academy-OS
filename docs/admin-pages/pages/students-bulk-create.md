# Admin Page: Students (Bulk Create)

## Route
- `GET /admin/students/bulk-create` (`admin.students.bulk-create`)
- `POST /admin/students/bulk-store` (`admin.students.bulk-store`)
- Backend: [StudentController@bulkCreate/bulkStore](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/StudentController.php#L90-L137)
- UI: [Admin/Students/BulkCreate.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Students/BulkCreate.jsx)

## Features
- Create multiple students in one submission.
- Supports parent association per student:
  - existing parent by ID, or
  - new parent (deduplicated by email if already present)

## How It Works (Technical)
- Validates an array payload of students.
- Runs in a DB transaction:
  - creates/fetches parent
  - generates unique student UID per record
  - inserts students
- Parent dedupe:
  - checks parent existence by email before creating.

