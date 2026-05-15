<?php

namespace App\Modules\Inventory\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'sku' => $this->sku,
            'barcode' => $this->barcode,
            'selling_price' => (float) $this->selling_price,
            'cost_price' => (float) $this->cost_price,
            'unit' => $this->unit,
            'is_active' => $this->is_active,
            'total_stock' => $this->relationLoaded('warehouses') ? (float) $this->warehouses->sum('pivot.quantity') : 0,
            'category_name' => $this->whenLoaded('category', fn() => $this->category?->name),
            'created_at' => $this->created_at,
        ];
    }
}
