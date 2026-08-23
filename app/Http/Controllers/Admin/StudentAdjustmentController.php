<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InvoiceAdjustment;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class StudentAdjustmentController extends Controller
{
    public function store(Request $request, Student $student): RedirectResponse
    {
        $validated = $request->validate([
            'type' => 'required|string|in:credit,charge',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string',
        ]);

        $adjustment = InvoiceAdjustment::create([
            'student_id' => $student->id,
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'reason' => $validated['reason'],
            'status' => 'pending',
            'applied_from_id' => null,
            'created_by' => auth()->id(),
        ]);

        activity()
            ->performedOn($student)
            ->log(($validated['type'] === 'credit' ? 'Refund credit' : 'Additional charge').' of RM'.$validated['amount'].' recorded for next month\'s invoice');

        return redirect()->back()->with('success', 'Adjustment recorded. It will be applied to the next generated invoice.');
    }

    public function update(Request $request, Student $student, InvoiceAdjustment $adjustment): RedirectResponse
    {
        $this->ensurePendingOwned($student, $adjustment);

        $validated = $request->validate([
            'type' => 'required|string|in:credit,charge',
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string',
        ]);

        $adjustment->update($validated);

        activity()
            ->performedOn($student)
            ->log('Carry-forward adjustment updated');

        return redirect()->back()->with('success', 'Adjustment updated.');
    }

    public function destroy(Student $student, InvoiceAdjustment $adjustment): RedirectResponse
    {
        $this->ensurePendingOwned($student, $adjustment);

        $adjustment->delete();

        activity()
            ->performedOn($student)
            ->log('Carry-forward adjustment removed');

        return redirect()->back()->with('success', 'Pending adjustment removed.');
    }

    private function ensurePendingOwned(Student $student, InvoiceAdjustment $adjustment): void
    {
        abort_if($adjustment->student_id !== $student->id, 404);
        abort_if($adjustment->status !== 'pending', 403);
    }
}
