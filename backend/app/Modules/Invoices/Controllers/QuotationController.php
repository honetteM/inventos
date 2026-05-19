<?php

namespace App\Modules\Invoices\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Invoices\Models\Quotation;
use App\Modules\Invoices\Services\QuotationService;
use App\Modules\Invoices\Requests\StoreQuotationRequest;
use App\Modules\Invoices\Resources\QuotationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuotationController extends Controller
{
    public function __construct(
        private readonly QuotationService $quotationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $quotations = $this->quotationService->list(
            $request->only(['search', 'status', 'customer_id', 'sort_by', 'sort_dir']),
            (int) $request->input('per_page', 15)
        );

        return response()->json([
            'data' => QuotationResource::collection($quotations->items()),
            'meta' => [
                'current_page' => $quotations->currentPage(),
                'last_page' => $quotations->lastPage(),
                'per_page' => $quotations->perPage(),
                'total' => $quotations->total(),
            ],
        ]);
    }

    public function show(Quotation $quotation): JsonResponse
    {
        $quotation->load('customer');

        return response()->json([
            'data' => new QuotationResource($quotation),
        ]);
    }

    public function store(StoreQuotationRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['tenant_id'] = $request->user()->tenant_id;
        $data['quotation_number'] = $this->quotationService->generateNumber();

        $quotation = Quotation::create($data);

        return response()->json([
            'message' => 'Quotation created successfully',
            'data' => new QuotationResource($quotation),
        ], 201);
    }

    public function update(StoreQuotationRequest $request, Quotation $quotation): JsonResponse
    {
        $quotation->update($request->validated());

        return response()->json([
            'message' => 'Quotation updated successfully',
            'data' => new QuotationResource($quotation->fresh()->load('customer')),
        ]);
    }

    public function destroy(Quotation $quotation): JsonResponse
    {
        $quotation->delete();

        return response()->json([
            'message' => 'Quotation deleted successfully',
        ]);
    }
}
