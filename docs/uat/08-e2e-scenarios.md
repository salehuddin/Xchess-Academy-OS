# UAT — End-to-End Cross-Role Scenarios

> Part of the [X Chess Academy OS UAT Plan](../UAT.md) · Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ⬜ Not Run

These validate the full business cycle across roles. Run them **in order**, on fresh demo data.

## E2E-01 — New Student Full Month Cycle

| Step | Role | Action | Verify |
| :--- | :--- | :--- | :--- |
| 1 | Ops/Admin | Onboard parent + student (single create, new parent) | Parent & student created; portal token works |
| 2 | Admin | Create/confirm package, room, class (day, time, coach) → enroll student | Student on roster |
| 3 | Admin/Ops | Schedule generator → generate next month (exclude public holidays) | Correct dates; excluded dates absent |
| 4 | Coach | Take attendance for the first session (+ topic/notes) | Attendance saved; session delivered |
| 5 | Finance/Admin | Run `invoices:generate-monthly` → add a credit adjustment → **Send Invoice** | Draft → Pending; parent emailed |
| 6 | Parent | Open portal → view invoice → pay via Chip sandbox | Webhook → **Paid** |
| 7 | Parent | Download official receipt PDF | Receipt with transaction reference |
| 8 | Finance/Admin | Run `payroll:generate-monthly` → approve → mark paid | Coach payroll = delivered sessions × rate |
| 9 | Admin | Activity logs | Full audit trail of steps 1–8 |

**Status:** ⬜ Pass / ❌ Fail — Notes: `____________________`

## E2E-02 — Carry-Forward Credit Cycle

| Step | Role | Action | Verify |
| :--- | :--- | :--- | :--- |
| 1 | Finance | Record a **credit** (e.g. cancelled class refund) "for next month" on a student | Pending adjustment stored |
| 2 | Admin | Run `invoices:generate-monthly` for the next month | Credit appears as an itemized line; total reduced; adjustment now `applied` |
| 3 | Admin | Run generation **again** | No double-count — adjustment never reused |
| 4 | Finance | Send invoice → parent pays | Correct final amount collected |

**Status:** ⬜ Pass / ❌ Fail — Notes: `____________________`

## E2E-03 — Overdue Invoice Lifecycle

| Step | Role | Action | Verify |
| :--- | :--- | :--- | :--- |
| 1 | Finance | Send an invoice with a past/near due date | Pending |
| 2 | Admin | Advance system date past due (or run `notifications:run`) | Invoice → **Overdue**; parent notified; admin/finance overdue summary notification |
| 3 | Parent | Pay the overdue invoice via Chip | Status → Paid; receipt available |

**Status:** ⬜ Pass / ❌ Fail — Notes: `____________________`

## E2E-04 — Substitute Coach Cycle

| Step | Role | Action | Verify |
| :--- | :--- | :--- | :--- |
| 1 | Admin | Assign Coach B to a specific session (session-level coach) | Session coach = Coach B |
| 2 | Coach B | Open that class/date → take attendance | Authorized; attendance saved under Coach B |
| 3 | Parent | Open portal schedule for that date | **Coach B** (substitute) shown as the session coach |
| 4 | Admin | Generate payroll | Session counted for **Coach B**'s payroll, not Coach A |

**Status:** ⬜ Pass / ❌ Fail — Notes: `____________________`

## E2E-05 — Bulk Onboarding & Status Management

| Step | Role | Action | Verify |
| :--- | :--- | :--- | :--- |
| 1 | Ops/Admin | Bulk-create 5 students across 2 parents (one existing, one new) | All created; no duplicate parents |
| 2 | Admin | Bulk-set status `Inactive` on 3 students | Status updated; students drop from new attendance rosters |
| 3 | Admin | Enroll the remaining 2 students into a class → generate schedule | Both appear in rosters and schedules |

**Status:** ⬜ Pass / ❌ Fail — Notes: `____________________`

---

## Section Result Summary

| Total Scenarios | Pass | Fail | Blocked | Not Run | Pass Rate |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 5 | | | | | |
