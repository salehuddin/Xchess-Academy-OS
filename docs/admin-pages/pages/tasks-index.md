# Admin Page: Tasks (Index)

## Route
- `GET /admin/tasks` (`admin.tasks.index`)
- Backend: [TaskController@index](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/TaskController.php#L16-L25)
- UI: [Admin/Tasks/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Tasks/Index.jsx)

## Features
- Internal task tracker for Ops/Finance/Coaching.
- Create, update, delete tasks.
- Assign task to a user.

## How It Works (Technical)
- Index loads all tasks with assigned user (no pagination).
- Store/update validates:
  - department: `Ops|Finance|Coaching`
  - priority: `High|Medium|Low`
  - status: `Pending|In Progress|Completed`

