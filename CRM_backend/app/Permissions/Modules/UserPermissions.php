<?php

namespace App\Permissions\Modules;

use App\Permissions\PermissionModuleInterface;

class UserPermissions implements PermissionModuleInterface
{
    // Canonical Permission Constants (Type-Safe for Controllers & Routes)
    public const VIEW = 'users.view';
    public const CREATE = 'users.create';
    public const EDIT = 'users.edit';
    public const DEACTIVATE = 'users.deactivate';
    public const ASSIGN_ROLE = 'users.assign_role';

    public static function group(): string
    {
        return 'Users';
    }

    public static function permissions(): array
    {
        return [
            self::VIEW => 'View and list CRM user profiles and staff directory',
            self::CREATE => 'Create new staff user accounts and configure credentials',
            self::EDIT => 'Modify existing user profile information',
            self::DEACTIVATE => 'Activate, suspend, or deactivate staff user accounts',
            self::ASSIGN_ROLE => 'Assign or change security roles for staff members',
        ];
    }
}
