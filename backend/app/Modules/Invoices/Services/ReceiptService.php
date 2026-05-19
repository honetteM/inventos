<?php

namespace App\Modules\Invoices\Services;

use App\Modules\Invoices\Models\Receipt;
use App\Modules\Invoices\Models\Invoice;
use App\Modules\Invoices\Models\Customer;
use Illuminate\Support\Facades\DB;

class ReceiptService
{
    public function list(array $filters = [], int $perPage = 15)
    {
        $query = Receipt::with(['invoice', 'customer']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('receipt_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['invoice_id'])) {
            $query->where('invoice_id', $filters['invoice_id']);
        }

        if (!empty($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }

        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortField, $sortDir);

        return $query->paginate($perPage);
    }

    public function createReceipt(array $data): Receipt
    {
        return DB::transaction(function () use ($data) {
            $data['receipt_number'] = $data['receipt_number'] ?? $this->generateNumber();
            $receipt = Receipt::create($data);

            if (!empty($data['invoice_id'])) {
                $invoice = Invoice::findOrFail($data['invoice_id']);
                $invoice->increment('paid_amount', $data['amount']);
                $invoice->decrement('balance_due', $data['amount']);

                if ($invoice->balance_due <= 0) {
                    $invoice->update(['status' => 'paid']);
                } elseif ($invoice->paid_amount > 0) {
                    $invoice->update(['status' => 'partial']);
                }
            }

            if (!empty($data['customer_id'])) {
                $customer = Customer::find($data['customer_id']);
                if ($customer) {
                    app(CustomerService::class)->updateBalance($customer);
                }
            }

            return $receipt->load(['invoice', 'customer']);
        });
    }

    public function generateNumber(): string
    {
        $prefix = 'RCP-';
        $year = now()->format('Y');
        $month = now()->format('m');
        $last = Receipt::whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();

        return $prefix . $year . $month . '-' . str_pad($last + 1, 5, '0', STR_PAD_LEFT);
    }
}
