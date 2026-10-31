<?php

namespace App\Providers;

use App\Models\Role;
use App\Policies\RolePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // 1. Register Role policy for protection guardrails
        Gate::policy(Role::class, RolePolicy::class);

        // 2. Global Super-Admin Bypass:
        // System Administrator automatically passes all permission checks without requiring individual assignment
        Gate::before(function ($user, string $ability) {
            return $user->hasRole('System Administrator') ? true : null;
        });
    }
}
