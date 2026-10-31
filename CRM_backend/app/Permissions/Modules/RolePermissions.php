<?php

namespace App\Permissions\Modules;

use App\Permissions\PermissionModuleInterface;

class RolePermissions implements PermissionModuleInterface
{
    public const VIEW = 'roles.view';
    public const CREATE = 'roles.create';
    public const EDIT = 'roles.edit';
    public const DELETE = 'roles.delete';

    public static function group(): string
    {
        return 'Roles & Permissions';
    }

    public static function permissions(): array
    {
        return [
            self::VIEW => 'View roles and their assigned permission matrices',
            self::CREATE => 'Create new custom system roles with tailored permission sets',
            self::EDIT => 'Modify custom role names, descriptions, and assigned permissions',
            self::DELETE => 'Remove unused custom roles that have no active staff assigned',
        ];
    }
}

