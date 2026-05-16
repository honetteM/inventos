<?php

namespace App\Modules\Inventory\Services;

use App\Modules\Inventory\Models\Category;

class CategoryService
{
    public function tree(): array
    {
        $categories = Category::withCount('products')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get();

        return $categories->map(function ($cat) {
            $children = Category::where('parent_id', $cat->id)
                ->withCount('products')
                ->orderBy('name')
                ->get();

            return array_merge($cat->toArray(), [
                'children' => $children->toArray(),
            ]);
        })->toArray();
    }
}
