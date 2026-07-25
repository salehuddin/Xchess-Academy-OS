# Admin Page: Students

## Routes & Access
- Base prefix: `/admin/students/*`
- Resource routes: `admin.students.*` (index/create/store/show/edit/update/destroy) via [web.php](file:///c:/laragon/www/xchess-academy-os/routes/web.php#L33-L84)
- Access: `auth` + `role:Admin`
- Backend controller: [Admin/StudentController](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/StudentController.php)

## UI
- Index: [Admin/Students/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Students/Index.jsx)
- Create: [Admin/Students/Create.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Students/Create.jsx)
- Bulk Create: [Admin/Students/BulkCreate.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Students/BulkCreate.jsx)
- Edit: [Admin/Students/Edit.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Students/Edit.jsx)
- Show: [Admin/Students/Show.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Students/Show.jsx)
- Modals:
  - Parent: [ParentDetailsModal.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Students/ParentDetailsModal.jsx)
  - Student: [StudentDetailsModal.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Students/StudentDetailsModal.jsx)
- Layout: [AuthenticatedLayout.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Layouts/AuthenticatedLayout.jsx)

## Features Built
### Student Listing (Index)
- Search across student fields and parent fields:
  - `name`, `student_uid`, `nric_passport`
  - parent `name/email/phone`
- Filters:
  - Student status (supports comma-separated status list; `all` bypasses)
  - Parent filter (`no_parent` or specific parent)
  - Date range (`date_of_registration` from/to)
- Sorting + pagination (server-side).

### Create Student
- Supports linking to:
  - Existing parent, or
  - New parent created during student creation
- Automatically generates `student_uid` as `STU-XXXXXX` (random, uniqueness checked).

### Bulk Create Students
- Accepts an array of students, each supporting:
  - Existing parent, or
  - New parent (deduplicates by parent email if already present)
- Wraps creation in a DB transaction.

### Student Details (Show)
- Loads:
  - Parent
  - Enrolled classes (with `package` and `coach`)
  - Invoice list
- Provides `availableClasses` (classes not yet enrolled) for enrollment workflows.

### Bulk Actions
- Bulk delete students.
- Bulk update:
  - status
  - level
  - preferred language

### Parent Utilities (AJAX)
- Parent search endpoint for typeahead
- Parent details endpoint for modal display
- Parent update endpoint

## Technical Specs
### Data Model
- Student model: [Student.php](file:///c:/laragon/www/xchess-academy-os/app/Models/Student.php)
- Parent model (table `parents`): [StudentParent.php](file:///c:/laragon/www/xchess-academy-os/app/Models/StudentParent.php)

### Backend Mechanics
- Listing: query uses `Student::with('parent')` and optional `whereHas('parent', ...)` search.
- UID generation:
  - Prefix `STU-` + random 6 chars via `Str::random(6)`, retries until unique.
- Parent token:
  - New parents get `unique_access_token` (`uuid`) when created from student flows.

### Validation Rules (Selected)
- Create/update: required identity fields (`name`, `nric_passport`, `preferred_language`, `date_of_registration`)
- Parent link mode:
  - `parent_mode` is `existing|new`
  - `parent_id` required when existing
  - `parent_email` required when new

## Related Endpoints / Integrations
- Enrollment routes live under Classes:
  - `POST /admin/classes/{class}/enroll` and `DELETE /admin/classes/{class}/enroll/{student}` in [web.php](file:///c:/laragon/www/xchess-academy-os/routes/web.php#L44-L47)
  - Controller: [EnrollmentController](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/EnrollmentController.php)
