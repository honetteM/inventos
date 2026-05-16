<?php

namespace App\Modules\Inventory\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'products_count' => $this->whenCounted('products', fn() => (int) $this->products_count),
            'children' => CategoryResource::collection($this->whenLoaded('children')),
            'created_at' => $this->created_at,
        ];
    }
}
