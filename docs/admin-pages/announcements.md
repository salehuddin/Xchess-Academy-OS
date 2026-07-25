# Admin Page: Announcements

## Routes & Access
- List/history: `GET /admin/announcements` (`admin.announcements.index`)
- Create: `GET /admin/announcements/create` (`admin.announcements.create`)
- Store: `POST /admin/announcements` (`admin.announcements.store`)
- Show: `GET /admin/announcements/{announcement}` (`admin.announcements.show`)
- Send now: `POST /admin/announcements/{announcement}/send` (`admin.announcements.send`)
- Access: `auth` + `role:Admin`
- Backend controller: [Admin/AnnouncementController](file:///c:/laragon/www/xchess-academy-os/app/Http/Controllers/Admin/AnnouncementController.php)

## UI
- Index/history: [Admin/Announcements/Index.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Announcements/Index.jsx)
- Create: [Admin/Announcements/Create.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Announcements/Create.jsx)
- Show + dispatch history: [Admin/Announcements/Show.jsx](file:///c:/laragon/www/xchess-academy-os/resources/js/Pages/Admin/Announcements/Show.jsx)

## Features Built
### Broadcast Announcement Builder
- Supports channels:
  - Email (title + subject + body)
  - WhatsApp (title + body)
- Supports audiences:
  - All parents
  - Parents of students in a specific class
- Create screen supports “Send now” toggle.

### History
- Announcements index shows:
  - status (`Draft|Sent`)
  - sent_at
  - dispatch count
- Announcement details show per-recipient dispatch rows with:
  - status (`Pending|Sent|Failed|Skipped`)
  - scheduled_for
  - recipient
  - error (if any)

## Technical Specs
### Data Model
- Announcement: [Announcement.php](file:///c:/laragon/www/xchess-academy-os/app/Models/Announcement.php)
- Dispatch log: [AnnouncementDispatch.php](file:///c:/laragon/www/xchess-academy-os/app/Models/AnnouncementDispatch.php)
- Migration: [create_announcements_tables](file:///c:/laragon/www/xchess-academy-os/database/migrations/2026_05_18_000001_create_announcements_tables.php)

### Recipient Resolution
- Recipients are resolved from `parents` table (`StudentParent` model):
  - Email channel requires parent email
  - WhatsApp channel requires parent phone
- Audience “class” filters parents by student enrollment:
  - `parent -> students -> classes` relationship chain
- Engine: [AnnouncementEngine@resolveRecipients](file:///c:/laragon/www/xchess-academy-os/app/Services/Announcements/AnnouncementEngine.php#L79-L119)

### Dispatching & Sending
- Sending creates one dispatch per recipient at `scheduled_for = now()` and immediately sends.
- Deduplication key: `(announcement_id, channel, recipient, scheduled_for)` unique index.
- Engine: [AnnouncementEngine](file:///c:/laragon/www/xchess-academy-os/app/Services/Announcements/AnnouncementEngine.php)

### Template Rendering
- Uses the same renderer class as the notification builder to substitute variables.
- Current context includes:
  - `parent_name`
  - `announcement_title`

## Notes / Constraints
- Announcements are implemented as a separate broadcast module and do not currently flow through the notification builder’s `announcement` trigger type.
