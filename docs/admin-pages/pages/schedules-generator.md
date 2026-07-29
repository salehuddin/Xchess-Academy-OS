# Admin Page: Schedules (Generator)

## Route
- `GET /admin/schedules/generator` (`admin.schedules.generator`)
- Backend: [ScheduleController@generator](app/Http/Controllers/Admin/ScheduleController.php#L25-L32)
- UI: [Admin/Schedules/Generator.jsx](resources/js/Pages/Admin/Schedules/Generator.jsx)

## Features
- Preview monthly schedule load (calendar “busy days”) by month and optional package filter.
- Generate schedules for a month into `classes.schedules` JSON arrays.
- Clear schedules for a month with protection for delivered sessions.

## How It Works (Technical)
- Preview endpoint: `POST /admin/schedules/preview` (`admin.schedules.preview`)
  - builds date counts by calculating weekly occurrences of `class.day` in the month.
- Generate endpoint: `POST /admin/schedules/generate` (`admin.schedules.store`)
  - removes dates in the target month and writes regenerated dates
  - excludes admin-selected closure dates
  - limits sessions by `package.sessions_per_month` (fallback `class.sessions_per_month`)
- Clear endpoint: `POST /admin/schedules/clear` (`admin.schedules.clear`)
  - refuses to remove dates with existing `Attendance` or `ClassSession` in that date range

