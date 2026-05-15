<?php

namespace App\Modules\Inventory\Models;

use App\Traits\Auditable;
use App\Traits\MultiTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory, SoftDeletes, MultiTenant, Auditable;

    protected $fillable = [
        'tenant_id', 'category_id', 'name', 'sku', 'barcode',
        'description', 'cost_price', 'selling_price', 'unit', 'image', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'cost_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function warehouses()
    {
        return $this->belongsToMany(Warehouse::class, 'stock_warehouse')
            ->withPivot('quantity', 'cost')
            ->withTimestamps();
    }

    public function totalStock(): float
    {
        return (float) $this->warehouses()->sum('stock_warehouse.quantity');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLowStock($query, float $threshold = 10)
    {
        return $query->whereHas('warehouses', function ($q) use ($threshold) {
            $q->havingRaw('SUM(stock_warehouse.quantity) < ?', [$threshold]);
        });
    }
}
