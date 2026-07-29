<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteAnnouncement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SiteAnnouncementController extends Controller
{
    public function index(Request $request): Response
    {
        $query = SiteAnnouncement::query()
            ->with('creator:id,name')
            ->orderByDesc('id');

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where('title', 'like', '%'.$search.'%');
        }

        $perPage = (int) $request->input('per_page', 10);
        if (! in_array($perPage, [10, 25, 50, 100], true)) {
            $perPage = 10;
        }

        $announcements = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/SiteAnnouncements/Index', [
            'announcements' => $announcements,
            'filters' => $request->only(['type', 'search', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/SiteAnnouncements/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateAnnouncement($request);
        $data['created_by'] = Auth::id();

        SiteAnnouncement::create($data);

        activity()
            ->causedBy($request->user())
            ->log('Created site announcement: '.$data['title']);

        return redirect()->route('admin.site-announcements.index')
            ->with('success', 'Site announcement created successfully.');
    }

    public function edit(SiteAnnouncement $siteAnnouncement): Response
    {
        return Inertia::render('Admin/SiteAnnouncements/Edit', [
            'announcement' => $siteAnnouncement,
        ]);
    }

    public function update(Request $request, SiteAnnouncement $siteAnnouncement): RedirectResponse
    {
        $data = $this->validateAnnouncement($request);

        $siteAnnouncement->update($data);

        activity()
            ->causedBy($request->user())
            ->log('Updated site announcement: '.$data['title']);

        return redirect()->route('admin.site-announcements.index')
            ->with('success', 'Site announcement updated successfully.');
    }

    public function destroy(Request $request, SiteAnnouncement $siteAnnouncement): RedirectResponse
    {
        $siteAnnouncement->delete();

        activity()
            ->causedBy($request->user())
            ->log('Deleted site announcement: '.$siteAnnouncement->title);

        return redirect()->route('admin.site-announcements.index')
            ->with('success', 'Site announcement deleted.');
    }

    private function validateAnnouncement(Request $request): array
    {
        return $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'type' => 'required|in:info,warning,success',
            'is_active' => 'boolean',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:published_at',
        ]);
    }
}
