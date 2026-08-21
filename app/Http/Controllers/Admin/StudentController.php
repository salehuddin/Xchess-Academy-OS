<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChessClass;
use App\Models\Student;
use App\Models\StudentParent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Student::with('parent');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $searchField = $request->input('search_field', 'all');

            if ($searchField === 'name') {
                $query->where('name', 'like', "%{$search}%");
            } elseif ($searchField === 'student_id') {
                $query->where('student_uid', 'like', "%{$search}%");
            } elseif ($searchField === 'nric_passport') {
                $query->where('nric_passport', 'like', "%{$search}%");
            } elseif ($searchField === 'parent_phone') {
                $query->whereHas('parent', function ($q) use ($search) {
                    $q->where('phone', 'like', "%{$search}%");
                });
            } else {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('student_uid', 'like', "%{$search}%")
                        ->orWhere('nric_passport', 'like', "%{$search}%")
                        ->orWhereHas('parent', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        });
                });
            }
        }

        if ($request->has('status') && $request->status !== 'all') {
            $statuses = explode(',', $request->status);
            $query->whereIn('status', $statuses);
        }

        // Parent Filter
        if ($request->filled('parent_status')) {
            if ($request->parent_status === 'no_parent') {
                $query->whereNull('parent_id');
            } elseif ($request->parent_status === 'specific' && $request->filled('parent_id')) {
                $query->where('parent_id', $request->parent_id);
            }
        }

        // Date Range Filter
        if ($request->filled('date_from')) {
            $query->whereDate('date_of_registration', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('date_of_registration', '<=', $request->date_to);
        }

        $sort = $request->input('sort', 'created_at');
        $direction = $request->input('direction', 'desc');

        // Handle sorting by related columns if necessary, for now simple columns
        if (in_array($sort, ['name', 'nric_passport', 'current_level', 'preferred_language', 'date_of_registration', 'status', 'created_at'])) {
            $query->orderBy($sort, $direction);
        } elseif ($sort === 'parent') {
            // Basic join for sorting by parent name could be complex, skipping or implementing simple version
            // For simplicity, let's default to created_at if complex sort requested
            $query->orderBy('created_at', 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $perPage = (int) $request->input('per_page', 10);
        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 10;
        }
        $students = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/Students/Index', [
            'students' => $students,
            'filters' => $request->all(),
            'parents' => StudentParent::select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Admin/Students/Create', [
            'parents' => StudentParent::select('id', 'name', 'email', 'phone')->orderBy('name')->get(),
            'preselectedParentId' => $request->input('parent_id'),
        ]);
    }

    public function bulkCreate(): Response
    {
        return Inertia::render('Admin/Students/BulkCreate', [
            'parents' => StudentParent::select('id', 'name', 'email', 'phone')->orderBy('name')->get(),
        ]);
    }

    public function bulkStore(Request $request)
    {
        $request->validate([
            'students' => 'required|array|min:1',
            'students.*.name' => 'required|string|max:255',
            'students.*.nric_passport' => 'required|string|max:12',
            'students.*.preferred_language' => 'required|in:Bahasa Melayu,English,Mandarin,Tamil',
            'students.*.date_of_registration' => 'required|date',
            'students.*.current_level' => 'nullable|string|max:255',
            'students.*.recurring_discount' => 'numeric|min:0',
            'students.*.admin_notes' => 'nullable|string',
            'students.*.parent_mode' => 'required|in:existing,new',
            'students.*.parent_id' => 'required_if:students.*.parent_mode,existing|nullable|exists:parents,id',
            'students.*.parent_name' => 'required_if:students.*.parent_mode,new|nullable|string|max:255',
            'students.*.parent_email' => 'required_if:students.*.parent_mode,new|nullable|email',
            'students.*.parent_phone' => 'nullable|string|max:20',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->students as $studentData) {
                $parentId = $studentData['parent_id'] ?? null;

                if ($studentData['parent_mode'] === 'new') {
                    // Check if parent with email already exists to prevent duplicates in bulk
                    $parent = StudentParent::where('email', $studentData['parent_email'])->first();

                    if (! $parent) {
                        $parent = StudentParent::create([
                            'name' => $studentData['parent_name'],
                            'email' => $studentData['parent_email'],
                            'phone' => $studentData['parent_phone'] ?? null,
                            'unique_access_token' => Str::uuid(),
                        ]);
                    }
                    $parentId = $parent->id;
                }

                // Generate Student UID
                $uid = 'STU-'.strtoupper(Str::random(6));
                while (Student::where('student_uid', $uid)->exists()) {
                    $uid = 'STU-'.strtoupper(Str::random(6));
                }

                Student::create([
                    'student_uid' => $uid,
                    'name' => $studentData['name'],
                    'nric_passport' => $studentData['nric_passport'],
                    'preferred_language' => $studentData['preferred_language'],
                    'date_of_registration' => $studentData['date_of_registration'],
                    'parent_id' => $parentId,
                    'current_level' => $studentData['current_level'],
                    'recurring_discount' => $studentData['recurring_discount'] ?? 0,
                    'admin_notes' => $studentData['admin_notes'] ?? null,
                    'status' => 'Active',
                ]);
            }
        });

        return redirect()->route('admin.students.index')->with('success', 'Students registered successfully.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'nric_passport' => 'required|string|max:12',
            'preferred_language' => 'required|in:Bahasa Melayu,English,Mandarin,Tamil',
            'date_of_registration' => 'required|date',
            'current_level' => 'nullable|string|max:255',
            'recurring_discount' => 'numeric|min:0',
            'admin_notes' => 'nullable|string',
            'parent_mode' => 'required|in:existing,new',
            'parent_id' => 'required_if:parent_mode,existing|nullable|exists:parents,id',
            'parent_name' => 'required_if:parent_mode,new|nullable|string|max:255',
            'parent_email' => 'required_if:parent_mode,new|nullable|email|unique:parents,email',
            'parent_phone' => 'nullable|string|max:20',
        ]);

        DB::transaction(function () use ($request) {
            $parentId = $request->parent_id;

            if ($request->parent_mode === 'new') {
                $parent = StudentParent::create([
                    'name' => $request->parent_name,
                    'email' => $request->parent_email,
                    'phone' => $request->parent_phone,
                    'unique_access_token' => Str::uuid(),
                ]);
                $parentId = $parent->id;
            }

            // Generate Student UID
            $uid = 'STU-'.strtoupper(Str::random(6));
            while (Student::where('student_uid', $uid)->exists()) {
                $uid = 'STU-'.strtoupper(Str::random(6));
            }

            Student::create([
                'student_uid' => $uid,
                'name' => $request->name,
                'nric_passport' => $request->nric_passport,
                'preferred_language' => $request->preferred_language,
                'date_of_registration' => $request->date_of_registration,
                'parent_id' => $parentId,
                'current_level' => $request->current_level,
                'recurring_discount' => $request->recurring_discount ?? 0,
                'admin_notes' => $request->admin_notes,
                'status' => 'Active',
            ]);
        });

        return redirect()->route('admin.students.index')->with('success', 'Student registered successfully.');
    }

    public function edit(Student $student): Response
    {
        return Inertia::render('Admin/Students/Edit', [
            'student' => $student->load('parent'),
            'parents' => StudentParent::select('id', 'name', 'email', 'phone')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Student $student)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'nric_passport' => 'required|string|max:12',
            'preferred_language' => 'required|in:Bahasa Melayu,English,Mandarin,Tamil',
            'date_of_registration' => 'required|date',
            'current_level' => 'nullable|string|max:255',
            'recurring_discount' => 'numeric|min:0',
            'admin_notes' => 'nullable|string',
            'status' => 'required|in:Active,Pending,Suspended',
            'parent_id' => 'required|exists:parents,id',
        ]);

        $student->update($request->only([
            'name',
            'nric_passport',
            'preferred_language',
            'date_of_registration',
            'current_level',
            'recurring_discount',
            'admin_notes',
            'status',
            'parent_id',
        ]));

        return redirect()->route('admin.students.index')->with('success', 'Student updated successfully.');
    }

    public function show(Student $student): Response
    {
        $student->load(['parent', 'classes.package', 'classes.coach', 'invoices']);

        return Inertia::render('Admin/Students/Show', [
            'student' => $student,
            'availableClasses' => ChessClass::with(['package', 'coach'])
                ->whereDoesntHave('students', function ($q) use ($student) {
                    $q->where('student_id', $student->id);
                })
                ->get()
                ->map(fn ($c) => [
                    'id' => $c->id,
                    'name' => $c->package->title.' ('.$c->id.') - '.$c->coach->name,
                ]),
        ]);
    }

    public function destroy(Student $student)
    {
        $student->delete();

        return redirect()->back()->with('success', 'Student deleted successfully.');
    }

    public function getParentDetails(StudentParent $parent)
    {
        $parent->load('students');

        return response()->json($parent);
    }

    public function updateParent(Request $request, StudentParent $parent)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:parents,email,'.$parent->id,
            'phone' => 'nullable|string|max:20',
        ]);

        $parent->update($request->only(['name', 'email', 'phone']));

        return response()->json(['message' => 'Parent updated successfully', 'parent' => $parent]);
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:students,id',
            'action' => 'required|in:delete,update_status,update_level,update_language',
            'value' => 'nullable',
        ]);

        $ids = $request->ids;
        $action = $request->action;
        $value = $request->value;

        DB::transaction(function () use ($ids, $action, $value) {
            switch ($action) {
                case 'delete':
                    Student::whereIn('id', $ids)->delete();
                    break;
                case 'update_status':
                    if (in_array($value, ['Active', 'Suspended', 'Inactive'])) {
                        Student::whereIn('id', $ids)->update(['status' => $value]);
                    }
                    break;
                case 'update_level':
                    Student::whereIn('id', $ids)->update(['current_level' => $value]);
                    break;
                case 'update_language':
                    if (in_array($value, ['Bahasa Melayu', 'English', 'Mandarin', 'Tamil'])) {
                        Student::whereIn('id', $ids)->update(['preferred_language' => $value]);
                    }
                    break;
            }
        });

        return redirect()->back()->with('success', 'Bulk action completed successfully.');
    }

    public function getDetails(Student $student)
    {
        $student->load(['parent', 'classes.package', 'classes.coach', 'invoices']);

        return response()->json($student);
    }

    public function searchParents(Request $request)
    {
        $search = $request->input('query');

        if (! $search) {
            return response()->json([]);
        }

        $parents = StudentParent::where('name', 'like', "%{$search}%")
            ->orWhere('email', 'like', "%{$search}%")
            ->orWhere('phone', 'like', "%{$search}%")
            ->limit(10)
            ->get(['id', 'name', 'email', 'phone']);

        return response()->json($parents);
    }
}
