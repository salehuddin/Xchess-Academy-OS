<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Mail\ParentPortalAccess;
use App\Models\StudentParent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class AccessLinkController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('ParentAccess');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $parent = StudentParent::query()
            ->where('email', $validated['email'])
            ->first();

        if ($parent && $parent->unique_access_token) {
            Mail::to($parent->email)->send(new ParentPortalAccess($parent));
        }

        // Always return the same generic success message to prevent
        // email enumeration of registered parents.
        return back()->with('success', 'If an account exists for that email, a portal access link has been sent.');
    }
}
