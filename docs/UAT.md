# User Acceptance Testing (UAT) — X Chess Academy OS

This is the master plan for **User Acceptance Testing** of X Chess Academy OS. It covers **every user perspective** in the system — Admin, Ops, Finance, Coach, and Parent (plus the Student as a data entity) — with role-based user flows, step-by-step test cases, negative/access-control tests, end-to-end cross-role scenarios, and sign-off criteria.

The plan is split into **one file per section** under [`docs/uat/`](uat/) so each area can be edited and tracked independently:

| # | File | Section | Test Cases |
| :--- | :--- | :--- | :---: |
| 01 | [`01-auth-access-control.md`](uat/01-auth-access-control.md) | Section A — Authentication & Access Control (all staff) | 31 |
| 02 | [`02-admin.md`](uat/02-admin.md) | Section B — Admin | 88 |
| 03 | [`03-ops.md`](uat/03-ops.md) | Section C — Ops (Operations Staff) | 13 |
| 04 | [`04-finance.md`](uat/04-finance.md) | Section D — Finance | 20 |
| 05 | [`05-coach.md`](uat/05-coach.md) | Section E — Coach | 20 |
| 06 | [`06-parent-portal.md`](uat/06-parent-portal.md) | Section F — Parent (Parent Portal) | 21 |
| 07 | [`07-student.md`](uat/07-student.md) | Section G — Student (Observed Entity) | 7 |
| 08 | [`08-e2e-scenarios.md`](uat/08-e2e-scenarios.md) | End-to-End Cross-Role Scenarios | 5 |
| 09 | [`09-non-functional.md`](uat/09-non-functional.md) | Non-Functional & Edge-Case Tests | 14 |
| 10 | [`10-defect-log.md`](uat/10-defect-log.md) | Defect Log | — |
| 11 | [`11-sign-off.md`](uat/11-sign-off.md) | Test Result Summary & Sign-Off | — |
| | | **Total** | **219** |

> **Related documentation**
> - Demo accounts & portal tokens: [`docs/demo-accounts.md`](demo-accounts.md)
> - Workflow how-to guides: [`docs/workflows/`](workflows/) (01–06)
> - Admin page reference: [`docs/admin-pages/`](admin-pages/)
> - Product spec: [`PRD.md`](../PRD.md) · Data model: [`ERD.md`](../ERD.md) · Task tracker: [`TASKS.md`](../TASKS.md)

---

## 1. Scope & Objectives

**In scope**

- All staff portals: Admin panel (`/admin/*`), Coach portal (`/coach/*`), shared dashboard, notification center, profile management.
- The public Parent Portal (`/portal/{token}`) and magic-link access flow (`/parent-access`).
- All business flows: onboarding, classes & scheduling, attendance, invoicing & adjustments, Chip online payments, payroll, notifications, announcements, tasks, reports, settings, and logs.
- Role-based access control (positive **and** negative tests) and coach data isolation.
- Scheduled/automated jobs (monthly invoices, monthly payroll, notification runs, attendance reminders).

**Out of scope**

- Unit/feature automated tests (covered by the Pest test suite).
- Infrastructure/penetration testing beyond the basic security checks listed in the [Non-Functional tests](uat/09-non-functional.md).
- Third-party provider console behavior (Chip dashboard, WhatsApp provider dashboards) — only the integration points are tested.

**Objectives**

1. Verify every user role can complete their documented workflows end-to-end.
2. Verify actual behavior matches the **Staff Role Permissions Matrix** (Section 4.2).
3. Verify data isolation (coaches only see their own classes/students/payroll; parents only see their own children/invoices).
4. Surface and log defects with severity before release sign-off.

---

## 2. Test Environment & Data

### 2.1 Prerequisites

| Item | Requirement |
| :--- | :--- |
| Environment | Staging/UAT environment running the latest build (seeded, not production data) |
| Scheduler | Laravel scheduler running (`php artisan schedule:work` or server cron) |
| Mail | SMTP configured & testable (Settings → Email/SMTP), or a mail catcher (e.g. Mailpit) |
| Chip | Sandbox brand ID + API key configured (Settings → Chip Payment) |
| Browser | Chrome/Edge/Firefox desktop **and** a mobile device or dev-tools emulation (Coach & Parent portals are mobile-first) |

### 2.2 Demo Data

Seed with `ProductionDemoSeeder` (idempotent, safe to re-run):

```
php artisan db:seed --class=ProductionDemoSeeder --force
```

- **Staff password (all logins):** `Password123!`
- 2 Admins, 3 Ops officers, 3 Finance executives, 6 Coaches
- 15 Parents (token URLs: `{APP_URL}/portal/demo-parent-1` … `demo-parent-15`)
- 20 Students (`STU-1001` … `STU-1020`)

Full account list: [`docs/demo-accounts.md`](demo-accounts.md).

> [!TIP]
> Seeded parent emails are `@example.com` (non-deliverable). For magic-link tests, use the **token URLs** or create a real parent with a mailbox you control.

---

## 3. Test Conventions

### 3.1 Test Case Format

Every test case has a unique ID (`AUTH-01`, `ADM-14`, `PAR-07`, …). Execute the **Steps**, compare against the **Expected Result**, and mark the **Status**.

### 3.2 Status Legend

