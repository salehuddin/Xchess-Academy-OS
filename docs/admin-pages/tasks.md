# Admin Page: Tasks

## Routes & Access
- Base prefix: `/admin/tasks/*`
- Resource routes: `admin.tasks.*` via [web.php](file:///c:/laragon/www/xchess-academy-os/routes/web.php#L33-L84)
- Access: `auth` + `role:Admin`
- Backend controller: [Admin/TaskController](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/TaskController.php)

## UI
- Page: [Admin/Tasks/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Tasks/Index.jsx)

## Features Built
### Task Board (Single Page CRUD)
- List tasks with assigned user.
- Create tasks with:
  - title
  - department (`Ops|Finance|Coaching`)
  - priority (`High|Medium|Low`)
  - assigned user
  - status (`Pending|In Progress|Completed`)
- Update tasks (partial updates supported)
- Delete tasks

## Technical Specs
### Data Model
- Task model: [Task.php](file:///c:/laragon/www/xchess-academy-os/app/Models/Task.php)
- Relations: `Task belongsTo User`

### Backend Mechanics
- Index loads all tasks (no pagination) and all users (id + name):
  - [TaskController@index](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/TaskController.php#L16-L25)
- Store/update uses strict enum-like validation for department/priority/status.

## Notes / Constraints
- No due dates, comments, or notifications tied to tasks in current build.
