<?php

namespace App\Modules\Inventory\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockMovementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product' => new ProductListResource($this->whenLoaded('product')),
            'warehouse_id' => $this->warehouse_id,
            'warehouse' => new WarehouseResource($this->whenLoaded('warehouse')),
            'user_id' => $this->user_id,
            'type' => $this->type,
            'quantity' => (float) $this->quantity,
            'before_quantity' => (float) $this->before_quantity,
            'after_quantity' => (float) $this->after_quantity,
            'cost' => (float) $this->cost,
            'reference' => $this->reference,
            'notes' => $this->notes,
            'invoice_url' => $this->invoice_url,
            'created_at' => $this->created_at,
        ];
    }
}
