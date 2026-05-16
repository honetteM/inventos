<?php

namespace App\Modules\Inventory\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create categories');
    }

    public function rules(): array
    {
        return [
            'parent_id' => ['nullable', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', 'unique:categories,slug,NULL,id,tenant_id,' . tenant_id()],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['boolean'],
        ];
    }
}
