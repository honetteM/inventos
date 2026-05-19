<?php

namespace App\Modules\Invoices\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'customer_name' => $this->customer?->name,
            'status' => $this->status,
            'issue_date' => $this->issue_date,
            'total' => (float) $this->total,
            'balance_due' => (float) $this->balance_due,
            'paid_amount' => (float) $this->paid_amount,
            'payment_method' => $this->payment_method,
            'payment_status' => $this->payment_status,
            'created_at' => $this->created_at,
        ];
    }
}
