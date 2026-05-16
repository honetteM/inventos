<?php

namespace App\Modules\Inventory\Models;

use App\Traits\Auditable;
use App\Traits\MultiTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Warehouse extends Model
{
    use HasFactory, SoftDeletes, MultiTenant, Auditable;

    protected $fillable = [
        'tenant_id', 'name', 'code', 'description', 'address', 'phone', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'stock_warehouse')
            ->withPivot('quantity', 'cost')
            ->withTimestamps();
    }
}
