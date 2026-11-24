<?php

namespace App\Permissions\Modules;

use App\Permissions\PermissionModuleInterface;

class OpportunityPermissions implements PermissionModuleInterface
{
    public const VIEW = 'opportunities.view';
    public const CREATE = 'opportunities.create';
    public const EDIT = 'opportunities.edit';
    public const DELETE = 'opportunities.delete';

    public static function group(): string
    {
        return 'Opportunities';
    }

    public static function permissions(): array
    {
        return [
            self::VIEW => 'View sales pipeline deals, commercial negotiations, and valuations',
            self::CREATE => 'Open new commercial lease deals and space allocation opportunities',
            self::EDIT => 'Advance pipeline stages, update deal value, and negotiate terms',
            self::DELETE => 'Remove abandoned or cancelled deal opportunities',
        ];
    }
}
