<?php

namespace App\Modules\Inventory\Models;

use App\Models\User;
use App\Traits\MultiTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StockMovement extends Model
{
    use HasFactory, MultiTenant;

    protected $fillable = [
        'tenant_id', 'product_id', 'warehouse_id', 'invoice_id', 'user_id',
        'type', 'quantity', 'before_quantity', 'after_quantity',
        'cost', 'reference', 'notes', 'invoice_url',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
            'before_quantity' => 'decimal:3',
            'after_quantity' => 'decimal:3',
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

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
