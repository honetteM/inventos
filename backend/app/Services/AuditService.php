<?php

namespace App\Services;

use App\Modules\Auth\Models\AuditLog;

class AuditService
{
    public static function log(
        string $event,
        string $auditableType,
        int $auditableId,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $action = null,
        ?array $metadata = null
    ): AuditLog {
        $request = request();
        $user = $request?->user();

        return AuditLog::create([
            'tenant_id' => $user?->tenant_id,
            'user_id' => $user?->id,
            'event' => $event,
            'auditable_type' => $auditableType,
            'auditable_id' => $auditableId,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'action' => $action,
            'metadata' => $metadata,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }
}
