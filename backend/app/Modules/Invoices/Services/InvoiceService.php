<?php

namespace App\Modules\Invoices\Services;

use App\Modules\Invoices\Models\Invoice;
use App\Modules\Invoices\Models\Receipt;
use App\Modules\Invoices\Models\Customer;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Services\StockService;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    public function __construct(
        private readonly StockService $stockService
    ) {}

    public function list(array $filters = [], int $perPage = 15)
    {
        $query = Invoice::with(['customer', 'items']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('issue_date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('issue_date', '<=', $filters['date_to']);
        }

        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortField, $sortDir);

        return $query->paginate($perPage);
    }

    public function createWithItems(array $data, array $items): Invoice
    {
        return DB::transaction(function () use ($data, $items) {
            $data['invoice_number'] = $this->generateNumber();

            $subtotal = 0;
            $itemDetails = [];
            foreach ($items as $item) {
                $qty = (float) $item['quantity'];
                $price = (float) $item['unit_price'];
                $discount = (float) ($item['discount'] ?? 0);
                $tax = (float) ($item['tax'] ?? 0);
                $itemSubtotal = ($qty * $price) - $discount;
                $itemTotal = $itemSubtotal + $tax;
                $subtotal += $itemSubtotal;

                $itemDetails[] = [
                    'product_id' => $item['product_id'] ?? null,
                    'description' => $item['description'],
                    'quantity' => $qty,
                    'unit_price' => $price,
                    'discount' => $discount,
                    'tax' => $tax,
                    'subtotal' => $itemSubtotal,
                    'total' => $itemTotal,
                ];
            }

            $discount = (float) ($data['discount'] ?? 0);
            $tax = (float) ($data['tax'] ?? 0);
            $total = $subtotal - $discount + $tax;

            $paymentMethod = $data['payment_method'] ?? null;
            $isPaid = $paymentMethod && $paymentMethod !== 'credit';

            $invoice = Invoice::create([
                'tenant_id' => $data['tenant_id'],
                'customer_id' => $data['customer_id'] ?? null,
                'invoice_number' => $data['invoice_number'],
                'status' => 'draft',
                'issue_date' => $data['issue_date'],
                'due_date' => $data['due_date'] ?? null,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
                'paid_amount' => 0,
                'balance_due' => $total,
                'payment_method' => $paymentMethod,
                'payment_status' => 'unpaid',
                'notes' => $data['notes'] ?? null,
                'currency' => $data['currency'] ?? 'RWF',
            ]);

            foreach ($itemDetails as $item) {
                $invoice->items()->create($item);
            }

            $invoice->load('items');

            if ($isPaid) {
                $defaultWarehouse = $this->getDefaultWarehouse();

                foreach ($invoice->items as $item) {
                    if (!$item->product_id) continue;

                    $product = Product::findOrFail($item->product_id);
                    $warehouse = $defaultWarehouse;

                    if ($warehouse) {
                        $this->stockService->moveStock(
                            $product,
                            $warehouse,
                            'stock_out',
                            (float) $item->quantity,
                            (float) $item->unit_price,
                            $invoice->invoice_number,
                            "Sale: {$invoice->invoice_number} - {$item->description}",
                            null,
                            $invoice->id
                        );
                    }
                }

                $receiptCount = Receipt::whereYear('created_at', now()->year)
                    ->whereMonth('created_at', now()->month)
                    ->count();

                $invoice->receipts()->create([
                    'tenant_id' => $data['tenant_id'],
                    'customer_id' => $data['customer_id'] ?? null,
                    'receipt_number' => 'RCP-' . now()->format('Ym') . '-' . str_pad($receiptCount + 1, 5, '0', STR_PAD_LEFT),
                    'amount' => $total,
                    'payment_method' => $paymentMethod,
                    'receipt_date' => $data['issue_date'] ?? now()->toDateString(),
                ]);

                $invoice->update([
                    'paid_amount' => $total,
                    'balance_due' => 0,
                    'status' => 'paid',
                    'payment_status' => 'paid',
                ]);

                if ($invoice->customer_id) {
                    $customer = Customer::find($invoice->customer_id);
                    if ($customer) {
                        app(CustomerService::class)->updateBalance($customer);
                    }
                }
            }

            return $invoice->fresh()->load(['items', 'customer', 'receipts']);
        });
    }

    public function confirm(Invoice $invoice): Invoice
    {
        return DB::transaction(function () use ($invoice) {
            if ($invoice->status !== 'draft') {
                throw new \RuntimeException('Only draft invoices can be confirmed');
            }

            $invoice->load('items');
            $defaultWarehouse = $this->getDefaultWarehouse();

            foreach ($invoice->items as $item) {
                if (!$item->product_id) {
                    throw new \RuntimeException(
                        "Item '{$item->description}' has no product linked. Select a product to continue."
                    );
                }

                $product = Product::findOrFail($item->product_id);
                $warehouseId = request()->input('warehouse_id', $defaultWarehouse?->id);

                if (!$warehouseId) {
                    throw new \RuntimeException('No warehouse selected. Create a warehouse first.');
                }

                $warehouse = Warehouse::findOrFail($warehouseId);

                $this->stockService->moveStock(
                    $product,
                    $warehouse,
                    'stock_out',
                    (float) $item->quantity,
                    (float) $item->unit_price,
                    $invoice->invoice_number,
                    "Sale: {$invoice->invoice_number} - {$item->description}",
                    null,
                    $invoice->id
                );
            }

            $invoice->update(['status' => 'confirmed']);

            if ($invoice->customer_id) {
                $customer = Customer::find($invoice->customer_id);
                if ($customer) {
                    app(CustomerService::class)->updateBalance($customer);
                }
            }

            return $invoice->fresh()->load(['items', 'customer']);
        });
    }

    public function cancel(Invoice $invoice): Invoice
    {
        return DB::transaction(function () use ($invoice) {
            if (!in_array($invoice->status, ['draft', 'confirmed'])) {
                throw new \RuntimeException('Only draft or confirmed invoices can be cancelled');
            }

            $invoice->update(['status' => 'cancelled']);

            if ($invoice->customer_id) {
                $customer = Customer::find($invoice->customer_id);
                if ($customer) {
                    app(CustomerService::class)->updateBalance($customer);
                }
            }

            return $invoice->fresh();
        });
    }

    private function getDefaultWarehouse(): ?Warehouse
    {
        return Warehouse::where('tenant_id', tenant_id())->first();
    }

    public function generateNumber(): string
    {
        $prefix = 'INV-';
        $year = now()->format('Y');
        $month = now()->format('m');
        $max = Invoice::whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->max('invoice_number');

        if ($max) {
            $parts = explode('-', $max);
            $num = (int) end($parts) + 1;
        } else {
            $num = 1;
        }

        return $prefix . $year . $month . '-' . str_pad($num, 5, '0', STR_PAD_LEFT);
    }
}
