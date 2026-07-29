# How-To Guide: Coach Management & Monthly Payroll

This guide explains how to add coaches, manage dual-role staff members who teach, generate monthly session-based payroll, and mark payments as completed.

---

## 📊 Payroll Process Flowchart

```mermaid
graph TD
    A[Coaches Conduct Classes & Attendance Saved] --> B[Generate Monthly Payroll]
    B --> C[System Scans Delivered Sessions]
    C --> D[Pay Calculated: Sessions x Package Coach Rate per Session]
    D --> E[Payroll Generated in Pending Status]
    E --> F[Management Reviews Session Breakdown]
    F --> G[Click Approve Payroll]
    G --> H[Disburse Bank Payment]
    H --> I[Click Mark as Paid]
```

---

## 📋 Dual-Role Coach Capabilities

Some administrators or operations staff members also teach classes. The system natively handles **Dual-Role Staff**:

| User Type | Primary Role | Coach Capabilities | Where They Appear |
| :--- | :--- | :--- | :--- |
| **Dedicated Coach** | `Coach` | Teaches classes & earns session pay | Coach Portal, Class Selectors, Payroll |
| **Dual-Role Admin** | `Admin` | Admins system AND teaches classes (`is_coach = true`) | Admin Portal, Class Selectors, Session Payroll |
| **Operations Staff** | `Ops` | Manages ops AND teaches classes (`is_coach = true`) | Admin Portal, Class Selectors, Session Payroll |

---

## 📝 Step-by-Step Instructions

### Step 1: Adding a Coach or Enabling Dual-Role

1. Go to **Users / Staff** or **Coaches** in the main sidebar.
2. **Dedicated Coach**: Click **"+ Add Coach"**, enter profile, contact details, bank info, and hourly rate (e.g. `RM 60.00/hr`).
3. **Dual-Role Staff**: Click **Edit** on an existing Admin or Ops staff member, check **☑ "Also acts as a Coach"**, and set their Hourly Rate.
4. Click **"Save"**. Dual-role users can switch seamlessly between Admin View and Coach View using the top header button!

---

### Step 2: Generating Monthly Payroll

1. Go to **Payrolls** in the main sidebar.
2. Click **"Generate Monthly Payroll"**.
3. Select the billing **Month & Year** (e.g. `July 2026`).
4. Click **"Run Payroll Calculation"**.
5. The system scans all delivered sessions for every coach (including dual-role coaches) and calculates:  
   `Total Pay = Delivered Sessions × Package Coach Rate per Session`

---

### Step 3: Reviewing & Approving Payroll

1. Click **View** on any pending payroll record.
2. Review the list of delivered class sessions, dates, student counts, and substitute session credits.
3. Click **"Approve Payroll"**. Status changes to `Approved`.
4. Perform bank transfer or disbursement.
5. Click **"Mark as Paid"**. Status updates to `Paid` with timestamp and reference ID.

> [!IMPORTANT]
> Coach payroll is calculated strictly on **actual delivered sessions** using the **Package's coach rate per session**, ensuring payroll is 100% decoupled from student discounts or invoice adjustments!
