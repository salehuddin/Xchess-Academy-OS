<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\CoachProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', User::class);

        $search = $request->input('search');
        $role = $request->input('role');
        $perPage = (int) $request->input('per_page', 10);

        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 10;
        }

        $query = User::query()
            ->select(['id', 'name', 'email', 'role', 'is_coach', 'created_at']);

        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (! empty($role)) {
            $query->where('role', $role);
        }

        $users = $query->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search ?? '',
                'role' => $role ?? '',
                'per_page' => $perPage,
            ],
            'roles' => array_map(
                fn (UserRole $r) => $r->value,
                UserRole::cases(),
            ),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', Password::defaults()],
            'role' => ['required', Rule::in(array_map(fn (UserRole $r) => $r->value, UserRole::cases()))],
            'is_coach' => ['nullable', 'boolean'],
        ]);

        $isCoach = $validated['role'] === UserRole::Coach->value || ! empty($validated['is_coach']);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'is_coach' => $isCoach,
        ]);

        if ($isCoach) {
            CoachProfile::firstOrCreate(
                ['user_id' => $user->id],
            );
        }

        activity()
            ->on($user)
            ->by(auth()->user())
            ->log("Created new system user: {$user->name} ({$user->role->value})".($isCoach ? ' [Coach Enabled]' : ''));

        return back()->with('success', "User '{$user->name}' created successfully.");
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => ['nullable', 'string', Password::defaults()],
            'role' => ['required', Rule::in(array_map(fn (UserRole $r) => $r->value, UserRole::cases()))],
            'is_coach' => ['nullable', 'boolean'],
        ]);

        $isCoach = $validated['role'] === UserRole::Coach->value || ! empty($validated['is_coach']);

        $data = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'is_coach' => $isCoach,
        ];

        if (! empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
        }

        $user->update($data);

        if ($isCoach) {
            CoachProfile::firstOrCreate(
                ['user_id' => $user->id],
            );
        }

        activity()
            ->on($user)
            ->by(auth()->user())
            ->log("Updated user details for: {$user->name}");

        return back()->with('success', "User '{$user->name}' updated successfully.");
    }

    public function updateRole(Request $request, User $user): RedirectResponse
    {
        return $this->update($request, $user);
    }

    public function destroy(User $user): RedirectResponse
    {
        $this->authorize('delete', $user);

        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own active user account.');
        }

        $userName = $user->name;
        $user->delete();

        activity()
            ->by(auth()->user())
            ->log("Deleted user: {$userName}");

        return back()->with('success', "User '{$userName}' deleted successfully.");
    }
}
