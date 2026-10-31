<?php

namespace App\Policies;

use App\Models\Role;
use App\Models\User;

class RolePolicy
{
    /**
     * Determine whether the user can view any roles.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('roles.view') || $user->hasRole('System Administrator');
    }

    /**
     * Determine whether the user can view the specific role.
     */
    public function view(User $user, Role $role): bool
    {
        return $user->can('roles.view') || $user->hasRole('System Administrator');
    }

    /**
     * Determine whether the user can create new roles.
     */
    public function create(User $user): bool
    {
        return $user->can('roles.create') || $user->hasRole('System Administrator');
    }

    /**
     * Determine whether the user can update the role.
     * System Administrator and is_system roles cannot be modified.
     */
    public function update(User $user, Role $role): bool
    {
        // System roles cannot be renamed or modified
        if ($role->isSystemRole()) {
            return false;
        }

        return $user->can('roles.edit') || $user->hasRole('System Administrator');
    }

    /**
     * Determine whether the user can delete the role.
     * System Administrator and is_system roles cannot be deleted.
     * Roles with active users assigned cannot be deleted.
     */
    public function delete(User $user, Role $role): bool
    {
        // System roles cannot be deleted
        if ($role->isSystemRole()) {
            return false;
        }

        // Prevent deletion if any users are currently assigned to this role
        if ($role->users()->exists()) {
            return false;
        }

        return $user->can('roles.delete') || $user->hasRole('System Administrator');
    }
}

