# Admin Page: Users (Index)

## Route
- `GET /admin/users` (`admin.users.index`)
- Backend: [UserController@index](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/UserController.php#L16-L31)
- UI: [Admin/Users/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Users/Index.jsx)

## Features
- Lists system users (paginated) with: name, email, role, created_at.
- Provides a role selector per user to update role.

## How It Works (Technical)
- Data source:
  - `User::select(['id','name','email','role','created_at'])->orderBy('id')->paginate(20)`
- Roles list is derived from enum cases:
  - [UserRole](file:///c:/laragon/www/xchess-academy-os/app/Enums/UserRole.php)
- Authorization:
  - `viewAny` policy is enforced for listing, `update` policy for role updates: [UserController](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/UserController.php#L16-L46)

