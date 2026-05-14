<?php

namespace App\Traits;

use App\Modules\Auth\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

trait Auditable
{
    protected static function bootAuditable(): void
    {
        static::created(function (Model $model) {
            static::logAudit($model, 'created', null, $model->toArray());
        });

        static::updated(function (Model $model) {
            $changes = $model->getChanges();
            $old = [];
            foreach ($changes as $key => $value) {
                if (isset($model->getOriginal()[$key])) {
                    $old[$key] = $model->getOriginal()[$key];
                }
            }
            static::logAudit($model, 'updated', $old ?: null, $changes);
        });

        static::deleted(function (Model $model) {
            static::logAudit($model, 'deleted', $model->toArray(), null);
        });

        static::restored(function (Model $model) {
            static::logAudit($model, 'restored', null, $model->toArray());
        });
    }

    protected static function logAudit(
        Model $model,
        string $event,
        ?array $oldValues,
        ?array $newValues
    ): void {
        $request = request();
        $user = $request?->user();

        AuditLog::create([
            'tenant_id' => $model->tenant_id ?? (method_exists($model, 'tenant') ? $model->tenant?->id : null),
            'user_id' => $user?->id,
            'event' => $event,
            'auditable_type' => get_class($model),
            'auditable_id' => $model->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }
}
