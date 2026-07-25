# Admin Page: Rooms (Schedule)

## Route
- `GET /admin/rooms/{room}/schedule` (`admin.rooms.schedule`)
- Backend: [RoomController@schedule](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/RoomController.php#L57-L120)
- UI: [Admin/Rooms/Schedule.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Rooms/Schedule.jsx)

## Features
- Visual room utilization view:
  - shows classes scheduled in a room by day/time
  - supports operational planning and conflict inspection

## How It Works (Technical)
- Loads the selected room plus classes assigned to the room.
- Uses class weekly day/time fields (not the monthly schedule dates).

