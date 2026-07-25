# Admin Page: Rooms

## Routes & Access
- Base prefix: `/admin/rooms/*`
- Resource routes: `admin.rooms.*` via [web.php](file:///c:/laragon/www/xchess-academy-os/routes/web.php#L83-L90)
- Schedule view: `GET /admin/rooms/{room}/schedule` (`admin.rooms.schedule`)
- Access: `auth` + `role:Admin`
- Backend controller: [Admin/RoomController](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/RoomController.php)

## UI
- Index: [Admin/Rooms/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Rooms/Index.jsx)
- Schedule: [Admin/Rooms/Schedule.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Rooms/Schedule.jsx)

## Features Built
### Room CRUD
- Create/update/delete rooms.
- Deletes are blocked if room has assigned classes.

### Room Schedule View
- Visual schedule for a specific room with classes and time slots.
- Used for operational planning and conflict inspection.

## Technical Specs
### Conflict Prevention
- Class create/update prevents assigning a room that conflicts on day/time (room_id + day + time overlap) in [ClassController](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/ClassController.php#L124-L175)

### Data Model
- Room model: [Room.php](file:///c:/laragon/www/xchess-academy-os/app/Models/Room.php)
- Class model includes `room_id`: [ChessClass.php](file:///c:/laragon/www/xchess-academy-os/app/Models/ChessClass.php)

## Notes / Constraints
- Room schedule is based on the weekly day/time fields, not month schedule dates.
