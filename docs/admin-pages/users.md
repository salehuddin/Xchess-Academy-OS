# Admin Page: Users & Staff Management

## Routes & Access
- Base prefix: `/admin/users/*`
- Routes:
  - `GET /admin/users` (`admin.users.index`)
  - `POST /admin/users` (`admin.users.store`)
  - `PUT /admin/users/{user}` (`admin.users.update`)
  - `DELETE /admin/users/{user}` (`admin.users.destroy`)
- Access: `auth` + `role:Admin` + `UserPolicy`
- Backend controller: [Admin/UserController](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/UserController.php)

## UI Component
- Page: [Admin/Users/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Users/Index.jsx)

## Features Built

### 1. User & Staff CRUD
- **User Creation**: Admin can register new users with full name, email, password, primary role (`Admin`, `Ops`, `Finance`, `Coach`), hourly rate, and dual-role coach flag.
- **User Editing**: Update name, email, optional password reset, primary role, hourly rate, and dual-role coach status.
- **User Deletion**: Admin can delete staff accounts with self-deletion protection.

### 2. Dual-Role Admin & Coach Capabilities
- **`is_coach` Flag**: Allows Admins, Ops, or Finance staff who also teach classes to have dual-role capabilities.
- **Auto-linking `CoachProfile`**: Enabling `is_coach` automatically creates/links a `CoachProfile` record for hourly rates and availability.
- **`User::coaches()` Query Scope**: Dual-role users automatically appear in class assignment dropdowns, attendance tracking, and session-based monthly payroll.
- **Header Portal Switcher**: Top header bar displays **"Switch to Coach View" ↔ "Switch to Admin View"** for dual-role users.

### 3. UI Layout & Search Filters
- Standardized HeroUI table structure matching Students & Coaches pages.
- Real-time search by name or email, role dropdown filter, and customizable rows per page.
- Role badges (`Admin`, `Ops`, `Finance`, `Coach`) plus secondary `+ Coach` chip for dual-role staff.

## Technical Specs
- Policy: [UserPolicy.php](file:///c:/laragon/www/xchess-academy-os/app/Policies/UserPolicy.php)
- Migration: [2026_07_25_235000_add_is_coach_to_users_table.php](file:///c:/laragon/www/xchess-academy-os/database/migrations/2026_07_25_235000_add_is_coach_to_users_table.php)
- Feature Tests: [UserManagementTest.php](file:///c:/laragon/www/xchess-academy-os/tests/Feature/Admin/UserManagementTest.php) & [DualRoleUserTest.php](file:///c:/laragon/www/xchess-academy-os/tests/Feature/Admin/DualRoleUserTest.php)
