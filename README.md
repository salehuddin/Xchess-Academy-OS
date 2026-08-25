# X Chess Academy OS

A comprehensive management platform designed for X Chess Academy to streamline student onboarding, class scheduling, session-based coach payroll, and flexible, manual-first billing workflows.

Built with **Laravel 12** and **React (Inertia.js)**, utilizing **Hero UI** for a modern, accessible interface.

## 🚀 Technology Stack

- **Framework:** [Laravel 12](https://laravel.com)
- **Frontend:** [React 18](https://react.dev) with [Inertia.js v2](https://inertiajs.com)
- **UI Component Library:** [Hero UI](https://www.heroui.com) (formerly NextUI)
- **Styling:** [Tailwind CSS v3](https://tailwindcss.com)
- **Database:** MySQL 8.0+
- **Authentication:** Laravel Breeze (Session-based)
- **Authorization:** Role-based Access Control (Admin, Ops, Finance, Coach)

## ✨ Key Features

### 👥 Student & User Management
- **Role-Based Access:** Granular permissions for Admins, Operations, Finance, and Coaches.
- **Student Onboarding:** Detailed profiles with parent association and recurring discount settings.
- **Parent Management:** Dedicated portal for managing parent details and viewing associated students.
- **Matching:** Tools to match student skill levels with coach specialties.

### 📅 Scheduling & Facilities
- **Class Management:** Organize classes by packages and assign coaches.
- **Room Conflict Prevention:** Logic to prevent double-booking of physical rooms.
- **Attendance Tracking:** Session-based attendance logging with flags for missed classes (requiring financial adjustment).

### 💰 Finance & Invoicing
- **Manual-First Billing:** Monthly invoices generated as "Drafts" for manual review.
- **Adjustment Workflow:** Ops/Finance manually apply discounts for missed sessions before finalizing.
- **Controlled Notifications:** Invoices are only sent to parents after manual verification ("Send Invoice" trigger).
- **Payment Integration:** Ready for Chip-in Payment Gateway integration.

### 💼 Coach Payroll
- **Session-Based Pay:** Payroll calculated strictly from delivered sessions and each package's coach rate per session.
- **Independent Logic:** Coach pay is decoupled from student billing adjustments.
- **Transparent Details:** Saved session breakdowns and activity trails explain each payroll amount and status change.
- **Admin Controls:** Admins can edit Draft payroll totals; Processed and Paid payrolls are locked.

### ✅ Task Management & Auditing
- **Contextual Tasks:** Create tasks linked directly to specific Students or Invoices.
- **Audit Logs:** Comprehensive tracking of all critical actions via `spatie/laravel-activitylog`.

## 🛠️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-org/xchess-academy-os.git
    cd xchess-academy-os
    ```

2.  **Install Backend Dependencies**
    ```bash
    composer install
    ```

3.  **Install Frontend Dependencies**
    ```bash
    npm install
    ```

4.  **Environment Configuration**
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```
    *Configure your database credentials in the `.env` file.*

5.  **Database Migration & Seeding**
    ```bash
    php artisan migrate --seed
    ```
    *This will set up the database schema and populate default roles/users.*

6.  **Build Frontend Assets**
    ```bash
    npm run build
    ```

7.  **Run the Application**
    ```bash
    php artisan serve
    ```
    *The application will be available at `http://localhost:8000`.*

## 📂 Project Structure

- **`app/Models`**: Eloquent models (Student, Invoice, ClassSchedule, etc.).
- **`app/Http/Controllers`**: Backend logic, organized by domain (Admin, Profile, etc.).
- **`resources/js/Pages`**: React views for Inertia.js.
- **`resources/js/Components`**: Reusable Hero UI components.
- **`routes/web.php`**: Application routes defined with middleware groups.

## 🤝 Contribution

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📝 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
