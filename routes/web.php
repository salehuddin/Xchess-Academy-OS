<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\CoachController;
use App\Http\Controllers\Admin\ScheduleController;
use App\Http\Controllers\Admin\ClassController;
use App\Http\Controllers\Admin\AttendanceController;
use App\Http\Controllers\Admin\EnrollmentController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::prefix('admin')->name('admin.')->middleware('role:Admin')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::put('/users/{user}/role', [UserController::class, 'updateRole'])->name('users.role.update');
        Route::resource('coaches', CoachController::class);
        Route::get('/schedules/create', [ScheduleController::class, 'create'])->name('schedules.create');
        Route::get('/schedules/bulk-create', [ScheduleController::class, 'bulkCreate'])->name('schedules.bulk-create');
        Route::post('/schedules/preview', [ScheduleController::class, 'preview'])->name('schedules.preview');
        Route::post('/schedules/bulk-store', [ScheduleController::class, 'bulkStore'])->name('schedules.bulk-store');
        Route::get('/schedules', [ScheduleController::class, 'index'])->name('schedules.index');
        Route::post('/schedules', [ScheduleController::class, 'store'])->name('schedules.store');

        Route::resource('classes', ClassController::class);
        Route::post('/classes/{class}/enroll', [EnrollmentController::class, 'store'])->name('classes.enroll');
        Route::delete('/classes/{class}/enroll/{student}', [EnrollmentController::class, 'destroy'])->name('classes.unenroll');

        Route::get('/attendances', [AttendanceController::class, 'index'])->name('attendances.index');
        Route::get('/attendances/{schedule}', [AttendanceController::class, 'show'])->name('attendances.show');
        Route::post('/attendances/{schedule}', [AttendanceController::class, 'store'])->name('attendances.store');

        Route::get('/parents/search', [StudentController::class, 'searchParents'])->name('parents.search');
        Route::get('/parents/{parent}/details', [StudentController::class, 'getParentDetails'])->name('parents.details');
        Route::put('/parents/{parent}', [StudentController::class, 'updateParent'])->name('parents.update');

        Route::get('/students/bulk-create', [StudentController::class, 'bulkCreate'])->name('students.bulk-create');
        Route::post('/students/bulk-store', [StudentController::class, 'bulkStore'])->name('students.bulk-store');
        Route::post('/students/bulk-action', [StudentController::class, 'bulkAction'])->name('students.bulk-action');
        Route::resource('students', StudentController::class);
        Route::resource('parents', \App\Http\Controllers\Admin\ParentController::class);

        Route::get('/invoices', [\App\Http\Controllers\Admin\InvoiceController::class, 'index'])->name('invoices.index');
        Route::get('/invoices/{invoice}', [\App\Http\Controllers\Admin\InvoiceController::class, 'show'])->name('invoices.show');
        Route::put('/invoices/{invoice}', [\App\Http\Controllers\Admin\InvoiceController::class, 'update'])->name('invoices.update');
        Route::post('/invoices/{invoice}/send', [\App\Http\Controllers\Admin\InvoiceController::class, 'send'])->name('invoices.send');

        Route::get('/payrolls', [\App\Http\Controllers\Admin\PayrollController::class, 'index'])->name('payrolls.index');
        Route::put('/payrolls/{payroll}/approve', [\App\Http\Controllers\Admin\PayrollController::class, 'approve'])->name('payrolls.approve');
        Route::put('/payrolls/{payroll}/paid', [\App\Http\Controllers\Admin\PayrollController::class, 'markPaid'])->name('payrolls.paid');

        Route::get('/reports', [\App\Http\Controllers\Admin\ReportController::class, 'index'])->name('reports.index');

        Route::resource('tasks', \App\Http\Controllers\Admin\TaskController::class);
        Route::resource('payments', \App\Http\Controllers\Admin\PaymentController::class);

        Route::get('/rooms/{room}/schedule', [\App\Http\Controllers\Admin\RoomController::class, 'schedule'])->name('rooms.schedule');
        Route::resource('rooms', \App\Http\Controllers\Admin\RoomController::class);
        Route::resource('packages', \App\Http\Controllers\Admin\PackageController::class);
    });

    Route::prefix('coach')->name('coach.')->middleware('role:Coach')->group(function () {
        Route::get('/payrolls', [\App\Http\Controllers\Coach\PayrollController::class, 'index'])->name('payrolls.index');
    });
});

require __DIR__.'/auth.php';
