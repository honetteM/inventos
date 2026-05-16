<?php

namespace App\Modules\Inventory\Services;

use App\Modules\Inventory\Models\Warehouse;

class WarehouseService
{
    public function listWithStock(int $tenantId): array
    {
        return Warehouse::where('tenant_id', $tenantId)
            ->withCount(['products'])
            ->orderBy('name')
            ->get()
            ->toArray();
    }
}
