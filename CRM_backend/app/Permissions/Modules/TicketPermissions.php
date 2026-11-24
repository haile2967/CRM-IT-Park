<?php

namespace App\Permissions\Modules;

use App\Permissions\PermissionModuleInterface;

class TicketPermissions implements PermissionModuleInterface
{
    public const VIEW = 'tickets.view';
    public const CREATE = 'tickets.create';
    public const EDIT = 'tickets.edit';
    public const DELETE = 'tickets.delete';
    public const ASSIGN = 'tickets.assign';
    public const ESCALATE = 'tickets.escalate';

    public static function group(): string
    {
        return 'Tickets';
    }

    public static function permissions(): array
    {
        return [
            self::VIEW => 'View customer service tickets, inquiries, and incident records',
            self::CREATE => 'Log new support tickets on behalf of park tenants and clients',
            self::EDIT => 'Update ticket statuses, priority levels, and resolution notes',
            self::DELETE => 'Purge spam or erroneous support ticket submissions',
            self::ASSIGN => 'Assign tickets to technical support engineers or claim unassigned tickets',
            self::ESCALATE => 'Trigger escalation policies and notify supervisors for delayed tickets',
        ];
    }
}
