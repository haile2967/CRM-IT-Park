<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $roleName = $this->name ?? $this->role_name;

        // Calculate assigned staff count across both Spatie pivot and legacy role_id
        $usersCount = isset($this->users_count)
            ? (int) $this->users_count
            : (int) ($this->users()->count() + $this->legacyUsers()->count());

        return [
            'id'          => $this->id,
            'name'        => $roleName,
            'role_name'   => $roleName,
            'description' => $this->description,
            'role_tier'   => $this->role_tier,
            'is_active'   => (bool) ($this->is_active ?? true),
            'is_system'   => (bool) ($this->is_system || $roleName === 'System Administrator'),
            'user_count'  => $usersCount,
            'permissions' => $this->permissions ? $this->permissions->pluck('name')->values()->all() : [],
            'created_at'  => $this->created_at?->toIso8601String(),
            'updated_at'  => $this->updated_at?->toIso8601String(),
        ];
    }
}
