<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Mail\InvoiceCreated;
use App\Models\Invoice;
use App\Models\InvoiceAdjustment;
use App\Models\Setting;
use App\Services\Notifications\InAppNotifier;
use App\Services\Notifications\NotificationEngine;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = (int) $request->input('per_page', 15);
        if (! in_array($perPage, [15, 25, 50, 100], true)) {
            $perPage = 15;
        }

        $query = Invoice::with('student')->latest();

        if ($request->filled('month')) {
            $query->where('month_year', $request->month);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->search.'%');
            });
        }

        $invoices = $query->paginate($perPage)->withQueryString();

        // Summary stats over ALL invoices matching filters (before pagination)
        $statsQuery = Invoice::query();
        if ($request->filled('month')) {
            $statsQuery->where('month_year', $request->month);
        }

        $summary = [
            'total' => $statsQuery->count(),
            'draft_count' => (clone $statsQuery)->where('status', 'Draft')->count(),
            'pending_count' => (clone $statsQuery)->where('status', 'Pending')->count(),
            'paid_count' => (clone $statsQuery)->where('status', 'Paid')->count(),
            'total_billed' => (clone $statsQuery)->where('status', '!=', 'Draft')->sum('total_amount'),
            'total_collected' => (clone $statsQuery)->where('status', 'Paid')->sum('total_amount'),
        ];

        $availableMonths = Invoice::select('month_year')
            ->distinct()
            ->orderBy('month_year', 'desc')
            ->pluck('month_year');

        return Inertia::render('Admin/Invoices/Index', [
            'invoices' => $invoices,
            'summary' => $summary,
            'availableMonths' => $availableMonths,
            'filters' => $request->only(['per_page', 'month', 'status', 'search']),
        ]);
    }

    public function show(Invoice $invoice): Response
    {
        $invoice->load(['student.parent', 'student.classes.package', 'payments', 'adjustments']);

        $pendingAdjustments = InvoiceAdjustment::query()
            ->with('appliedFrom')
            ->where('student_id', $invoice->student_id)
            ->where('status', 'pending')
            ->latest()
            ->get();

        return Inertia::render('Admin/Invoices/Show', [
            'invoice' => $invoice,
            'pendingAdjustments' => $pendingAdjustments,
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        if ($invoice->status !== 'Draft') {
            return redirect()->back()->with('error', 'Adjustments can only be edited while the invoice is in Draft status.');
        }

        $request->validate([
            'finance_remarks' => 'nullable|string',
            'adjustments' => 'nullable|array',
            'adjustments.*.id' => 'nullable|integer',
            'adjustments.*.type' => 'required|string|in:credit,charge',
            'adjustments.*.amount' => 'required|numeric|min:0',
            'adjustments.*.reason' => 'required|string',
        ]);

        $incoming = collect($request->adjustments ?? []);

        // Track which existing adjustment ids are kept so we can prune removed rows.
        $keptIds = $incoming->filter(fn ($adj) => ! empty($adj['id']))->pluck('id');

        // Prune applied adjustments that are no longer in the submitted set.
        if ($keptIds->isEmpty()) {
            $invoice->adjustments()->where('status', 'applied')->delete();
        } else {
            $invoice->adjustments()->where('status', 'applied')->whereNotIn('id', $keptIds)->delete();
        }

        foreach ($incoming as $adj) {
            if (! empty($adj['id'])) {
                $invoice->adjustments()->whereKey($adj['id'])->where('status', 'applied')->update([
                    'type' => $adj['type'],
                    'amount' => $adj['amount'],
                    'reason' => $adj['reason'],
                ]);
            } else {
                $invoice->adjustments()->create([
                    'student_id' => $invoice->student_id,
                    'type' => $adj['type'],
                    'amount' => $adj['amount'],
                    'reason' => $adj['reason'],
                    'status' => 'applied',
                    'created_by' => auth()->id(),
                ]);
            }
        }

        $invoice->update(['finance_remarks' => $request->finance_remarks]);
        $invoice->recomputeTotal();

        activity()->on($invoice)->log($invoice->invoice_number.' adjustments updated');

        return redirect()->back()->with('success', 'Invoice updated successfully.');
    }

    public function send(Invoice $invoice)
    {
        if ($invoice->status !== 'Draft') {
            return redirect()->back()->with('error', 'Invoice is not in Draft status.');
        }

        $invoice->update([
            'status' => 'Pending',
            'notification_sent' => true,
        ]);

        $invoice->load(['student.parent', 'adjustments']);
        if ($invoice->student->parent && $invoice->student->parent->email) {
            Mail::to($invoice->student->parent->email)->send(new InvoiceCreated($invoice));
        }

        (new NotificationEngine)->triggerInvoiceSent($invoice);

        app(InAppNotifier::class)->notifyRoles(
            [UserRole::Finance],
            'invoice_sent',
            "Invoice {$invoice->invoice_number} sent",
            "Invoice {$invoice->month_year} for {$invoice->student?->name} was sent to the parent.",
            route('admin.invoices.show', $invoice),
            ['invoice_id' => $invoice->id],
            "invoice_sent:{$invoice->id}",
            auth()->id(),
        );

        return redirect()->back()->with('success', 'Invoice sent to parent.');
    }

    public function downloadPdf(Invoice $invoice)
    {
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
}
