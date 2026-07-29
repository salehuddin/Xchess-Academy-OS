<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\ChessClass;
use App\Models\Invoice;
use App\Models\Setting;
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
                    'topic' => $session?->topic ?? null,
                ]);
            }
        }

        $schedule = $schedule
            ->sortBy(fn ($s) => $s['date'].' '.($s['start_time'] ?? '00:00'))
            ->values();

        return Inertia::render('ParentPortal/Index', [
            'token' => $token,
            'parent' => [
                'id' => $parent->id,
                'name' => $parent->name,
            ],
            'students' => $parent->students,
            'invoices' => $invoices,
            'schedule' => $schedule,
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

        $invoice->load(['student.parent', 'student.classes.room', 'student.classes.coach', 'student.classes.package', 'payments']);

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

    public function downloadInvoicePdf(string $token, Invoice $invoice)
    {
        $parent = StudentParent::query()
            ->where('unique_access_token', $token)
            ->firstOrFail();

        if ($invoice->student?->parent_id !== $parent->id) {
            abort(404);
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

        $pdf = Pdf::loadView('pdf.invoice', [
            'invoice' => $invoice,
            'company' => $company,
        ]);

        return $pdf->download('Invoice-INV-'.$invoice->id.'.pdf');
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

        return $pdf->download('Official-Receipt-INV-'.$invoice->id.'.pdf');
    }
}
