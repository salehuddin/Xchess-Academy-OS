# UAT — Non-Functional & Edge-Case Tests

> Part of the [X Chess Academy OS UAT Plan](../UAT.md) · Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ⬜ Not Run

| ID | Category | Test Case | Expected Result | Status | Notes |
| :--- | :--- | :--- | :--- | :---: | :--- |
| NFR-01 | Scheduler | Verify cron/schedule worker runs all jobs (`notifications:run` 09:00, `notifications:prune` 02:00, `attendance:remind-pending` 18:00, `invoices:generate-monthly` 1st 00:00, `payroll:generate-monthly` 1st 00:30) | All commands fire on schedule (check `schedule:list` + logs) | ⬜ | |
| NFR-02 | Idempotency | Re-run `invoices:generate-monthly` and `payroll:generate-monthly` for the same month | No duplicates created | ⬜ | |
| NFR-03 | Invoice math | Invoice with base 250, discount 50, charge 30, credit 20 | Total = 210 (base − discount + charge − credit), 2 decimals, never negative | ⬜ | |
| NFR-04 | Webhook idempotency | POST the same Chip `paid` webhook payload twice | Invoice marked Paid once; only one Payment record | ⬜ | |
| NFR-05 | Webhook security | POST a forged/unauthenticated `paid` webhook for a Pending invoice | Endpoint should reject unauthenticated events — **log current behavior as a security defect if accepted** | ⬜ | HMAC-SHA256 signature validation implemented (`Signature`/`X-Signature` header vs `chip_webhook_secret`); forged → 401, unconfigured secret → 503. Covered by `ChipPaymentTest` |
| NFR-06 | Email delivery | Trigger invoice-sent, magic-link, and verification emails | All delivered with correct links; links work once / within policy | ⬜ | |
| NFR-07 | PDF rendering | Download invoice + receipt PDFs on mobile & desktop | Valid PDFs, correct branding, amounts match, no layout breakage | ⬜ | |
| NFR-08 | Rate limiting | Exceed limits: `/parent-access` (5/min), verification resend (6/min) | 429 responses with friendly messages | ⬜ | |
| NFR-09 | Session security | Idle > session lifetime → click any admin link | Redirected to login; deep-link returns post-login | ⬜ | |
| NFR-10 | Data isolation sweep | As Coach: probe `/admin/*`, other coaches' class/student/payroll URLs | Consistent 403s; no data leakage in error pages | ⬜ | |
| NFR-11 | Performance | Dashboard, Invoices, Students, Schedules pages with seeded data (20 students) | Pages load < 3s; no N+1 style stalls | ⬜ | |
| NFR-12 | Cross-browser | Run one full E2E scenario on Chrome + Firefox + mobile Safari/Chrome | No browser-specific breakage | ⬜ | |
| NFR-13 | Timezone/date integrity | Attendance & sessions across month boundaries | Dates stored/queried consistently; no off-by-one | ⬜ | |
| NFR-14 | Concurrent attendance | Two users save attendance for the same class/date near-simultaneously | Last-write-wins without corruption; no duplicate records | ⬜ | |

---

## Section Result Summary

| Total Cases | Pass | Fail | Blocked | Not Run | Pass Rate |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 14 | | | | | |
