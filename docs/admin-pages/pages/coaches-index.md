# Admin Page: Coaches (Index)

## Route
- `GET /admin/coaches` (`admin.coaches.index`)
- Backend: [CoachController@index](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/CoachController.php#L21-L47)
- UI: [Admin/Coaches/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Coaches/Index.jsx)

## Features
- Paginated list of coaches (users with role Coach or with a coachProfile).
- Search by:
  - user: name, email
  - coach profile: phone, NRIC

## How It Works (Technical)
- Query:
  - `User::with('coachProfile')`
  - filters users where `role=Coach` OR `has coachProfile`
  - optional search using `orWhereHas('coachProfile', ...)`
- Pagination: `paginate(10)->withQueryString()`

