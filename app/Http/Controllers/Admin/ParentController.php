<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentParent;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ParentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = StudentParent::with(['students' => function ($q) {
            $q->select('id', 'name', 'parent_id');
        }])->withCount('students');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $sort = $request->input('sort', 'created_at');
        $direction = $request->input('direction', 'desc');

        if (in_array($sort, ['name', 'email', 'phone', 'created_at'])) {
            $query->orderBy($sort, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = (int) $request->input('per_page', 10);
        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 10;
        }
        $parents = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/Parents/Index', [
            'parents' => $parents,
            'filters' => $request->all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:parents,email',
            'phone' => 'nullable|string|max:20',
        ]);

        StudentParent::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'unique_access_token' => Str::uuid(),
        ]);

        return redirect()->back()->with('success', 'Parent added successfully.');
    }

    public function update(Request $request, StudentParent $parent)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:parents,email,'.$parent->id,
            'phone' => 'nullable|string|max:20',
        ]);

        $parent->update($request->only(['name', 'email', 'phone']));

        return redirect()->back()->with('success', 'Parent updated successfully.');
    }

    public function destroy(StudentParent $parent)
    {
        if ($parent->students()->count() > 0) {
            return redirect()->back()->with('error', 'Cannot delete parent with associated students.');
        }

        $parent->delete();

        return redirect()->back()->with('success', 'Parent deleted successfully.');
    }
}
