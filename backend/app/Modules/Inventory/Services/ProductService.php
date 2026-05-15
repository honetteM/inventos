<?php

namespace App\Modules\Inventory\Services;

use App\Modules\Inventory\Models\Product;
use Illuminate\Support\Facades\DB;

class ProductService
{
    public function list(array $filters = [], int $perPage = 15)
    {
        $query = Product::with(['category', 'warehouses']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['is_active'])) {
            $query->where('is_active', $filters['is_active'] === 'true' || $filters['is_active'] === true);
        }

        if (!empty($filters['low_stock'])) {
            $query->whereHas('warehouses', function ($q) {
                $q->havingRaw('SUM(stock_warehouse.quantity) < 10');
            });
        }

        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortField, $sortDir);

        return $query->paginate($perPage);
    }

    public function findByBarcode(string $barcode): ?Product
    {
        return Product::with(['category', 'warehouses'])
            ->where('barcode', $barcode)
            ->first();
    }

    public function findBySku(string $sku): ?Product
    {
        return Product::with(['category', 'warehouses'])
            ->where('sku', $sku)
            ->first();
    }

    public function duplicateExists(string $sku, ?int $excludeId = null): bool
    {
        $query = Product::where('sku', $sku);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        return $query->exists();
    }
}
