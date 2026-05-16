<?php

namespace App\Modules\Inventory\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransferStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('move stock');
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'from_warehouse_id' => ['required', 'exists:warehouses,id', 'different:to_warehouse_id'],
            'to_warehouse_id' => ['required', 'exists:warehouses,id'],
            'quantity' => ['required', 'numeric', 'min:0.001'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
