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
        decimal hourly_rate "Base rate per session delivered"
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

    INVOICE {
        int id PK
        int student_id FK
        decimal base_amount
        decimal tax_amount
        decimal recurring_discount_val
        decimal manual_adjustment "For missed classes/credits"
        decimal total_amount
        string status "Draft, Pending, Paid"
        boolean notification_sent "Manual trigger flag"
        text finance_remarks "Ops/Finance adjustment notes"
    }

    COACH_PAYROLL {
        int id PK
        int coach_id FK
        date month_year
        int sessions_delivered_count
        decimal total_pay
        string status "Draft, Processed"
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

Manual Reconciliation: The manual_discount_pending flag in ATTENDANCE serves as a reminder. Ops/Finance then manually calculates the value and enters it into the manual_adjustment field of the INVOICE.

Manual Notification: The INVOICE remains in Draft status even after adjustment. A manual "Send Notification" action must be triggered to change status to Pending and alert the parent.

Room Safeguard: The ROOM entity ensures that physical space is not double-booked during the scheduling process.

Session-Based Pay: COACH_PAYROLL is derived directly from CLASS_SCHEDULE where is_delivered is true, ensuring coaches are paid per session regardless of class size or student discounts.
