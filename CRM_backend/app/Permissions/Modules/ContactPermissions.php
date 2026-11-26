<?php

namespace App\Permissions\Modules;

use App\Permissions\PermissionModuleInterface;

class ContactPermissions implements PermissionModuleInterface
{
    public const VIEW = 'contacts.view';
    public const CREATE = 'contacts.create';
    public const EDIT = 'contacts.edit';
    public const DELETE = 'contacts.delete';

    public static function group(): string
    {
        return 'Contacts';
    }

    public static function permissions(): array
    {
        return [
            self::VIEW => 'View individual client stakeholder profiles and contact records',
            self::CREATE => 'Add new corporate stakeholder contacts and associate with accounts',
            self::EDIT => 'Update contact phone numbers, emails, and job designations',
            self::DELETE => 'Delete obsolete contact profiles',
        ];
    }
}
