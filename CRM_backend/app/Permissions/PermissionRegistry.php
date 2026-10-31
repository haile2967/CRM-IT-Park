<?php

namespace App\Permissions;

use App\Permissions\Modules\RolePermissions;
use App\Permissions\Modules\UserPermissions;

class PermissionRegistry
{
    /**
     * Registered permission module classes.
     * When adding a new controller/domain, simply append its module class here.
     *
     * @var array<class-string<PermissionModuleInterface>>
     */
    protected static array $modules = [
        UserPermissions::class,
        RolePermissions::class,
    ];

    /**
     * Return all registered module classes.
     *
     * @return array<class-string<PermissionModuleInterface>>
     */
    public static function modules(): array
    {
        return static::$modules;
    }

    /**
     * Get a flattened list of all permission names.
     *
     * @return list<string>
     */
    public static function allNames(): array
    {
        $names = [];
        foreach (static::$modules as $module) {
            foreach (array_keys($module::permissions()) as $name) {
                $names[] = $name;
            }
        }
        return $names;
    }

    /**
     * Get detailed permission definitions with their group and description.
     *
     * @return array<array{name: string, group: string, description: string}>
     */
    public static function all(): array
    {
        $all = [];
        foreach (static::$modules as $module) {
            $group = $module::group();
            foreach ($module::permissions() as $name => $description) {
                $all[] = [
                    'name' => $name,
                    'group' => $group,
                    'description' => $description,
                ];
            }
        }
        return $all;
    }

    /**
     * Get permissions grouped by module domain for the frontend matrix.
     *
     * @return array<string, array<array{name: string, description: string}>>
     */
    public static function grouped(): array
    {
        $grouped = [];
        foreach (static::$modules as $module) {
            $group = $module::group();
            $items = [];
            foreach ($module::permissions() as $name => $description) {
                $items[] = [
                    'name' => $name,
                    'description' => $description,
                ];
            }
            $grouped[$group] = $items;
        }
        return $grouped;
    }
}
