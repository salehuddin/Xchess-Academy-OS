<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\CoachProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CoachController extends Controller
{
    public function index(Request $request): Response
    {
        $query = User::with('coachProfile')
            ->where(function ($q) {
                $q->where('role', UserRole::Coach->value)
                  ->orWhereHas('coachProfile');
            });

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhereHas('coachProfile', function ($q) use ($search) {
                      $q->where('phone', 'like', "%{$search}%")
                        ->orWhere('nric', 'like', "%{$search}%");
                  });
            });
        }

        $coaches = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/Coaches/Index', [
            'coaches' => $coaches,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Coaches/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8', // Or optional/generated
            'nric' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'bank_name' => 'nullable|string|max:255',
            'bank_account_name' => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:50',
            'level' => 'nullable|string|max:50',
            'hourly_rate' => 'nullable|numeric|min:0',
            'availability' => 'nullable|array',
        ]);

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => UserRole::Coach, // Default role
                'hourly_rate' => $validated['hourly_rate'] ?? 0, // Fallback for user table
            ]);

            CoachProfile::create([
                'user_id' => $user->id,
                'nric' => $validated['nric'],
                'phone' => $validated['phone'],
                'bank_name' => $validated['bank_name'],
                'bank_account_name' => $validated['bank_account_name'],
                'bank_account_number' => $validated['bank_account_number'],
                'level' => $validated['level'],
                'hourly_rate' => $validated['hourly_rate'] ?? 0,
                'availability' => $validated['availability'],
            ]);
        });

        return redirect()->route('admin.coaches.index')->with('success', 'Coach created successfully.');
    }

    public function edit(User $coach): Response
    {
        $coach->load('coachProfile');
        
        // Ensure this user is actually a coach or has a profile
        if (!$coach->coachProfile && $coach->role !== UserRole::Coach) {
            abort(404);
        }

        return Inertia::render('Admin/Coaches/Edit', [
            'coach' => $coach,
        ]);
    }

    public function update(Request $request, User $coach)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($coach->id)],
            'nric' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'bank_name' => 'nullable|string|max:255',
            'bank_account_name' => 'nullable|string|max:255',
            'bank_account_number' => 'nullable|string|max:50',
            'level' => 'nullable|string|max:50',
            'hourly_rate' => 'nullable|numeric|min:0',
            'availability' => 'nullable|array',
        ]);

        DB::transaction(function () use ($coach, $validated) {
            $coach->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'hourly_rate' => $validated['hourly_rate'] ?? 0,
            ]);

            $coach->coachProfile()->updateOrCreate(
                ['user_id' => $coach->id],
                [
                    'nric' => $validated['nric'],
                    'phone' => $validated['phone'],
                    'bank_name' => $validated['bank_name'],
                    'bank_account_name' => $validated['bank_account_name'],
                    'bank_account_number' => $validated['bank_account_number'],
                    'level' => $validated['level'],
                    'hourly_rate' => $validated['hourly_rate'] ?? 0,
                    'availability' => $validated['availability'],
                ]
            );
        });

        return redirect()->route('admin.coaches.index')->with('success', 'Coach updated successfully.');
    }

    public function destroy(User $coach)
    {
        $coach->delete();
        return redirect()->back()->with('success', 'Coach deleted successfully.');
    }
}
