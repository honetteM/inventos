<?php

namespace App\Modules\Inventory\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StockMovementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('move stock');
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'exists:products,id'],
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'type' => ['required', 'string', 'in:stock_in,stock_out,adjustment_plus,adjustment_minus,return'],
            'quantity' => ['required', 'numeric', 'min:0.001'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'reference' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'invoice_url' => ['nullable', 'string', 'max:500'],
        ];
    }
}
