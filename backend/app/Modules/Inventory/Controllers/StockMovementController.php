<?php

namespace App\Modules\Inventory\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Models\StockMovement;
use App\Modules\Inventory\Services\StockService;
use App\Modules\Inventory\Requests\StockMovementRequest;
use App\Modules\Inventory\Requests\TransferStockRequest;
use App\Modules\Inventory\Resources\StockMovementResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockMovementController extends Controller
{
    public function __construct(
        private readonly StockService $stockService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = StockMovement::with(['product', 'warehouse', 'user']);

        if ($request->filled('product_id')) {
            $query->where('product_id', $request->input('product_id'));
        }

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->input('warehouse_id'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        $movements = $query->latest()->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => StockMovementResource::collection($movements->items()),
            'meta' => [
                'current_page' => $movements->currentPage(),
                'last_page' => $movements->lastPage(),
                'per_page' => $movements->perPage(),
                'total' => $movements->total(),
            ],
        ]);
    }

    public function store(StockMovementRequest $request): JsonResponse
    {
        $product = Product::findOrFail($request->input('product_id'));
        $warehouse = Warehouse::findOrFail($request->input('warehouse_id'));

        try {
            $movement = $this->stockService->moveStock(
                $product,
                $warehouse,
                $request->input('type'),
                (float) $request->input('quantity'),
                $request->filled('cost') ? (float) $request->input('cost') : null,
                $request->input('reference'),
                $request->input('notes'),
                $request->input('invoice_url')
            );

            return response()->json([
                'message' => 'Stock movement recorded successfully',
                'data' => new StockMovementResource($movement->load(['product', 'warehouse'])),
            ], 201);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function transfer(TransferStockRequest $request): JsonResponse
    {
        $product = Product::findOrFail($request->input('product_id'));
        $from = Warehouse::findOrFail($request->input('from_warehouse_id'));
        $to = Warehouse::findOrFail($request->input('to_warehouse_id'));

        try {
            $result = $this->stockService->transferBetweenWarehouses(
                $product,
                $from,
                $to,
                (float) $request->input('quantity'),
                $request->input('notes')
            );

            return response()->json([
                'message' => 'Stock transferred successfully',
                'data' => [
                    'out' => new StockMovementResource($result['out']->load(['product', 'warehouse'])),
                    'in' => new StockMovementResource($result['in']->load(['product', 'warehouse'])),
                ],
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function summary(Request $request): JsonResponse
    {
        $summary = $this->stockService->getStockSummary();

        return response()->json([
            'data' => $summary,
        ]);
    }
}
