<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AnnouncementDispatch;
use App\Models\ChessClass;
use App\Services\Announcements\AnnouncementEngine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Announcement::query()
            ->withCount('dispatches')
            ->orderByDesc('id');

        if ($request->filled('channel')) {
            $query->where('channel', $request->string('channel'));
        }

        if ($request->filled('audience')) {
            $query->where('audience', $request->string('audience'));
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

        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => $announcements,
            'filters' => $request->only(['channel', 'audience', 'search', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        $classes = ChessClass::query()
            ->select('id', 'uid', 'name', 'mode')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Announcements/Create', [
            'classes' => $classes,
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateAnnouncement($request);
        $data['created_by'] = Auth::id();

        $announcement = Announcement::create($data);

        if ($request->boolean('send_now')) {
            (new AnnouncementEngine)->sendNow($announcement);
        }

        return redirect()->route('admin.announcements.index')->with('success', 'Announcement created.');
    }

    public function show(Announcement $announcement): Response
    {
        $announcement->loadCount('dispatches');

        $dispatches = AnnouncementDispatch::query()
            ->where('announcement_id', $announcement->id)
            ->orderByDesc('scheduled_for')
            ->orderByDesc('id')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('Admin/Announcements/Show', [
            'announcement' => $announcement,
            'dispatches' => $dispatches,
        ]);
    }

    public function send(Announcement $announcement)
    {
        (new AnnouncementEngine)->sendNow($announcement);

        return redirect()->route('admin.announcements.show', $announcement)->with('success', 'Announcement sent.');
    }

    private function validateAnnouncement(Request $request): array
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'channel' => 'required|in:email,whatsapp',
            'subject' => 'nullable|string|max:255',
            'body' => 'required|string',
            'audience' => 'required|in:all_parents,class',
            'class_id' => 'nullable|integer',
        ]);

        $audienceMeta = null;
        if ($validated['audience'] === 'class') {
            $classId = (int) ($validated['class_id'] ?? 0);
            if ($classId <= 0) {
                abort(422, 'Class is required for class audience.');
            }
            $audienceMeta = ['class_id' => $classId];
        }

        return [
            'title' => $validated['title'],
            'channel' => $validated['channel'],
            'subject' => $validated['channel'] === 'email' ? ($validated['subject'] ?? '') : null,
            'body' => $validated['body'],
            'audience' => $validated['audience'],
            'audience_meta' => $audienceMeta,
            'status' => 'Draft',
        ];
    }
}
