<?php

namespace App\Modules\Invoices\Services;

use App\Modules\Invoices\Models\Quotation;
use Illuminate\Support\Facades\DB;

class QuotationService
{
    public function list(array $filters = [], int $perPage = 15)
    {
        $query = Quotation::with('customer');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('quotation_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortField, $sortDir);

        return $query->paginate($perPage);
    }

    public function generateNumber(): string
    {
        $prefix = 'QTN-';
        $year = now()->format('Y');
        $month = now()->format('m');
        $last = Quotation::whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();

        return $prefix . $year . $month . '-' . str_pad($last + 1, 5, '0', STR_PAD_LEFT);
    }
}
