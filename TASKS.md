# X Chess Academy OS — Task Tracker

This file tracks implementation progress based on the revised `techincal-implementation-plan.md` and ongoing UI modernization efforts.

## 🚀 Current Focus: UI Modernization (Hero UI) & DX

**Developer Experience & Config**
- [x] Install Laravel Boost (AI Context)
- [x] Create Project README.md
- [x] Configure Tailwind CSS for Hero UI Theme
- [x] Wrap Application in `HeroUIProvider`

**Page Migration Status**
- [x] **Auth Pages**: Login, Register, Forgot Password, Reset Password, Verify Email
- [x] **Profile**: Edit Profile, Welcome Page
- [x] **Layout**: Authenticated Sidebar (Links & Icons)
- [x] **Students**: Create & Edit Forms (Standardized Labels, Inputs, Validation)
- [x] **Parents**: CRUD, Sidebar Link, Reusable Modal Integration
- [ ] **Students**: Refactor Index (Search Theme) & Show (Tables)
- [ ] **Classes**: Verify & Standardize Create/Edit/Index/Show
- [ ] **Users**: Verify & Standardize Index/Management
- [ ] **Invoices**: Verify & Standardize Index/Show
- [ ] **Payrolls**: Verify & Standardize Index
- [ ] **Attendance**: Verify & Standardize Index/Show
- [ ] **Other Modules**: Packages, Rooms, Tasks, Reports, Payments

---

## Phase 1: Data Modeling & Schema Refinement
*Goal: Ensure database layer is rock-solid before complex logic is built.*

- [x] **Initial Migrations Created** (Students, Parents, Coaches, Rooms, Classes, Invoices, Payrolls)
- [ ] **Review & Finalize Student/Parent Models**: Check fields (`student_uid`, `recurring_discount`) & Relations (`parents`, `invoices`, `classes`)
- [ ] **Review & Finalize Class/Schedule/Room Models**: Check fields (`capacity`, `room_id`) & Relations (`schedules`, `attendances`)
- [ ] **Review & Finalize Invoice/Payment Models**: Check fields (`manual_adjustment`, `status`, `notification_sent`) & Relations
- [ ] **Review & Finalize Payroll Models**: Check fields (`sessions_delivered`, `hourly_rate`) & Relations
- [ ] **Review & Finalize Task/Audit Models**: Check polymorphic relations and activity logging setup

## Phase 2: Core Business Logic & CRUD
*Goal: Implement the operational "brain" of the system.*

- [x] **Authentication**: Routes, Session Flow, Basic Roles
- [x] **Student Registry Logic**: Onboarding flow & parent linking
- [x] **Scheduling Logic**: Room conflict validation & class creation
- [x] **Attendance Logic**: Logging presence & missed class flags
- [x] **Billing Logic**: Monthly draft generation command & manual adjustment calculations
- [x] **Payroll Logic**: Session-based pay calculation
- [x] **Task Logic**: Basic CRUD for tasks

## Phase 3: Advanced Integrations & Features
*Goal: Add external connectivity and polished output capabilities.*

- [ ] **PDF Invoice Generation**: Integrate `barryvdh/laravel-dompdf`
- [ ] **Advanced Notifications**: 
    - [ ] WhatsApp Integration (Twilio or similar)
    - [ ] Email Notifications (Postmark/SendGrid setup)
    - [ ] Triggers for "Invoice Sent", "Payment Received"
- [ ] **Chip-in Payment Gateway**:
    - [ ] SDK/API Integration
    - [ ] Webhook Handler for Payment Status

## Phase 4: Access Control & System Settings
*Goal: Refine the user experience per role and provide system-wide controls.*

- [x] **Basic Middleware**: Role-based access control (RBAC)
- [ ] **Role-Specific Views**:
    - [ ] **Coach View**: Dashboard & Schedule
    - [ ] **Finance View**: Billing Dashboard & Approval Workflows
    - [ ] **Parent View**: Invoice History & Child Schedule
- [ ] **Robust Admin Settings**:
    - [ ] Global Configuration UI (Tax rates, Invoice dates)
    - [ ] Notification Settings (Toggle Email/WhatsApp)
- [ ] **Authorization Refinement**: Fine-tune Policies/Gates for strict data isolation
