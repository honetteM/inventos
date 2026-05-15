<?php

namespace App\Modules\Inventory\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Inventory\Models\Category;
use App\Modules\Inventory\Services\CategoryService;
use App\Modules\Inventory\Requests\StoreCategoryRequest;
use App\Modules\Inventory\Resources\CategoryResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function __construct(
        private readonly CategoryService $categoryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        if ($request->boolean('tree')) {
            return response()->json([
                'data' => $this->categoryService->tree(),
            ]);
        }

        $categories = Category::withCount('products')
            ->orderBy('name')
            ->paginate($request->input('per_page', 50));

        return response()->json([
            'data' => CategoryResource::collection($categories->items()),
            'meta' => [
                'current_page' => $categories->currentPage(),
                'last_page' => $categories->lastPage(),
                'per_page' => $categories->perPage(),
                'total' => $categories->total(),
            ],
        ]);
    }

    public function show(Category $category): JsonResponse
    {
        $category->loadCount('products');

        return response()->json([
            'data' => new CategoryResource($category),
        ]);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        $data['tenant_id'] = $request->user()->tenant_id;

        $category = Category::create($data);

        return response()->json([
            'message' => 'Category created successfully',
            'data' => new CategoryResource($category),
        ], 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'parent_id' => ['nullable', 'exists:categories,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'unique:categories,slug,' . $category->id . ',id,tenant_id,' . $request->user()->tenant_id],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['boolean'],
        ]);

        $category->update($validated);

        return response()->json([
            'message' => 'Category updated successfully',
            'data' => new CategoryResource($category->fresh()),
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'Cannot delete category with associated products',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully',
        ]);
    }
}
