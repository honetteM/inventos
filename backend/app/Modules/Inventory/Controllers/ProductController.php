<?php

namespace App\Modules\Inventory\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Product;
use App\Modules\Inventory\Services\ProductService;
use App\Modules\Inventory\Requests\StoreProductRequest;
use App\Modules\Inventory\Requests\UpdateProductRequest;
use App\Modules\Inventory\Resources\ProductResource;
use App\Modules\Inventory\Resources\ProductListResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        private readonly ProductService $productService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $products = $this->productService->list(
            $request->only(['search', 'category_id', 'is_active', 'low_stock', 'sort_by', 'sort_dir']),
            (int) $request->input('per_page', 15)
        );

        return response()->json([
            'data' => ProductListResource::collection($products->items()),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load(['category', 'warehouses', 'stockMovements' => function ($q) {
            $q->latest()->limit(20);
        }]);

        return response()->json([
            'data' => new ProductResource($product),
        ]);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['tenant_id'] = $request->user()->tenant_id;

        if (empty($data['sku'])) {
            $count = Product::where('tenant_id', $data['tenant_id'])->withTrashed()->count();
            $data['sku'] = 'PRD-' . str_pad($count + 1, 6, '0', STR_PAD_LEFT);
        }

        if (empty($data['barcode'])) {
            $data['barcode'] = (string) str_pad(mt_rand(1, 9999999999999), 13, '0', STR_PAD_LEFT);
        }

        $product = Product::create($data);

        return response()->json([
            'message' => 'Product created successfully',
            'data' => new ProductResource($product),
        ], 201);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $product->update($request->validated());

        return response()->json([
            'message' => 'Product updated successfully',
            'data' => new ProductResource($product->fresh()->load(['category', 'warehouses'])),
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }

    public function byBarcode(Request $request): JsonResponse
    {
        $request->validate(['barcode' => 'required|string|max:100']);

        $product = $this->productService->findByBarcode($request->input('barcode'));

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json([
            'data' => new ProductResource($product->load(['category', 'warehouses'])),
        ]);
    }

    public function bySku(Request $request): JsonResponse
    {
        $request->validate(['sku' => 'required|string|max:100']);

        $product = $this->productService->findBySku($request->input('sku'));

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        return response()->json([
            'data' => new ProductResource($product->load(['category', 'warehouses'])),
        ]);
    }
}
