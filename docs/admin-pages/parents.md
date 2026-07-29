# Admin Page: Parents

## Routes & Access
- Base prefix: `/admin/parents/*`
- Resource routes: `admin.parents.*` via [web.php](routes/web.php#L55-L64)
- Access: `auth` + `role:Admin`
- Backend controller: [Admin/ParentController](app/Http/Controllers/Admin/ParentController.php)

## UI
- Page: [Admin/Parents/Index.jsx](resources/js/Pages/Admin/Parents/Index.jsx)
- Uses modals shared with Students:
  - [ParentDetailsModal.jsx](resources/js/Pages/Admin/Students/ParentDetailsModal.jsx)
  - [StudentDetailsModal.jsx](resources/js/Pages/Admin/Students/StudentDetailsModal.jsx)

## Features Built
### Parent Listing
- Paginated table with:
  - Parent name + email
  - Phone
  - Student count (via `withCount('students')`)
- Search by `name/email/phone`
- Sort by `name/email/phone/created_at`

### Parent CRUD (Inline Modals)
- Create parent (generates `unique_access_token` UUID)
- Edit parent
- Delete parent (blocked if parent has students)

### Parent Details (Modal)
- Loads parent + associated students for quick inspection.

## Technical Specs
### Data Model
- Parent model uses `parents` table: [StudentParent.php](app/Models/StudentParent.php)
- Relationship: `StudentParent hasMany Student` via `parent_id`

### Backend Mechanics
- Index query: `StudentParent::with(students)->withCount(students)` with optional search and sorting.
- Token generation:
  - New parent `unique_access_token` is generated as `Str::uuid()`.

### Validation Rules
- Create/update:
  - `name` required
  - `email` required + unique (nullable in DB, but required in controller)
  - `phone` optional

## Related Endpoints
- StudentController also exposes parent helpers under `/admin/parents/*`:
  - Search: `GET /admin/parents/search`
  - Details: `GET /admin/parents/{parent}/details`
  - Update (JSON): `PUT /admin/parents/{parent}`
  - Routes: [web.php](routes/web.php#L54-L57)
  - Controller: [Admin/StudentController](app/Http/Controllers/Admin/StudentController.php#L270-L347)
