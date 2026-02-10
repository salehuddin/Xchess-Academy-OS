<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403);
        }

        if ($user->isAdmin()) {
            return $next($request);
        }

        $userRole = $user->role;
        // Handle if role is cast to Enum or remains string
        $roleValue = $userRole instanceof \BackedEnum ? $userRole->value : $userRole;

        if ($roles !== [] && ! in_array($roleValue, $roles, true)) {
            abort(403);
        }

        return $next($request);
    }
}