| Status | Meaning |
| :--- | :--- |
| ✅ **Pass** | Actual result matches the expected result |
| ❌ **Fail** | Actual result does not match — **log a defect** in the [Defect Log](uat/10-defect-log.md) |
| ⚠️ **Blocked** | Cannot execute (missing data, environment issue) — note why |
| ⬜ **Not Run** | Not executed yet |

### 3.3 Defect Severity

| Severity | Definition |
| :--- | :--- |
| 🔴 **Critical** | Data loss, wrong money math, security breach, core flow unusable |
| 🟠 **Major** | Key feature broken, no acceptable workaround |
| 🟡 **Minor** | Non-core feature broken or inconvenient workaround exists |
| 🔵 **Cosmetic** | UI/text/layout issues, no functional impact |

### 3.4 Entry Criteria

- Build deployed to the UAT environment with migrations run and demo data seeded.
- SMTP, Chip sandbox, and scheduler prerequisites met (Section 2.1).

### 3.5 Exit Criteria (Sign-off)

- **100%** of Critical/Major test cases **Pass**.
- ≥ **95%** of all test cases Pass, with all remaining failures logged and triaged.
- No open Critical defects; open Minor/Cosmetic defects have an agreed fix plan.
- [Sign-off table](uat/11-sign-off.md) completed by all testers.

---

## 4. Role Overview & Coverage Matrix

### 4.1 Role Overview

| Role | How they log in | What they do |
| :--- | :--- | :--- |
| **Admin** | `/login` (email + password) → `/dashboard` | Full system authority: users, coaches, students, parents, classes, schedules, attendance, invoices, payroll, reports, tasks, notifications, announcements, rooms, packages, settings, logs |
| **Ops** | `/login` → `/dashboard` | Student & parent onboarding, class setup, schedule generation, attendance, coach matching |
| **Finance** | `/login` → `/dashboard` | Billing, invoice adjustments, payments, payroll approval; student financial context |
| **Coach** | `/login` → auto-redirect to `/coach/dashboard` | Mobile-first portal: today's sessions, my schedule, my classes/students, take attendance, my payroll |
| **Parent** | No password — magic link (`/parent-access`) or unique token URL (`/portal/{token}`) | View child schedule & attendance, view/pay invoices online (Chip), download PDFs |
| **Student** | No login | Data entity — appears in Admin, Coach, and Parent portals |

> **Dual-role staff:** any Admin/Ops/Finance user with the **"Also acts as a Coach"** flag (`is_coach`) appears in coach selectors, can be assigned classes, earns session pay, and (for Admins) sees the Coach menu section.

### 4.2 Staff Role Permissions Matrix (Acceptance Baseline)

This is the documented permissions matrix (source: [`docs/workflows/05-staff-and-settings.md`](workflows/05-staff-and-settings.md)). Access-control tests in [Section A](uat/01-auth-access-control.md), [Section C](uat/03-ops.md), and [Section D](uat/04-finance.md) verify against this matrix.

| Module / Feature | Admin | Ops | Finance | Coach |
| :--- | :---: | :---: | :---: | :---: |
| **Student & Parent Onboarding** | ✅ Full | ✅ Full | 👁️ Read | ❌ No |
| **Classes & Schedule Generator** | ✅ Full | ✅ Full | 👁️ Read | 👁️ Assigned only |
| **Attendance Recording** | ✅ Full | ✅ Full | 👁️ Read | ✅ Assigned only |
| **Invoicing & Finance Adjustments** | ✅ Full | 👁️ Read | ✅ Full | ❌ No |
| **Coach Payroll Approval** | ✅ Full | 👁️ Read | ✅ Full | 👁️ Self only |
| **Company & Service Settings** | ✅ Full | ❌ No | ❌ No | ❌ No |
| **User & Staff Management** | ✅ Full | ❌ No | ❌ No | ❌ No |
| **System & Activity Logs** | ✅ Full | ❌ No | ❌ No | ❌ No |
| **In-App Notifications (own inbox)** | ✅ | ✅ | ✅ | ✅ |

> [!WARNING]
> **Known implementation status (verify & log discrepancies as defects):**
> As of writing, most `/admin/*` routes are guarded by `role:Admin` (Admin-only) and role-specific dashboards for Ops/Finance are still pending — see `TASKS.md` → Phase 4 *"Role-Specific Views"*. The student financial-context pages (`/admin/students/{id}` + adjustments) are explicitly open to **Admin + Finance**. Run the [Ops](uat/03-ops.md) and [Finance](uat/04-finance.md) sections against the matrix above and record every mismatch; closing those gaps is part of acceptance.

### 4.3 Coverage Matrix (who tests what)

| UAT Section | Admin | Ops | Finance | Coach | Parent |
| :--- | :---: | :---: | :---: | :---: | :---: |
| [A — Auth & Access Control](uat/01-auth-access-control.md) | ✅ | ✅ | ✅ | ✅ | ✅ |
| [B — Admin portal features](uat/02-admin.md) | ✅ | — | — | — | — |
| [C — Ops flows](uat/03-ops.md) | — | ✅ | — | — | — |
| [D — Finance flows](uat/04-finance.md) | — | — | ✅ | — | — |
| [E — Coach portal](uat/05-coach.md) | — | — | — | ✅ | — |
| [F — Parent portal](uat/06-parent-portal.md) | — | — | — | — | ✅ |
| [E2E — Cross-role scenarios](uat/08-e2e-scenarios.md) | ✅ | ✅ | ✅ | ✅ | ✅ |
