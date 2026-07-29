<?php

namespace App\Providers;

use App\Enums\UserRole;
use App\Models\User;
use App\Policies\UserPolicy;
use App\Services\MailConfig;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        if (config('app.env') === 'production') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        MailConfig::apply();

        Gate::policy(User::class, UserPolicy::class);

        Gate::define('access-admin', fn (User $user): bool => $user->isAdmin());
        Gate::define('access-ops', fn (User $user): bool => $user->hasAnyRole(UserRole::Ops));
        Gate::define('access-finance', fn (User $user): bool => $user->hasAnyRole(UserRole::Finance));
        Gate::define('access-coach', fn (User $user): bool => $user->hasAnyRole(UserRole::Coach));

        Vite::prefetch(concurrency: 3);
    }
}
