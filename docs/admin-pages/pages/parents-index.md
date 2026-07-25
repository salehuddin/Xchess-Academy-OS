# Admin Page: Parents (Index)

## Route
- `GET /admin/parents` (`admin.parents.index`)
- Backend: [ParentController@index](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/ParentController.php#L15-L54)
- UI: [Admin/Parents/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Parents/Index.jsx)

## Features
- Parent listing with:
  - name, email, phone
  - student count
- Search and sort.
- Create/edit/delete parent from the same page (modal-based UI).

## How It Works (Technical)
- Query:
  - `StudentParent::withCount('students')` with optional search and sorting.
- Token generation:
  - creates `unique_access_token` (UUID) for Parent Portal access when a parent is created.

