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
        $isAdmin = $this->hasRole('System Administrator') || $this->role?->role_name === 'System Administrator';

        // Resolve active permissions (System Administrator receives all registered capabilities)
        $permissions = $isAdmin
            ? PermissionRegistry::allNames()
            : $this->getAllPermissions()->pluck('name')->values()->all();

        // Resolve assigned roles (falling back to legacy role relation if roles relation not yet populated)
        $roleNames = $this->roles->isNotEmpty()
            ? $this->roles->pluck('name')->values()->all()
            : ($this->role?->role_name ? [$this->role->role_name] : []);

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
            'role' => $this->whenLoaded('role', function () {
                return [
                    'id' => $this->role->id,
                    'role_name' => $this->role->role_name ?? $this->role->name,
                    'name' => $this->role->name ?? $this->role->role_name,
                    'description' => $this->role->description,
                    'role_tier' => $this->role->role_tier,
                    'is_system' => (bool) ($this->role->is_system ?? false),
                ];
            }),
        ];
    }
}
