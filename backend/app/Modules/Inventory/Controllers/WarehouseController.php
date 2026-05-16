<?php

namespace App\Modules\Inventory\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Requests\StoreWarehouseRequest;
use App\Modules\Inventory\Resources\WarehouseResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $warehouses = Warehouse::withCount('products')
            ->orderBy('name')
            ->paginate($request->input('per_page', 50));

        return response()->json([
            'data' => WarehouseResource::collection($warehouses->items()),
            'meta' => [
                'current_page' => $warehouses->currentPage(),
                'last_page' => $warehouses->lastPage(),
                'per_page' => $warehouses->perPage(),
                'total' => $warehouses->total(),
            ],
        ]);
    }

    public function show(Warehouse $warehouse): JsonResponse
    {
        $warehouse->loadCount('products');

        return response()->json([
            'data' => new WarehouseResource($warehouse),
        ]);
    }

    public function store(StoreWarehouseRequest $request): JsonResponse
    {
        $warehouse = Warehouse::create(array_merge(
            $request->validated(),
            ['tenant_id' => $request->user()->tenant_id]
        ));

        return response()->json([
            'message' => 'Warehouse created successfully',
            'data' => new WarehouseResource($warehouse),
        ], 201);
    }

    public function update(Request $request, Warehouse $warehouse): JsonResponse
    {
        if ($request->filled('last_known_updated_at')) {
            $lastKnown = $request->input('last_known_updated_at');
            if ($warehouse->updated_at->toISOString() !== $lastKnown) {
                return response()->json([
                    'message' => 'Conflict: the warehouse was modified by another user. Please refresh and try again.',
                    'data' => new WarehouseResource($warehouse->fresh()),
                ], 409);
            }
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50', 'unique:warehouses,code,' . $warehouse->id . ',id,tenant_id,' . $request->user()->tenant_id],
            'description' => ['nullable', 'string', 'max:1000'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
        ]);

        $warehouse->update($validated);

        return response()->json([
            'message' => 'Warehouse updated successfully',
            'data' => new WarehouseResource($warehouse->fresh()),
        ]);
    }

    public function destroy(Warehouse $warehouse): JsonResponse
    {
        if ($warehouse->products()->exists()) {
            return response()->json([
                'message' => 'Cannot delete warehouse with associated stock',
            ], 422);
        }

        $warehouse->delete();

        return response()->json([
            'message' => 'Warehouse deleted successfully',
        ]);
    }
}
