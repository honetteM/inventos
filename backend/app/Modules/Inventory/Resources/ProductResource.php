<?php

namespace App\Modules\Inventory\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tenant_id' => $this->tenant_id,
            'category_id' => $this->category_id,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'name' => $this->name,
            'sku' => $this->sku,
            'barcode' => $this->barcode,
            'description' => $this->description,
            'cost_price' => (float) $this->cost_price,
            'selling_price' => (float) $this->selling_price,
            'unit' => $this->unit,
            'image' => $this->image,
            'is_active' => $this->is_active,
            'total_stock' => $this->relationLoaded('warehouses') ? (float) $this->warehouses->sum('pivot.quantity') : 0,
            'warehouses' => WarehouseResource::collection($this->whenLoaded('warehouses')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
