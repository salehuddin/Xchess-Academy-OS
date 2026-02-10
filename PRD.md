# Product Requirements Document (PRD) - X Chess Academy Management System

## 1. Overview

A management platform for X Chess Academy to handle manual student onboarding, session-based coach payroll, and a highly flexible, manual-first billing workflow.

## 2. Operational Workflow Logic

### 2.1 Student Onboarding

Manual Entry: Ops enters student and parent data into the system.

Matching: System provides filters to match student levels with coach specialties and availability.

Discounts: Permanent recurring discounts (e.g., Sibling/Staff) are set on the Student profile.

### 2.2 Billing & Invoicing (Manual Adjustment Model)

Draft Generation: Monthly invoices are generated in Draft status.

Manual Adjustment:

Ops/Finance reviews the previous month's attendance.

If a class was missed (with notice), Finance calculates the discount and enters it into the manual_adjustment field.

Remarks are added to explain the deduction (e.g., "Deduction for 1 missed session on Dec 5").

Manual Notification:

Invoices do not send automatically.

Once the adjustment is finalized, Ops/Finance clicks a "Send Invoice" button.

This triggers the notification to the parent and moves the invoice to Pending.

### 2.3 Coach Payroll

Session-Based: Coaches are paid strictly for the sessions they deliver.

Calculation: Total Pay = (Number of Delivered Sessions) × (Coach Hourly Rate).

Independence: Coach pay is independent of student discounts or invoice adjustments.

## 3 Task Management

Contextual Creation: While reviewing an invoice or student, a user clicks "Add Task."

Departmental Routing: Tasks are assigned to Ops, Finance, or Coaching.

Linked Context: Tasks appear on the global board and within specific Student/Invoice records.

Audit Logs: Every status change or manual adjustment is logged for accountability.

## 4. Facility Management

Room Assignment: Ops assigns each CLASS_SCHEDULE to a ROOM.

Room Conflict Prevention: Every class schedule must be assigned to a ROOM.

Logic: The system will prevent (or warn) if two sessions are assigned to the same room at the same time.

## 5. Notifications

Manual Invoice Sent: Triggered by the "Send" button on an invoice.

Automated Reminders: Sent on the last day of the month only for invoices in Pending status.

Payment Confirmation: Sent automatically once Finance marks an invoice as Paid.

## 6. Blindspots Addressed

Notification Control: Prevents sending incorrect/unadjusted invoices to parents.

Flexible Adjustments: Handles missed classes via manual entry rather than complex credit math.

Coach Protection: Ensures coaches are paid even if the academy chooses to discount a student's fee.
