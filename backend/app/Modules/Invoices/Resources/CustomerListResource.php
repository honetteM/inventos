<?php

namespace App\Modules\Invoices\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'total_purchases' => (float) $this->total_purchases,
            'balance' => (float) $this->balance,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
        ];
    }
}
