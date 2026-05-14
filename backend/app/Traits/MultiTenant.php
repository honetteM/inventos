<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

trait MultiTenant
{
    protected static function bootMultiTenant(): void
    {
        static::creating(function (Model $model) {
            $tenantId = static::getTenantId();
            if ($tenantId && !$model->tenant_id) {
                $model->tenant_id = $tenantId;
            }
        });

        static::addGlobalScope('tenant', function (Builder $builder) {
            $tenantId = static::getTenantId();
            if ($tenantId) {
                $builder->where('tenant_id', $tenantId);
            }
        });
    }

    protected static function getTenantId(): ?int
    {
        $request = request();
        $user = $request?->user();
        if ($user && $user->tenant_id) {
            return $user->tenant_id;
        }

        $header = $request?->header('X-Tenant-Id');
        if ($header) {
            return (int) $header;
        }

        return null;
    }
}
