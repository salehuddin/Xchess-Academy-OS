<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\ChessClass;
use App\Models\Invoice;
use App\Models\Setting;
use App\Models\Student;
use App\Models\StudentParent;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ParentPortalController extends Controller
{
    public function index(string $token): Response
    {
        $parent = StudentParent::query()
            ->where('unique_access_token', $token)
            ->firstOrFail();

        $parent->load([
            'students' => function ($q) {
                $q->select('id', 'name', 'student_uid', 'status', 'parent_id');
            },
        ]);

        $studentIds = $parent->students->pluck('id')->values();

        $invoices = Invoice::query()
            ->whereIn('student_id', $studentIds)
            ->whereIn('status', ['Pending', 'Paid', 'Overdue'])
            ->with(['student:id,name,parent_id'])
            ->orderByDesc('month_year')
            ->orderByDesc('id')
            ->get([
                'id',
                'student_id',
                'month_year',
                'status',
                'total_amount',
                'due_date',
                'created_at',
            ])
            ->map(function (Invoice $invoice) use ($token) {
                return [
                    'id' => $invoice->id,
                    'invoice_number' => $invoice->invoice_number,
                    'student_id' => $invoice->student_id,
                    'student_name' => $invoice->student?->name,
                    'month_year' => $invoice->month_year,
                    'status' => $invoice->status,
                    'total_amount' => $invoice->total_amount,
                    'due_date' => $invoice->due_date?->format('Y-m-d'),
                    'created_at' => $invoice->created_at?->format('Y-m-d'),
                    'view_url' => route('portal.invoice.show', [$token, $invoice->id]),
                ];
            });

        $startDate = now()->format('Y-m-d');
        $endDate = now()->addDays(30)->format('Y-m-d');

        $classes = ChessClass::query()
            ->whereHas('students', function ($q) use ($studentIds) {
                $q->whereIn('students.id', $studentIds);
            })
            ->with([
                'room:id,name',
                'coach:id,name',
                'package:id,title',
                'students' => function ($q) use ($studentIds) {
                    $q->select('students.id', 'students.name')->whereIn('students.id', $studentIds);
                },
                'classSessions' => function ($q) use ($startDate, $endDate) {
                    $q->whereBetween('session_date', [$startDate, $endDate])->with('coach:id,name');
                },
            ])
            ->get([
                'id',
                'uid',
                'name',
                'room_id',
                'coach_id',
                'package_id',
                'start_time',
                'end_time',
                'schedules',
            ]);

        $schedule = collect();
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        foreach ($classes as $class) {
            $scheduleDates = array_filter($class->schedules ?? [], function ($date) use ($startDate, $endDate) {
                return $date >= $startDate && $date <= $endDate;
            });

            $sessionDates = $class->classSessions->map(function ($session) {
                return is_string($session->session_date)
                    ? $session->session_date
                    : $session->session_date->format('Y-m-d');
            })->toArray();

            $allDates = array_unique(array_merge($scheduleDates, $sessionDates));
            sort($allDates);

            foreach ($allDates as $date) {
                if (Carbon::parse($date)->lt($start) || Carbon::parse($date)->gt($end)) {
                    continue;
                }

                $session = $class->classSessions->first(function ($s) use ($date) {
                    $d = is_string($s->session_date) ? $s->session_date : $s->session_date->format('Y-m-d');

                    return $d === $date;
                });

                $effectiveCoachName = $session?->coach?->name ?? $class->coach?->name ?? 'Unassigned';

                $schedule->push([
                    'date' => $date,
                    'class_uid' => $class->uid,
                    'class_name' => $class->name ?? $class->package?->title ?? 'Class '.$class->id,
                    'room_name' => $class->room?->name ?? 'N/A',
                    'start_time' => substr((string) $class->start_time, 0, 5),
                    'end_time' => substr((string) $class->end_time, 0, 5),
                    'coach_name' => $effectiveCoachName,
                    'students' => $class->students->pluck('name')->values()->all(),
                    'student_ids' => $class->students->pluck('id')->values()->all(),
                    'topic' => $session?->topic ?? null,
                ]);
            }
        }

        $schedule = $schedule
            ->sortBy(fn ($s) => $s['date'].' '.($s['start_time'] ?? '00:00'))
            ->values();

        $summary = [
            'pending_count' => $invoices->where('status', 'Pending')->count(),
            'pending_amount' => $invoices->where('status', 'Pending')->sum('total_amount'),
            'overdue_count' => $invoices->where('status', 'Overdue')->count(),
            'overdue_amount' => $invoices->where('status', 'Overdue')->sum('total_amount'),
            'paid_count' => $invoices->where('status', 'Paid')->count(),
        ];

        $nextSession = $schedule->first();

        $whatsappNumber = Setting::get('whatsapp_phone_number')
            ?: Setting::get('support_phone')
            ?: Setting::get('company_phone');

        $whatsappDigits = preg_replace('/\D/', '', (string) $whatsappNumber);

        $contact = [
            'support_email' => Setting::get('support_email', 'support@xchess-academy.com'),
            'support_phone' => Setting::get('support_phone', Setting::get('company_phone', '+60 12-345 6789')),
            'support_hours' => Setting::get('support_hours', 'Mon-Fri, 9am - 6pm'),
            'whatsapp_url' => $whatsappDigits
                ? 'https://wa.me/'.$whatsappDigits.'?text='.rawurlencode('Hi, I have a question about my child\'s account at '.Setting::get('company_name', 'X Chess Academy').'.')
                : null,
        ];

        return Inertia::render('ParentPortal/Index', [
            'token' => $token,
            'parent' => [
                'id' => $parent->id,
                'name' => $parent->name,
            ],
            'students' => $parent->students,
            'invoices' => $invoices,
            'schedule' => $schedule,
            'summary' => $summary,
            'next_session' => $nextSession,
            'contact' => $contact,
            'range' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function invoice(string $token, Invoice $invoice): Response
    {
        $parent = StudentParent::query()
            ->where('unique_access_token', $token)
            ->firstOrFail();

        $invoice->load(['student.parent', 'student.classes.room', 'student.classes.coach', 'student.classes.package', 'payments', 'adjustments']);

        if ($invoice->student?->parent_id !== $parent->id) {
            abort(404);
        }

        return Inertia::render('ParentPortal/Invoice', [
            'token' => $token,
            'parent' => [
                'id' => $parent->id,
                'name' => $parent->name,
            ],
            'invoice' => $invoice,
        ]);
    }

    public function studentDetails(string $token, Student $student)
    {
        $parent = StudentParent::query()
            ->where('unique_access_token', $token)
            ->firstOrFail();

        if ($student->parent_id !== $parent->id) {
            abort(404);
        }

        // Only expose what the portal modal displays. Internal fields
        // (admin_notes, recurring_discount) and relations (parent, invoices)
        // must never leak to the guest-facing payload.
        $student->load(['classes.package']);

        $student->setRelation('attendances', $this->attendanceHistory($student));

        return response()->json(
            $student->makeHidden(['admin_notes', 'recurring_discount', 'deleted_at'])
        );
    }

    private function attendanceHistory(Student $student)
    {
        return $student->attendances()
            ->with(['class.package', 'class.room'])
            ->orderByDesc('attendance_date')
            ->orderByDesc('id')
            ->limit(50)
            ->get()
            ->map(fn ($attendance) => [
                'id' => $attendance->id,
                'date' => $attendance->attendance_date?->format('Y-m-d'),
                'class_id' => $attendance->class_id,
                'class_name' => $attendance->class?->name ?? $attendance->class?->package?->title ?? 'Class #'.$attendance->class_id,
                'package' => $attendance->class?->package?->title,
                'room_name' => $attendance->class?->room?->name,
                'start_time' => $attendance->class?->start_time ? Carbon::parse($attendance->class->start_time)->format('H:i') : null,
                'end_time' => $attendance->class?->end_time ? Carbon::parse($attendance->class->end_time)->format('H:i') : null,
                'is_present' => $attendance->is_present,
            ]);
    }

    public function downloadInvoicePdf(string $token, Invoice $invoice)
    {
        $parent = StudentParent::query()
            ->where('unique_access_token', $token)
            ->firstOrFail();

        if ($invoice->student?->parent_id !== $parent->id) {
            abort(404);
        }

        $invoice->load(['student.parent', 'student.classes.package', 'payments', 'adjustments']);

        $company = [
            'name' => Setting::get('company_name', 'X Chess Academy'),
            'reg_no' => Setting::get('company_reg_no', '202401012345 (SSM)'),
            'email' => Setting::get('company_email', 'info@xchess-academy.com'),
            'phone' => Setting::get('company_phone', '+60 12-345 6789'),
            'address' => Setting::get('company_address', "Suite 10-2, Level 10, Chess Tower\nKuala Lumpur, Malaysia"),
            'bank_details' => Setting::get('company_bank_details', "Maybank: 5140 1234 5678\nAccount Name: X Chess Academy Sdn Bhd"),
        ];

        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'company' => $company,
        ]);

        return $pdf->download('Invoice-'.$invoice->invoice_number.'.pdf');
    }

    public function downloadReceiptPdf(string $token, Invoice $invoice)
    {
        $parent = StudentParent::query()
            ->where('unique_access_token', $token)
            ->firstOrFail();

        if ($invoice->student?->parent_id !== $parent->id) {
            abort(404);
        }

        if ($invoice->status !== 'Paid') {
            return back()->with('error', 'Receipt is only available for paid invoices.');
        }

        $invoice->load(['student.parent', 'student.classes.package', 'payments']);

        $company = [
            'name' => Setting::get('company_name', 'X Chess Academy'),
            'reg_no' => Setting::get('company_reg_no', '202401012345 (SSM)'),
            'email' => Setting::get('company_email', 'info@xchess-academy.com'),
            'phone' => Setting::get('company_phone', '+60 12-345 6789'),
            'address' => Setting::get('company_address', "Suite 10-2, Level 10, Chess Tower\nKuala Lumpur, Malaysia"),
            'bank_details' => Setting::get('company_bank_details', "Maybank: 5140 1234 5678\nAccount Name: X Chess Academy Sdn Bhd"),
        ];

        $payment = $invoice->payments->last();

        $pdf = Pdf::loadView('pdf.receipt', [
            'invoice' => $invoice,
            'payment' => $payment,
            'company' => $company,
        ]);

        return $pdf->download('Official-Receipt-'.$invoice->invoice_number.'.pdf');
    }
}
