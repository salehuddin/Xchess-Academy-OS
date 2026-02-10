# Technical Implementation Plan: X Chess Academy OS (Laravel 12 Edition)

This document provides the technical specifications for developers to build the system using the Laravel 12 / React starter kit ecosystem.

## 1. Technology Stack

- **Framework**: Laravel 12 (PHP 8.3+) with the React Starter Kit (Inertia.js / Laravel Breeze).
- **Frontend UI**: Hero UI (formerly NextUI) for modern, accessible React components.
- **Styling**: Tailwind CSS (Integrated with Hero UI).
- **Database**: MySQL 8.0+.
- **State Management**: Inertia.js for seamless server-side to client-side data flow.
- **Payments**: Chip-in Payment Gateway (API & Webhook integration).
- **Audit Logging**: `spatie/laravel-activitylog`.

## 2. Development Phases (Build Order)

Based on the strategic review, the development will proceed in the following 4 distinct stages:

### Phase 1: Data Modeling & Schema Refinement
*Goal: Ensure the database layer is rock-solid before complex logic is built.*

- **Review All Models**: Systematically go through `Student`, `Parent`, `Coach`, `Class`, `Schedule`, `Attendance`, `Invoice`, `Payroll`, `Task`, `Room`, `Package`.
- **Field Verification**: Ensure all necessary fields (e.g., `manual_adjustment`, `recurring_discount`, `student_uid`) exist and have correct data types.
- **Relationship Mapping**: Verify all Eloquent relationships (`hasMany`, `belongsTo`, `belongsToMany`) are correctly defined in Model files.
- **Database Integrity**: Ensure foreign key constraints and indexes are optimized in migrations.

### Phase 2: Core Business Logic & CRUD
*Goal: Implement the operational "brain" of the system.*

- **Student Registry**: Logic for onboarding, parent linking, and discount application.
- **Parent Management**: CRUD for parents, student association, and contact details.
- **Class Scheduling**: Logic for creating classes, assigning coaches, and preventing room conflicts (overlapping times).
- **Attendance Tracking**: Logic for logging presence/absence and flagging "missed with notice" for financial review.
- **Billing Engine**: 
    - Monthly draft invoice generation command.
    - Manual adjustment logic (Ops/Finance applying deductions).
- **Payroll Engine**: Calculation logic for coach pay based on delivered sessions.
- **Task Management**: Logic for creating and updating tasks linked to specific entities.

### Phase 3: Advanced Integrations & Features
*Goal: Add external connectivity and polished output capabilities.*

- **PDF Generation**: Integrate `barryvdh/laravel-dompdf` to generate downloadable invoice PDFs.
- **Notification System**: 
    - WhatsApp & Email integration for parent alerts.
    - Triggers for "Invoice Sent", "Payment Received", "Class Cancelled".
- **Chip-in Payment Gateway**:
    - SDK/API integration for payment processing.
    - Webhook handling for automated status updates (Paid/Failed).

### Phase 4: Access Control & System Settings
*Goal: Refine the user experience per role and provide system-wide controls.*

- **Role-Specific Views**:
    - **Coach View**: Limited dashboard, simple schedule view, payroll history.
    - **Parent View**: (If applicable) Invoice history, child schedule.
    - **Finance View**: Dedicated dashboard for billing and payroll approval.
- **Robust Admin Settings**:
    - Configuration UI for "Invoice Generation Date".
    - Notification preferences (toggle Email/WhatsApp).
    - System-wide variables (default tax rate, etc.).
- **Authorization Refinement**: Fine-tune Policies and Gates to ensure strict data isolation where needed.

## 3. Backend Architecture & Security

- **Authentication**: Laravel Breeze (React) for secure login.
- **Authorization**: Native Laravel Policies and Gates.
- **Audit Logging**: comprehensive history tracking via `spatie/laravel-activitylog`.

## 4. Deployment & Environment

- **Hosting**: Laravel Forge / DigitalOcean.
- **Environment Variables**:
    - `CHIP_IN_ID` & `CHIP_IN_SECRET`
    - `DB_CONNECTION=mysql`
    - `QUEUE_CONNECTION=database`

## 5. Frontend Development Standards

### Form Component Styling (HeroUI)
To ensure a consistent user interface across the admin panel, all form inputs (Create/Edit pages) must adhere to the following standards:
- **Input Style**: Use the default "inside" label style (do NOT use `labelPlacement="outside"`).
- **Placeholders**: Do NOT use placeholders in input fields; let the label serve as the guide.
- **Spacing**: Use `space-y-6` for form containers to ensure adequate vertical separation.
- **Components**: Use HeroUI components (`Input`, `Select`, `Textarea`, `DatePicker`) exclusively.
