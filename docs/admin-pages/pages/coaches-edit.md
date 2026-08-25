# Admin Page: Coaches (Edit)

## Route
- `GET /admin/coaches/{coach}/edit` (`admin.coaches.edit`)
- `PUT/PATCH /admin/coaches/{coach}` (`admin.coaches.update`)
- Backend: [CoachController@edit/update](app/Http/Controllers/Admin/CoachController.php#L95-L213)
- UI: [Admin/Coaches/Edit.jsx](resources/js/Pages/Admin/Coaches/Edit.jsx)

## Features
- Edit coach user fields (name/email).
- Edit coach profile fields (NRIC/phone/bank/level/availability).

## How It Works (Technical)
- Validates email uniqueness excluding current user: `Rule::unique('users')->ignore($coach->id)`.
- Updates `users` and `coach_profiles` in a DB transaction.
- Uses `updateOrCreate` for coach profile so legacy coaches without a profile can be fixed.
