<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Request;

class AuditLogger
{
    /**
     * Record an audit log entry.
     */
    public static function log(
        string $entityType,
        int|string $entityId,
        string $action,
        ?string $fieldName = null,
        mixed $oldValue = null,
        mixed $newValue = null,
        ?int $userId = null
    ): AuditLog {
        $user = auth()->user();
        $currentUserId = $userId ?? $user?->user_id;

        return AuditLog::create([
            'user_id' => $currentUserId,
            'entity_type' => $entityType,
            'entity_id' => (int) $entityId,
            'action' => $action,
            'field_name' => $fieldName,
            'old_value' => is_array($oldValue) || is_object($oldValue) ? json_encode($oldValue) : ($oldValue !== null ? (string) $oldValue : null),
            'new_value' => is_array($newValue) || is_object($newValue) ? json_encode($newValue) : ($newValue !== null ? (string) $newValue : null),
            'ip_address' => Request::ip(),
            'user_agent' => substr(Request::userAgent() ?? '', 0, 500),
        ]);
    }
}
