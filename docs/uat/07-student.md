# UAT Section G — Student (Observed Entity)

> Part of the [X Chess Academy OS UAT Plan](../UAT.md) · Status legend: ✅ Pass · ❌ Fail · ⚠️ Blocked · ⬜ Not Run

Students never log in. They are accepted through their appearance in each portal:

| ID | Test Case | Steps | Expected Result | Status | Notes |
| :--- | :--- | :--- | :--- | :---: | :--- |
| STU-01 | Student in Admin | Students list & profile | Correct data (UID, NRIC, DOB → computed age in years & months, language, level, status, parent link) | ⬜ | |
| STU-02 | Student in Coach portal | Coach → Students | Only enrolled students; profile scoped to coach's classes | ⬜ | = CCH-05/06 |
| STU-03 | Student in Parent portal | Parent → children | Student name/UID shown; schedule & invoices per child | ⬜ | = PAR-10 |
| STU-04 | Student has no credentials | Confirm students possess no user account/password | Students cannot and do not need to log in | ⬜ | By design |
| STU-05 | Status behavior | Set a student `Inactive`/`Suspended` (ADM-55) | Inactive students excluded from new attendance rosters; behavior documented | ⬜ | Attendance page loads Active + already-recorded students |
| STU-06 | Sibling linking | Two students share one parent (parent1: STU-1001 & STU-1016) | Both children visible in one parent portal; invoices separated per child | ⬜ | |
| STU-07 | Recurring discount | Set `recurring_discount` on a student → generate invoices | Discount applied on every generated invoice | ⬜ | = ADM-81 |

---

## Section Result Summary

| Total Cases | Pass | Fail | Blocked | Not Run | Pass Rate |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 7 | | | | | |
