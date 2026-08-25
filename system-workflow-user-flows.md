# X Chess Academy: System Workflow & User Flows

This document details the end-to-end processing of entities within the management system, categorized by functional lifecycles.

## 1. Student Onboarding & Matching Flow

Primary Actor: Ops

Lead Capture (External): Parent fills out an external form (e.g., Google Forms/Typeform).

Manual Entry: Ops creates a new STUDENT record in the system.

System Action: Generates a unique student_uid (e.g., XCA-1001).

Billing Configuration: Ops assigns a PACKAGE and any Recurring Discounts (e.g., 10% Sibling Discount).

Coach Matching: Ops filters USERS (Coaches) by preferred_levels and availability_slots.

Schedule Assignment: Ops creates a CLASS_SCHEDULE and assigns a ROOM.

Safeguard: System checks if the ROOM is already occupied at that specific start_time.

Initial Invoice: System auto-calculates proration for the first month and saves it as a Draft INVOICE.

## 2. Attendance & Absence Flow

Primary Actors: Coach, Ops

Session Delivery: Coach conducts the class and marks the CLASS_SCHEDULE as is_delivered.

Attendance Logging: Coach (or Ops) logs ATTENDANCE for each student.

Absence Management: If a student is absent, the reason is logged.

Ops Action: If the absence qualifies for a discount (e.g., "With Notice"), Ops toggles the manual_discount_pending flag on that specific attendance record.

Reconciliation Bridge: This flag serves as a visual reminder for Finance during the next billing cycle.

## 3. Financial & Invoicing Flow

Primary Actor: Finance

Monthly Batch Generation (System): On a set date, the system generates Draft INVOICES for all active students for the upcoming month. Any pending carry-forward adjustments (refund credits or additional charges recorded against the student) are automatically folded into the new Draft's total and marked applied (never reused).

Audit & Review: Finance reviews the Drafts. They check the previous month's ATTENDANCE for manual_discount_pending flags.

Manual Adjustments: Finance adds itemized adjustment line items to the Draft invoice:
- **Credit** — reduces the total (e.g. refund for a missed class, sibling allowance).
- **Charge** — increases the total (e.g. additional fee, surcharge).
Each line item has an amount and reason. The total is recomputed as `base + tax − recurring discount + charges − credits` (clamped ≥ 0). Adjustments are editable only while the invoice is in Draft.

Carry-Forward Adjustments: If a refund or additional fee should reflect on next month's invoice, Finance records it via "Record Adjustment for Next Month". It is stored as pending and auto-applied to the student's next auto-generated Draft invoice on the 1st of the month.

Finance adds finance_remarks (e.g., "Adjusted for absence on Dec 15").

Approval & Notification: Finance clicks the "Send Notification" button.

System Action: Status moves from Draft to Pending. An email/notification is sent to the PARENT with the unique_access_token.

Payment Reconciliation: Parent pays (External/Manual). Finance updates the invoice to Paid.

System Action: Sends an automated receipt to the Parent.

## 4. Coach Payroll Flow

Primary Actor: Finance

Session Aggregation: At month-end, the system looks at distinct delivered `(class_id, attendance_date)` session pairs for each coach's classes.

Payroll Drafting: System calculates each session using `packages.coach_rate_per_session`, stores the summed total and average rate, and snapshots the session line items.

Review: Finance reviews the COACH_PAYROLL draft, session breakdown, and activity trail. Admins may edit Draft totals; the edit is logged.

Processing: Finance marks payroll as Processed, then marks it Paid after disbursement. Generation and status changes are recorded in the payroll activity log. This is independent of whether students received discounts or paid their invoices.

## 5. Task Management Flow

Primary Actor: All Admin Roles

Contextual Creation: While reviewing an invoice or student, a user clicks "Add Task."

System Action: Automatically links the task to that entity_id.

Department Assignment: User assigns the task to Ops or Finance.

Execution: The assigned department sees the task on their Task Dashboard or as a "Red Flag" on the student's profile.

Resolution: User marks task as Done.

Audit Action: The AUDIT_LOG records who finished the task and when.

## 6. Audit & Transparency Flow

Primary Actor: System (Automatic)

Trigger: Any user creates, edits, or deletes data (e.g., changing a student's level or adjusting an invoice).

Log Creation: System creates an AUDIT_LOG entry.

Snapshot: The log stores the old_values and new_values as JSON, ensuring that if a manual adjustment is questioned later, Finance can see exactly what the previous balance was.
