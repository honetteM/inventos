<?php

namespace App\Modules\Invoices\Services;

use App\Modules\Invoices\Models\Customer;
use Illuminate\Support\Facades\DB;

class CustomerService
{
    public function list(array $filters = [], int $perPage = 15)
    {
        $query = Customer::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['is_active'])) {
            $query->where('is_active', $filters['is_active'] === 'true' || $filters['is_active'] === true);
        }

        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortField, $sortDir);

        return $query->paginate($perPage);
    }

    public function updateBalance(Customer $customer): void
    {
        $totalInvoices = $customer->invoices()->where('status', '!=', 'draft')->sum('total');
        $totalPaid = $customer->receipts()->sum('amount');

        $customer->update([
            'total_purchases' => $totalInvoices,
            'balance' => $totalInvoices - $totalPaid,
        ]);
    }
}
