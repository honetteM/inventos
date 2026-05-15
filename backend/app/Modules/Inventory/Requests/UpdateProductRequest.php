<?php

namespace App\Modules\Inventory\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('edit products');
    }

    public function rules(): array
    {
        $productId = $this->route('product');
        if ($productId instanceof \App\Modules\Inventory\Models\Product) {
            $productId = $productId->id;
        }
        return [
            'category_id' => ['nullable', 'exists:categories,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'sku' => ['nullable', 'string', 'max:100', 'unique:products,sku,' . $productId . ',id,tenant_id,' . tenant_id()],
            'barcode' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:5000'],
            'cost_price' => ['nullable', 'numeric', 'min:0'],
            'selling_price' => ['nullable', 'numeric', 'min:0'],
            'unit' => ['nullable', 'string', 'max:50'],
            'image' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ];
    }
}
