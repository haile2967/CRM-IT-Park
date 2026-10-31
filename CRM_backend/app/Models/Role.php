<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Permission\Models\Role as SpatieRole;

/**
 * @property int $id
 * @property string $name
 * @property string $role_name
 * @property string|null $description
 * @property int|null $role_tier
 * @property bool $is_active
 * @property bool $is_system
 * @property string $guard_name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @mixin \Eloquent
 */
class Role extends SpatieRole
{
    use HasFactory;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return array_merge(parent::casts(), [
            'is_system' => 'boolean',
            'is_active' => 'boolean',
            'role_tier' => 'integer',
        ]);
    }

    public static function create(array $attributes = [])
    {
        if (empty($attributes['name']) && ! empty($attributes['role_name'])) {
            $attributes['name'] = $attributes['role_name'];
        }
        if (empty($attributes['role_name']) && ! empty($attributes['name'])) {
            $attributes['role_name'] = $attributes['name'];
        }

        return parent::create($attributes);
    }

    public function setAttribute($key, $value)
    {
        if ($key === 'role_name' && empty($this->attributes['name'])) {
            $this->attributes['name'] = $value;
        }
        if ($key === 'name' && empty($this->attributes['role_name'])) {
            $this->attributes['role_name'] = $value;
        }

        return parent::setAttribute($key, $value);
    }

    protected static function booted(): void
    {
        parent::booted();

    // Auto-sync name and role_name for full backward compatibility
    static::saving(function (self $role) {
        if (empty($role->name) && ! empty($role->role_name)) {
            $role->name = $role->role_name;
        }
        if (empty($role->role_name) && ! empty($role->name)) {
            $role->role_name = $role->name;
        }
        if (empty($role->guard_name)) {
            $role->guard_name = 'web';
        }
    });

    // Defense-in-depth: Block modifying core attributes of system roles
    static::updating(function (self $role) {
        if ($role->getOriginal('is_system') && $role->isDirty(['name', 'guard_name', 'is_system'])) {
            throw new \DomainException('System roles cannot be renamed or modified.');
        }
    });

    // Defense-in-depth: Prevent deletion of System Administrator or is_system roles
    static::deleting(function (self $role) {
        if ($role->is_system || $role->name === 'System Administrator') {
            throw new \DomainException('The System Administrator role is protected and cannot be deleted.');
        }
    });
}

    /**
     * Check if this role is marked as an immutable system role.
     */
    public function isSystemRole(): bool
    {
        return (bool) ($this->is_system || $this->name === 'System Administrator');
    }
}
