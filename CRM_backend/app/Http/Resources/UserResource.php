<?php

namespace App\Http\Resources;

use App\Permissions\PermissionRegistry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $this->hasRole('System Administrator');

        // Resolve active permissions (System Administrator receives all registered capabilities)
        $permissions = $isAdmin
            ? PermissionRegistry::allNames()
            : $this->getAllPermissions()->pluck('name')->values()->all();

        // Resolve assigned roles
        $roleNames = $this->roles->isNotEmpty()
            ? $this->roles->pluck('name')->values()->all()
            : [];

        $primaryRole = $this->roles->first();

        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => trim("{$this->first_name} {$this->last_name}"),
            'email' => $this->email,
            'phone' => $this->phone,
            'status' => $this->status,
            'avatar' => $this->avatar,
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'is_admin' => $isAdmin,
            'roles' => $roleNames,
            'permissions' => $permissions,
            'role' => $primaryRole ? [
                'id' => $primaryRole->id,
                'role_name' => $primaryRole->name,
                'name' => $primaryRole->name,
                'description' => $primaryRole->description,
                'role_tier' => $primaryRole->role_tier,
                'is_system' => (bool) ($primaryRole->is_system || $primaryRole->name === 'System Administrator'),
            ] : null,
        ];
    }
}
