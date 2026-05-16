<?php

namespace App\Modules\Inventory\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WarehouseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'address' => $this->address,
            'phone' => $this->phone,
            'is_active' => $this->is_active,
            'products_count' => $this->whenCounted('products', fn() => (int) $this->products_count),
            'pivot' => $this->when($this->pivot, fn() => [
                'quantity' => (float) $this->pivot->quantity,
                'cost' => (float) $this->pivot->cost,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
