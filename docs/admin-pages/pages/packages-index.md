# Admin Page: Packages (Index)

## Route
- `GET /admin/packages` (`admin.packages.index`)
- Backend: [PackageController@index](app/Http/Controllers/Admin/PackageController.php#L15-L37)
- UI: [Admin/Packages/Index.jsx](resources/js/Pages/Admin/Packages/Index.jsx)

## Features
- Package listing with:
  - class count
  - search by title
  - sort by selected column
- Inline create/update/delete actions.

## How It Works (Technical)
- Query:
  - `Package::withCount('classes')`
  - optional search + sort, default latest
- Delete is blocked if a package has associated classes.

