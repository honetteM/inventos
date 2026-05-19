<?php

namespace App\Modules\Invoices\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Invoices\Models\Customer;
use App\Modules\Invoices\Services\CustomerService;
use App\Modules\Invoices\Requests\StoreCustomerRequest;
use App\Modules\Invoices\Requests\UpdateCustomerRequest;
use App\Modules\Invoices\Resources\CustomerResource;
use App\Modules\Invoices\Resources\CustomerListResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function __construct(
        private readonly CustomerService $customerService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $customers = $this->customerService->list(
            $request->only(['search', 'is_active', 'sort_by', 'sort_dir']),
            (int) $request->input('per_page', 15)
        );

        return response()->json([
            'data' => CustomerListResource::collection($customers->items()),
            'meta' => [
                'current_page' => $customers->currentPage(),
                'last_page' => $customers->lastPage(),
                'per_page' => $customers->perPage(),
                'total' => $customers->total(),
            ],
        ]);
    }

    public function show(Customer $customer): JsonResponse
    {
        $customer->loadCount('invoices');

        return response()->json([
            'data' => new CustomerResource($customer),
        ]);
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['tenant_id'] = $request->user()->tenant_id;

        $customer = Customer::create($data);

        return response()->json([
            'message' => 'Customer created successfully',
            'data' => new CustomerResource($customer),
        ], 201);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): JsonResponse
    {
        $customer->update($request->validated());

        return response()->json([
            'message' => 'Customer updated successfully',
            'data' => new CustomerResource($customer->fresh()),
        ]);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();

        return response()->json([
            'message' => 'Customer deleted successfully',
        ]);
    }
}
