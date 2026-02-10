<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\InvoiceCreated;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(): Response
    {
        $invoices = Invoice::with('student')
            ->latest()
            ->paginate(10);

        return Inertia::render('Admin/Invoices/Index', [
            'invoices' => $invoices,
        ]);
    }

    public function show(Invoice $invoice): Response
    {
        $invoice->load(['student.parent', 'student.classes.package']);

        return Inertia::render('Admin/Invoices/Show', [
            'invoice' => $invoice,
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $request->validate([
            'manual_adjustment' => 'required|numeric',
            'finance_remarks' => 'nullable|string',
        ]);

        $manualAdjustment = $request->manual_adjustment;
        $totalAmount = $invoice->base_amount + $invoice->tax_amount - $invoice->recurring_discount_val - $manualAdjustment;
        // Ensure non-negative
        $totalAmount = max(0, $totalAmount);

        $invoice->update([
            'manual_adjustment' => $manualAdjustment,
            'finance_remarks' => $request->finance_remarks,
            'total_amount' => $totalAmount,
        ]);

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

        $invoice->load('student.parent');
        if ($invoice->student->parent && $invoice->student->parent->email) {
            Mail::to($invoice->student->parent->email)->send(new InvoiceCreated($invoice));
        }

        return redirect()->back()->with('success', 'Invoice sent to parent.');
    }
}
