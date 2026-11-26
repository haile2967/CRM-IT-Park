<?php

namespace App\Permissions\Modules;

use App\Permissions\PermissionModuleInterface;

class AccountPermissions implements PermissionModuleInterface
{
    public const VIEW = 'accounts.view';
    public const CREATE = 'accounts.create';
    public const EDIT = 'accounts.edit';
    public const DELETE = 'accounts.delete';

    public static function group(): string
    {
        return 'Accounts';
    }

    public static function permissions(): array
    {
        return [
            self::VIEW => 'View directory of corporate clients, park enterprises, and companies',
            self::CREATE => 'Register new enterprise client profiles and park company records',
            self::EDIT => 'Modify account details, commercial status, and industry tier',
            self::DELETE => 'Archive or delete corporate account records from the system',
        ];
    }
}
