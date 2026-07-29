<?php

use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\AttendanceController;
use App\Http\Controllers\Admin\ClassController;
use App\Http\Controllers\Admin\CoachController;
use App\Http\Controllers\Admin\DocsController;
use App\Http\Controllers\Admin\EnrollmentController;
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\PackageController;
use App\Http\Controllers\Admin\ParentController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\PayrollController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SiteAnnouncementController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\SystemLogController;
use App\Http\Controllers\Admin\TaskController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Portal\AccessLinkController;
use App\Http\Controllers\Portal\ParentPortalController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'index'])->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/parent-access', [AccessLinkController::class, 'create'])->name('parent.access');
    Route::post('/parent-access', [AccessLinkController::class, 'store'])->name('parent.access.store')->middleware('throttle:5,1');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::prefix('admin')->name('admin.')->middleware('role:Admin')->group(function () {
        Route::resource('users', UserController::class)->except(['create', 'edit']);
        Route::put('/users/{user}/role', [UserController::class, 'updateRole'])->name('users.role.update');
        Route::resource('coaches', CoachController::class);
        Route::get('/schedules/generator', [ScheduleController::class, 'generator'])->name('schedules.generator');
        Route::post('/schedules/preview', [ScheduleController::class, 'preview'])->name('schedules.preview');
        Route::post('/schedules/generate', [ScheduleController::class, 'store'])->name('schedules.store');
        Route::post('/schedules/preview-clear', [ScheduleController::class, 'previewClear'])->name('schedules.preview-clear');
        Route::post('/schedules/clear', [ScheduleController::class, 'clear'])->name('schedules.clear');
        Route::get('/schedules', [ScheduleController::class, 'index'])->name('schedules.index');

        Route::post('/classes/{class}/enroll', [EnrollmentController::class, 'store'])->name('classes.enroll');
        Route::delete('/classes/{class}/enroll/{student}', [EnrollmentController::class, 'destroy'])->name('classes.unenroll');
        Route::put('/classes/{class}/schedules', [ClassController::class, 'updateSchedules'])->name('classes.schedules.update');
        Route::resource('classes', ClassController::class);

        Route::get('/attendances', [AttendanceController::class, 'index'])->name('attendances.index');
        Route::get('/attendances/{class}/{date}', [AttendanceController::class, 'show'])->name('attendances.show');
        Route::post('/attendances/{class}/{date}', [AttendanceController::class, 'store'])->name('attendances.store');
        Route::delete('/attendances/{class}/{date}', [AttendanceController::class, 'destroy'])->name('attendances.destroy');

        Route::get('/parents/search', [StudentController::class, 'searchParents'])->name('parents.search');
        Route::get('/parents/{parent}/details', [StudentController::class, 'getParentDetails'])->name('parents.details');
        Route::put('/parents/{parent}', [StudentController::class, 'updateParent'])->name('parents.update-parent');

        Route::get('/students/bulk-create', [StudentController::class, 'bulkCreate'])->name('students.bulk-create');
        Route::post('/students/bulk-store', [StudentController::class, 'bulkStore'])->name('students.bulk-store');
        Route::post('/students/bulk-action', [StudentController::class, 'bulkAction'])->name('students.bulk-action');
        Route::get('/students/{student}/details', [StudentController::class, 'getDetails'])->name('students.details');
        Route::resource('students', StudentController::class);
        Route::resource('parents', ParentController::class);

        Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
        Route::get('/invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show');
        Route::get('/invoices/{invoice}/pdf', [InvoiceController::class, 'downloadPdf'])->name('invoices.pdf');
        Route::put('/invoices/{invoice}', [InvoiceController::class, 'update'])->name('invoices.update');
        Route::post('/invoices/{invoice}/send', [InvoiceController::class, 'send'])->name('invoices.send');

        Route::get('/payrolls', [PayrollController::class, 'index'])->name('payrolls.index');
        Route::put('/payrolls/{payroll}/approve', [PayrollController::class, 'approve'])->name('payrolls.approve');
        Route::put('/payrolls/{payroll}/paid', [PayrollController::class, 'markPaid'])->name('payrolls.paid');

        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');

        Route::resource('tasks', TaskController::class);
        Route::resource('payments', PaymentController::class);
        Route::get('notifications/dispatches', [NotificationController::class, 'dispatches'])->name('notifications.dispatches');
        Route::resource('notifications', NotificationController::class)->except(['show']);
        Route::post('announcements/{announcement}/send', [AnnouncementController::class, 'send'])->name('announcements.send');
        Route::resource('announcements', AnnouncementController::class)->only(['index', 'create', 'store', 'show']);
        Route::resource('site-announcements', SiteAnnouncementController::class)->except(['show']);
        Route::get('docs', [DocsController::class, 'index'])->name('docs.index');
        Route::get('docs/{path}', [DocsController::class, 'show'])->where('path', '.*')->name('docs.show');

        Route::get('/rooms/{room}/schedule', [RoomController::class, 'schedule'])->name('rooms.schedule');
        Route::resource('rooms', RoomController::class);
        Route::resource('packages', PackageController::class);

        // System Settings & Logs
        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::post('/settings/company', [SettingController::class, 'updateCompany'])->name('settings.company.update');
        Route::post('/settings/services', [SettingController::class, 'updateServices'])->name('settings.services.update');
        Route::post('/settings/notifications', [SettingController::class, 'updateNotificationSettings'])->name('settings.notifications.update');
        Route::post('/settings/test-smtp', [SettingController::class, 'testSmtp'])->name('settings.test-smtp');
        Route::post('/settings/test-chip', [SettingController::class, 'testChip'])->name('settings.test-chip');
        Route::post('/settings/test-whatsapp', [SettingController::class, 'testWhatsApp'])->name('settings.test-whatsapp');
        Route::post('/settings/logo', [SettingController::class, 'uploadLogo'])->name('settings.logo.upload');
        Route::delete('/settings/logo', [SettingController::class, 'removeLogo'])->name('settings.logo.remove');

        Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');

        Route::get('/system-logs', [SystemLogController::class, 'index'])->name('system-logs.index');
        Route::delete('/system-logs', [SystemLogController::class, 'clear'])->name('system-logs.clear');
    });

    Route::prefix('coach')->name('coach.')->middleware('role:Coach')->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\Coach\DashboardController::class, 'index'])->name('dashboard');
        Route::get('/schedule', [App\Http\Controllers\Coach\ScheduleController::class, 'index'])->name('schedule.index');
        Route::get('/classes', [App\Http\Controllers\Coach\ClassController::class, 'index'])->name('classes.index');
        Route::get('/classes/{class}', [App\Http\Controllers\Coach\ClassController::class, 'show'])->name('classes.show');
        Route::get('/students', [App\Http\Controllers\Coach\StudentController::class, 'index'])->name('students.index');
        Route::get('/students/{student}', [App\Http\Controllers\Coach\StudentController::class, 'show'])->name('students.show');
        Route::get('/payrolls', [App\Http\Controllers\Coach\PayrollController::class, 'index'])->name('payrolls.index');

        Route::get('/attendances/{class}/{date}', [App\Http\Controllers\Coach\AttendanceController::class, 'show'])->name('attendances.show');
        Route::post('/attendances/{class}/{date}', [App\Http\Controllers\Coach\AttendanceController::class, 'store'])->name('attendances.store');
    });
});

use App\Http\Controllers\Portal\ChipPaymentController;

Route::prefix('portal')->name('portal.')->group(function () {
    Route::get('/{token}', [ParentPortalController::class, 'index'])->name('parent');
    Route::get('/{token}/invoices/{invoice}', [ParentPortalController::class, 'invoice'])->name('invoice.show');
    Route::get('/{token}/invoices/{invoice}/pdf', [ParentPortalController::class, 'downloadInvoicePdf'])->name('invoice.pdf');
    Route::get('/{token}/invoices/{invoice}/receipt-pdf', [ParentPortalController::class, 'downloadReceiptPdf'])->name('invoice.receipt-pdf');
    Route::post('/{token}/invoices/{invoice}/checkout', [ChipPaymentController::class, 'checkout'])->name('invoice.checkout');
});

Route::post('/webhooks/chip', [ChipPaymentController::class, 'webhook'])->name('webhooks.chip');

require __DIR__.'/auth.php';
