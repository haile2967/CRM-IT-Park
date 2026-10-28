<?php

namespace App\Permissions;

interface PermissionModuleInterface
{
    /**
     * The human-readable group name for the frontend UI.
     */
    public static function group(): string;

    /**
     * Map of permission identifier => human-readable description.
     *
     * @return array<string, string>
     */
    public static function permissions(): array;
}
