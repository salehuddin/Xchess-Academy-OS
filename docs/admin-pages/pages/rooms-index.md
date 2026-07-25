# Admin Page: Rooms (Index)

## Route
- `GET /admin/rooms` (`admin.rooms.index`)
- Backend: [RoomController@index](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/RoomController.php#L18-L55)
- UI: [Admin/Rooms/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Rooms/Index.jsx)

## Features
- Room listing and CRUD.
- Blocks deletion when room has associated classes.
- Links to the room schedule view.

## How It Works (Technical)
- Index query includes `classes_count` to enforce delete constraints.
- Create/update uses validation for room attributes (mode/location/platform).

