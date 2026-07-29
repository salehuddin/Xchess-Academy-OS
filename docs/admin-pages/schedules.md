# Admin Page: Schedules (Generator)

## Routes & Access
- Base prefix: `/admin/schedules/*`
- Routes:
  - `GET /admin/schedules` → redirects to generator
  - `GET /admin/schedules/generator` (`admin.schedules.generator`)
  - `POST /admin/schedules/preview` (`admin.schedules.preview`) (JSON)
  - `POST /admin/schedules/generate` (`admin.schedules.store`)
  - `POST /admin/schedules/preview-clear` (`admin.schedules.preview-clear`) (JSON)
  - `POST /admin/schedules/clear` (`admin.schedules.clear`)
- Access: `auth` + `role:Admin`
- Backend controller: [Admin/ScheduleController](app/Http/Controllers/Admin/ScheduleController.php)

## UI
- Page: [Admin/Schedules/Generator.jsx](resources/js/Pages/Admin/Schedules/Generator.jsx)

## Features Built
### Schedule Preview (Calendar Busy Days)
- Inputs:
  - month (`YYYY-MM`)
  - optional package filter (one or more package IDs)
- Output:
  - list of dates with the number of classes scheduled that day
  - up to 5 class names per date (payload protection)
- Backend: [preview](app/Http/Controllers/Admin/ScheduleController.php#L34-L83)

### Generate Monthly Schedules (Persist to classes.schedules)
- Writes per-class `classes.schedules` JSON array for the selected month.
- Supports:
  - excluding dates (academy closed)
  - package filter
  - session count limit based on `package.sessions_per_month` (or `class.sessions_per_month`)
- Backend: [store](app/Http/Controllers/Admin/ScheduleController.php#L85-L149)

### Clear Monthly Schedules (with Protection)
- Preview Clear shows:
  - total schedules in month
  - how many are protected (cannot be deleted)
  - how many are deletable
- A schedule date is “protected” if there is:
  - `attendances` on that date for that class, or
  - `class_sessions` on that date for that class
- Backend:
  - [previewClear](app/Http/Controllers/Admin/ScheduleController.php#L176-L240)
  - [clear](app/Http/Controllers/Admin/ScheduleController.php#L242-L312)

## Technical Specs
### Schedule Date Generation
- `getPotentialDatesForClass()`:
  - uses `class.day` (e.g., Monday) to find weekly occurrences in a month
  - outputs `YYYY-MM-DD` strings
- Excluded dates are removed via a lookup map.
- Resulting month dates are merged into existing schedules, removing only the regenerated month before writing.

### Persistence Format
- Stored in `classes.schedules` as a sorted unique list of date strings.
- Class model casts `schedules` to array: [ChessClass.php](app/Models/ChessClass.php#L21-L25)

## Notes / Constraints
- Generator does not validate room conflicts across classes during generation (conflict checks exist in Class create/update by room/day/time).
