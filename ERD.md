# Entity Relationship Diagram (ERD)

This diagram outlines the relationships for the X Chess Academy Management System, prioritizing manual financial adjustments and session-based coach payroll.

erDiagram
    USER ||--o{ CLASS : "coaches"
    USER ||--o{ TASK : "assigns/creates"
    USER ||--o{ AUDIT_LOG : "triggers"
    USER ||--o{ COACH_PAYROLL : "receives"
    USER {
        int id PK
        string name
        string role "Admin, Ops, Finance, Coach"
        string_array preferred_levels
        string_array availability_slots
        boolean is_coach "May teach classes and receive payroll"
    }

    PARENT ||--o{ STUDENT : "manages"
    PARENT {
        int id PK
        string name
        string phone
        string email
        string unique_access_token
    }

    STUDENT ||--o{ ATTENDANCE : "attends"
    STUDENT ||--o{ INVOICE : "billed_to"
    STUDENT ||--o{ INVOICE_ADJUSTMENT : "carries"
    STUDENT {
        int id PK
        string student_uid UK
        string name
        string status "Active, Pending, Suspended"
        string current_level
        decimal recurring_discount "Fixed or % (e.g., Sibling Discount)"
        int parent_id FK
    }

    PACKAGE ||--o{ CLASS : "defines"
    PACKAGE {
        int id PK
        string title
        decimal monthly_fee
        int sessions_per_month
    }

    CLASS ||--o{ CLASS_SCHEDULE : "scheduled_at"
    CLASS ||--o{ STUDENT_CLASS : "enrolled"
    CLASS {
        int id PK
        int coach_id FK
        int package_id FK
    }

    ROOM ||--o{ CLASS_SCHEDULE : "hosts"
    ROOM {
        int id PK
        string name
        int capacity
    }

    CLASS_SCHEDULE ||--o{ ATTENDANCE : "logs"
    CLASS_SCHEDULE {
        int id PK
        int class_id FK
        int room_id FK
        datetime start_time
        datetime end_time
        boolean is_delivered "Marked by coach/ops"
    }

    ATTENDANCE {
        int id PK
        int schedule_id FK
        int student_id FK
        boolean is_present
        string absence_reason "With Notice, No Notice, etc."
        boolean manual_discount_pending "Flag for Ops to review"
    }

    INVOICE ||--o{ PAYMENT : "receives"
    INVOICE ||--o{ INVOICE_ADJUSTMENT : "has"
    INVOICE {
        int id PK
        int student_id FK
        decimal base_amount
        decimal tax_amount
        decimal recurring_discount_val
        decimal manual_adjustment "Net mirror of applied adjustments (charges - credits)"
        decimal total_amount
        string status "Draft, Pending, Paid, Overdue, Partial"
        boolean notification_sent "Manual trigger flag"
        text finance_remarks "Ops/Finance adjustment notes"
        date due_date
        string month_year "e.g. 2026-08"
    }

    INVOICE_ADJUSTMENT {
        int id PK
        int invoice_id FK "null until applied to a draft"
        int student_id FK "carry-forward owner"
        string type "credit, charge"
        decimal amount "always positive"
        text reason "required"
        string status "pending, applied"
        int applied_from_id FK "originating invoice"
        int created_by FK "user who recorded it"
    }

    PAYMENT {
        int id PK
        int invoice_id FK
        decimal amount
        date payment_date
        string payment_method
        string transaction_id
        text notes
    }

    COACH_PAYROLL {
        int id PK
        int coach_id FK
        string month_year "YYYY-MM"
        int total_sessions
        decimal base_rate "Average snapshotted session rate"
        decimal total_amount
        string status "Draft, Processed, Paid"
        datetime generated_at
    }

    COACH_PAYROLL ||--o{ PAYROLL_LINE_ITEM : "contains"
    PAYROLL_LINE_ITEM {
        int id PK
        int payroll_id FK
        int class_id FK "nullable snapshot reference"
        string class_name "snapshot"
        string package_title "snapshot"
        date attendance_date
        decimal rate "snapshotted package coach rate"
    }

    TASK {
        int id PK
        string title
        string department "Ops, Finance, Coaching"
        string status
        string priority
        string related_entity_type
        int related_entity_id
    }

    AUDIT_LOG {
        int id PK
        int user_id FK
        string action
        string entity_type
        int entity_id
        json old_values
        json new_values
        datetime timestamp
    }


Logic Updates

Manual Reconciliation: The manual_discount_pending flag in ATTENDANCE serves as a reminder. Ops/Finance then records itemized adjustment line items (credit or charge) on the INVOICE via INVOICE_ADJUSTMENT. The net (charges − credits) is mirrored into the manual_adjustment field for backwards compatibility. Refunds or additional fees can also be recorded as pending carry-forward adjustments against a STUDENT, which are auto-applied to the next month's generated Draft invoice.

Manual Notification: The INVOICE remains in Draft status even after adjustment. A manual "Send Notification" action must be triggered to change status to Pending and alert the parent.

Room Safeguard: The ROOM entity ensures that physical space is not double-booked during the scheduling process.

Session-Based Pay: COACH_PAYROLL is derived from distinct delivered attendance session pairs for each coach's classes. Each package coach rate is stored as a PAYROLL_LINE_ITEM snapshot, ensuring coaches are paid per session regardless of class size or student discounts.

Payroll Audit: Payroll generation, Draft edits, processing, and payment actions are recorded against COACH_PAYROLL in the Spatie activity log with actor and timestamp information.
