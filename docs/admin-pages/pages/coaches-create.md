# Admin Page: Coaches (Create)

## Route
- `GET /admin/coaches/create` (`admin.coaches.create`)
- `POST /admin/coaches` (`admin.coaches.store`)
- Backend: [CoachController@create/store](app/Http/Controllers/Admin/CoachController.php#L49-L94)
- UI: [Admin/Coaches/Create.jsx](resources/js/Pages/Admin/Coaches/Create.jsx)

## Features
- Create a coach (user + coach profile) in one form.
- Captures:
  - login credentials (email + password)
  - personal details (NRIC, phone)
  - bank details
  - level + profile compensation details
  - availability (JSON array)

## How It Works (Technical)
- Validates required fields: name/email/password; optional fields for profile.
- Creates records in a DB transaction:
  - `users` row with `role=Coach` and hashed password (`Hash::make`)
  - `coach_profiles` row linked by `user_id`
