<?php

namespace App\Modules\Inventory\Services;

use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Models\StockMovement;
use App\Modules\Inventory\Models\StockWarehouse;
use Illuminate\Support\Facades\DB;

class StockService
{
    public function moveStock(
        Product $product,
        Warehouse $warehouse,
        string $type,
        float $quantity,
        ?float $cost = null,
        ?string $reference = null,
        ?string $notes = null,
        ?string $invoiceUrl = null
    ): StockMovement {
        return DB::transaction(function () use ($product, $warehouse, $type, $quantity, $cost, $reference, $notes, $invoiceUrl) {
            $stock = StockWarehouse::firstOrCreate(
                [
                    'product_id' => $product->id,
                    'warehouse_id' => $warehouse->id,
                    'tenant_id' => $product->tenant_id,
                ],
                ['quantity' => 0, 'cost' => 0]
            );

            $before = (float) $stock->quantity;

            if (in_array($type, ['stock_out', 'transfer_out', 'adjustment_minus'])) {
                if ($stock->quantity < $quantity) {
                    throw new \RuntimeException('Insufficient stock. Available: ' . $stock->quantity . ', Requested: ' . $quantity);
                }
                $stock->decrement('quantity', $quantity);
            } elseif (in_array($type, ['stock_in', 'transfer_in', 'return', 'adjustment_plus'])) {
                $stock->increment('quantity', $quantity);
            } else {
                throw new \InvalidArgumentException("Invalid stock movement type: $type");
            }

            $after = (float) $stock->quantity;
            $stock->save();

            return StockMovement::create([
                'tenant_id' => $product->tenant_id,
                'product_id' => $product->id,
                'warehouse_id' => $warehouse->id,
                'user_id' => request()->user()?->id,
                'type' => $type,
                'quantity' => $quantity,
                'before_quantity' => $before,
                'after_quantity' => $after,
                'cost' => $cost ?? $product->cost_price,
                'reference' => $reference,
                'notes' => $notes,
                'invoice_url' => $invoiceUrl,
            ]);
        });
    }

    public function transferBetweenWarehouses(
        Product $product,
        Warehouse $from,
        Warehouse $to,
        float $quantity,
        ?string $notes = null
    ): array {
        return DB::transaction(function () use ($product, $from, $to, $quantity, $notes) {
            $out = $this->moveStock($product, $from, 'transfer_out', $quantity, null, null, $notes);
            $in = $this->moveStock($product, $to, 'transfer_in', $quantity, null, null, $notes);
            return ['out' => $out, 'in' => $in];
        });
    }

    public function getStockSummary(): array
    {
        $totalProducts = Product::count();
        $lowStockThreshold = 10;

        $lowStock = StockWarehouse::where('quantity', '<', $lowStockThreshold)
            ->where('quantity', '>', 0)
            ->count();

        $outOfStock = StockWarehouse::where('quantity', '<=', 0)->count();

        $model = new StockWarehouse;
        $table = $model->getTable();
        $totalValue = StockWarehouse::join('products', "$table.product_id", '=', 'products.id')
            ->selectRaw("SUM($table.quantity * products.cost_price) as total")
            ->value('total') ?? 0;

        return [
            'total_products' => $totalProducts,
            'low_stock' => $lowStock,
            'out_of_stock' => $outOfStock,
            'total_stock_value' => round((float) $totalValue, 2),
        ];
    }
}
