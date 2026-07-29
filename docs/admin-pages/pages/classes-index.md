# Admin Page: Classes (Index)

## Route
- `GET /admin/classes` (`admin.classes.index`)
- Backend: [ClassController@index](app/Http/Controllers/Admin/ClassController.php#L24-L58)
- UI: [Admin/Classes/Index.jsx](resources/js/Pages/Admin/Classes/Index.jsx)

## Features
- Paginated list of classes with package/room/coach.
- Search by class UID or name.
- Filters:
  - mode (Online/Physical)
  - status (Active/Pending/Paused/Stopped)

## How It Works (Technical)
- Query:
  - `ChessClass::with(['coach','room','package'])`
  - optional `where` for search and filters
  - `paginate(10)->withQueryString()`

