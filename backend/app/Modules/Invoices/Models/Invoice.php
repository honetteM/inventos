<?php

namespace App\Modules\Invoices\Models;

use App\Modules\Inventory\Models\StockMovement;
use App\Traits\Auditable;
use App\Traits\MultiTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Invoice extends Model
{
    use HasFactory, SoftDeletes, MultiTenant, Auditable;

    protected $fillable = [
        'tenant_id', 'customer_id', 'invoice_number', 'status',
        'issue_date', 'due_date', 'subtotal', 'discount', 'tax',
        'total', 'paid_amount', 'balance_due', 'notes', 'currency',
        'payment_method', 'payment_status',
    ];

    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'due_date' => 'date',
            'subtotal' => 'decimal:2',
            'discount' => 'decimal:2',
            'tax' => 'decimal:2',
            'total' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'balance_due' => 'decimal:2',
        ];
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function receipts()
    {
        return $this->hasMany(Receipt::class);
    }

    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class, 'invoice_id');
    }

    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
