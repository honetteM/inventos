<?php

namespace App\Modules\Inventory\Models;

use App\Traits\MultiTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StockWarehouse extends Model
{
    use HasFactory, MultiTenant;

    protected $table = 'stock_warehouse';

    protected $fillable = [
        'tenant_id', 'product_id', 'warehouse_id', 'quantity', 'cost',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
            'cost' => 'decimal:2',
        ];
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
}
