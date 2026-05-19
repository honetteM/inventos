<?php

namespace App\Modules\Invoices\Models;

use App\Traits\Auditable;
use App\Traits\MultiTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Customer extends Model
{
    use HasFactory, SoftDeletes, MultiTenant, Auditable;

    protected $fillable = [
        'tenant_id', 'name', 'email', 'phone', 'address',
        'tax_id', 'credit_limit', 'total_purchases', 'balance',
        'notes', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'credit_limit' => 'decimal:2',
            'total_purchases' => 'decimal:2',
            'balance' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function quotations()
    {
        return $this->hasMany(Quotation::class);
    }

    public function receipts()
    {
        return $this->hasMany(Receipt::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
