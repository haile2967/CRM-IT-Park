<?php

namespace App\Traits;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Schema;

trait VisibleToRole
{
    /**
     * Scope a query to only include records visible to the given user based on SRS §3.3.
     */
    public function scopeVisibleTo(Builder $query, ?User $user = null): Builder
    {
        $user = $user ?? auth()->user();

        if (!$user) {
            return $query->whereRaw('1 = 0');
        }

        // System Administrator and CRM Manager have global visibility across all records (§3.3)
        if ($user->isAdmin() || $user->isCrmManager()) {
            return $query;
        }

        $tableName = $this->getTable();

        // Support Agent Visibility (§3.3)
        if ($user->isSupportAgent()) {
            if ($tableName === 'tickets') {
                return $query->where(function (Builder $q) use ($user) {
                    $q->where('assignee_user_id', $user->user_id)
                      ->orWhereNull('assignee_user_id');
                });
            }

            // Read-only access to accounts and contacts for customer verification
            if (in_array($tableName, ['accounts', 'contacts'], true)) {
                return $query;
            }

            // Support agents do not have portfolio visibility into leads/opportunities
            return $query->whereRaw('1 = 0');
        }

        // BDO (Business Development Officer) Visibility: portfolio-scoped (§3.3)
        if ($user->isBdo()) {
            if ($tableName === 'tickets') {
                return $query->whereHas('account', function (Builder $q) use ($user) {
                    $q->where('owner_user_id', $user->user_id);
                });
            }

            if ($tableName === 'activities') {
                return $query->where('assigned_user_id', $user->user_id);
            }

            if (Schema::hasColumn($tableName, 'owner_user_id')) {
                return $query->where($tableName . '.owner_user_id', $user->user_id);
            }
        }

        return $query;
    }
}
