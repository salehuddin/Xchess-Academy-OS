<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Package::query()
            ->withCount('classes');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%");
        }

        if ($request->has('sort')) {
            $query->orderBy($request->sort, $request->direction ?? 'asc');
        } else {
            $query->latest();
        }

        $packages = $query->paginate(10)->withQueryString();

        return Inertia::render('Admin/Packages/Index', [
            'packages' => $packages,
            'filters' => $request->only(['search', 'sort', 'direction']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255|unique:packages',
            'monthly_fee' => 'required|numeric|min:0',
            'sessions_per_month' => 'required|integer|min:1|max:30',
            'coach_rate_per_session' => 'required|numeric|min:0',
        ]);

        Package::create($validated);

        return redirect()->back()->with('success', 'Package created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Package $package)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255|unique:packages,title,' . $package->id,
            'monthly_fee' => 'required|numeric|min:0',
            'sessions_per_month' => 'required|integer|min:1|max:30',
            'coach_rate_per_session' => 'required|numeric|min:0',
        ]);

        $package->update($validated);

        return redirect()->back()->with('success', 'Package updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Package $package)
    {
        if ($package->classes()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete package with associated classes.');
        }

        $package->delete();

        return redirect()->back()->with('success', 'Package deleted successfully.');
    }
}
