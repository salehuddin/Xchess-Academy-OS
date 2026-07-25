# Admin Page: Coaches

## Routes & Access
- Base prefix: `/admin/coaches/*`
- Resource routes: `admin.coaches.*` via [web.php](file:///c:/laragon/www/xchess-academy-os/routes/web.php)
- Access: `auth` + `role:Admin`
- Backend controller: [Admin/CoachController](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/CoachController.php)

## UI
- Index: [Admin/Coaches/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Coaches/Index.jsx)
- Create: [Admin/Coaches/Create.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Coaches/Create.jsx)
- Edit: [Admin/Coaches/Edit.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Coaches/Edit.jsx)
- Show: [Admin/Coaches/Show.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Coaches/Show.jsx)

## Features Built
### 1. Coach Listing & Query Scope
- Uses `User::coaches()` query scope to fetch any user with:
  - `role = 'Coach'`, OR
  - `is_coach = true` (Dual-role Admins / Staff), OR
  - an existing `CoachProfile` record.

### 2. Dual-Role Admin & Staff Integration
- Admins/Staff flagged with `is_coach = true` automatically receive a linked `CoachProfile` for hourly rates and availability.
- Appear seamlessly in class coach assignment dropdowns, session attendance selectors, and monthly payroll calculation.

### 3. Coach Creation
- Creates:
  - `users` record with role Coach
  - `coach_profiles` record with personal + bank + rate + availability
- Stored in a DB transaction.

### 4. Coach Details View
- Displays profile data, assigned classes, and proof-of-delivery attendance history.

## Technical Specs
- Data Model: [User.php](file:///c:/laragon/www/xchess-academy-os/app/Models/User.php) & [CoachProfile.php](file:///c:/laragon/www/xchess-academy-os/app/Models/CoachProfile.php)
- Query Scope: `User::coaches()`
