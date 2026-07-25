# Coach Portal - Implementation Plan

This document outlines the architecture, page structure, and technical implementation plan for the Coach Portal in X Chess Academy OS.

## 1. Core Principles & Constraints
*   **Role-Based Access:** Coaches can only access data related to the classes they teach and the sessions they are assigned to.
*   **Data Privacy:** Strict exclusion of parent contact info, financial data, invoices, and global student directories.
*   **Mobile-First UX:** Workflows like taking attendance and writing notes must be optimized for mobile devices.
*   **Single Source of Truth:** Rely on the new JSON-based schedules (`classes.schedules`) and the `Attendance` / `ClassSession` models.

---

## 2. Page Structure & Views

### Dashboard (`/coach/dashboard`)
*   **Today's Sessions:** A quick list of sessions for the current day (Time, Room, Class Name, Status: Pending/Submitted).
*   **Quick Actions:** 1-click access to "Open Attendance" or "Write Notes".
*   **Alerts:** Notifications for missing attendance on past sessions or upcoming sessions lacking notes.

### My Schedule (`/coach/schedule`)
*   **Views:** List view of all assigned sessions.
*   **Data Scope:** Generated from class JSON schedules where `coach_id` matches, OR where a `ClassSession` override assigns the coach.
*   **Filters:** By status (Pending/Submitted), by date range.
*   **Actions:** Open Attendance Modal, Add/Edit Session Topic.

### Take Attendance (Reusable Modal)
*   *Reuses the existing HeroUI `AttendanceModal.jsx` with scoping adjustments.*
*   **Student List:** Union of Active students in the class + any student with an existing attendance record for that specific date.
*   **Safeguards:** Cannot submit attendance for future dates.

### My Classes (`/coach/classes`)
*   **List View:** Classes assigned to the coach.
*   **Class Details:** Read-only info (Name, UID, Schedule, Room, Mode, Capacity).
*   **Enrolled Students:** Name, UID, and Status (no contact/billing info).

### My Students (`/coach/students`)
*   **List View:** Distinct list of students enrolled across all of the coach's classes.
*   **Student Details:** Name, UID, Status, and Attendance history *only for the classes taught by this coach*.

### Availability (`/coach/availability`)
*   Manage weekly recurring availability slots.
*   Mark specific dates as unavailable.

### My Payroll (`/coach/payroll`)
*   **Read-Only Summary:** Sessions delivered per month, calculated expected pay based on hourly/session rate.

---

## 3. Technical Implementation Plan

### Phase 1: Security & Architecture Routing (Backend)
1.  **Middleware & Routing:**
    *   Create a route group `prefix('coach')->name('coach.')->middleware(['auth', 'role:Coach'])`.
    *   Set up a new controller namespace: `App\Http\Controllers\Coach\`.
2.  **Authorization (Policies):**
    *   Ensure coaches cannot access `/admin/*` routes.
    *   Create policies for `ChessClass`, `ClassSession`, and `Attendance` to ensure a coach can only read/update records linked to their `coach_id`.

### Phase 2: Core Controllers (Backend)
1.  **`Coach\DashboardController`:**
    *   Fetch today's schedule and pending tasks.
2.  **`Coach\ScheduleController`:**
    *   Adapt the logic from `Admin\AttendanceController@index` to strictly filter by the authenticated user's ID.
3.  **`Coach\AttendanceController`:**
    *   Handle `show` and `store` methods. Ensure backend validation strictly blocks updating attendance for classes the coach doesn't own.
4.  **`Coach\ClassController` & `Coach\StudentController`:**
    *   Read-only endpoints scoped to the coach's assigned IDs.

### Phase 3: UI & Frontend (React / Inertia)
1.  **Layouts:**
    *   Create `CoachLayout.jsx` (or adapt `AuthenticatedLayout.jsx` with a dynamic sidebar based on the user's role).
2.  **Pages (`resources/js/Pages/Coach/*`):**
    *   `Dashboard.jsx`: Stats cards, today's schedule table.
    *   `Schedule/Index.jsx`: List of upcoming/past sessions.
    *   `Classes/Index.jsx` & `Classes/Show.jsx`: Scoped views.
3.  **Component Reusability:**
    *   Refactor/reuse `AttendanceModal.jsx` so it works seamlessly for both Admin and Coach contexts.

### Phase 4: Refinement & Testing
1.  **Mobile Optimization:** Ensure data tables in the Coach views are responsive (using cards for mobile instead of wide tables if necessary).
2.  **Edge Case Testing:**
    *   Coach substituted for a single session (ensure they see it).
    *   Coach removed from a class (ensure they lose access).
    *   Attempting to access Admin URLs as a Coach.

---

## 4. Immediate Next Steps (Execution)
1.  Set up the `/coach` route group and `CoachDashboardController`.
2.  Adjust `AuthenticatedLayout` to show Coach-specific navigation links when the user role is `Coach`.
3.  Build the `Coach/Dashboard.jsx` view.
