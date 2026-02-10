<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $payments = Payment::with('invoice.student.user')->latest()->get();
        $invoices = Invoice::with('student.user')->where('status', '!=', 'Paid')->get();

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'invoices' => $invoices,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'invoice_id' => 'required|exists:invoices,id',
            'amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string',
            'transaction_id' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $payment = Payment::create($validated);
        
        // Check if invoice is fully paid
        $invoice = Invoice::find($validated['invoice_id']);
        $totalPaid = $invoice->payments()->sum('amount');
        
        if ($totalPaid >= $invoice->amount) {
            $invoice->update(['status' => 'Paid']);
        } else if ($totalPaid > 0) {
            $invoice->update(['status' => 'Partial']);
        }

        return redirect()->back()->with('success', 'Payment recorded successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Payment $payment)
    {
        $invoice = $payment->invoice;
        $payment->delete();
        
        // Recalculate invoice status
        $totalPaid = $invoice->payments()->sum('amount');
        if ($totalPaid >= $invoice->amount) {
            $invoice->update(['status' => 'Paid']);
        } else if ($totalPaid > 0) {
            $invoice->update(['status' => 'Partial']);
        } else {
            $invoice->update(['status' => 'Unpaid']);
        }

        return redirect()->back()->with('success', 'Payment deleted successfully.');
    }
}
