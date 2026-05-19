<?php

namespace App\Modules\Invoices\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tenant_id' => $this->tenant_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'tax_id' => $this->tax_id,
            'credit_limit' => (float) $this->credit_limit,
            'total_purchases' => (float) $this->total_purchases,
            'balance' => (float) $this->balance,
            'notes' => $this->notes,
            'is_active' => $this->is_active,
            'invoices_count' => $this->whenCounted('invoices'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
