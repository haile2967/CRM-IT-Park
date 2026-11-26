<?php

namespace App\Permissions\Modules;

use App\Permissions\PermissionModuleInterface;

class LeadPermissions implements PermissionModuleInterface
{
    public const VIEW = 'leads.view';
    public const CREATE = 'leads.create';
    public const EDIT = 'leads.edit';
    public const DELETE = 'leads.delete';
    public const ASSIGN = 'leads.assign';
    public const CONVERT = 'leads.convert';

    public static function group(): string
    {
        return 'Leads';
    }

    public static function permissions(): array
    {
        return [
            self::VIEW => 'View and filter commercial CRM leads and prospective investors',
            self::CREATE => 'Register new leads and investment inquiries into the CRM pipeline',
            self::EDIT => 'Update lead status, contact info, qualification score, and notes',
            self::DELETE => 'Remove duplicate, obsolete, or unqualified leads',
            self::ASSIGN => 'Assign leads to sales representatives or account managers',
            self::CONVERT => 'Convert qualified leads into enterprise accounts and primary contacts',
        ];
    }
}
