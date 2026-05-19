<?php

namespace App\Modules\Invoices\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Invoices\Models\Receipt;
use App\Modules\Invoices\Services\ReceiptService;
use App\Modules\Invoices\Requests\StoreReceiptRequest;
use App\Modules\Invoices\Resources\ReceiptResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReceiptController extends Controller
{
    public function __construct(
        private readonly ReceiptService $receiptService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $receipts = $this->receiptService->list(
            $request->only(['search', 'invoice_id', 'payment_method', 'sort_by', 'sort_dir']),
            (int) $request->input('per_page', 15)
        );

        return response()->json([
            'data' => ReceiptResource::collection($receipts->items()),
            'meta' => [
                'current_page' => $receipts->currentPage(),
                'last_page' => $receipts->lastPage(),
                'per_page' => $receipts->perPage(),
                'total' => $receipts->total(),
            ],
        ]);
    }

    public function show(Receipt $receipt): JsonResponse
    {
        $receipt->load(['invoice', 'customer']);

        return response()->json([
            'data' => new ReceiptResource($receipt),
        ]);
    }

    public function store(StoreReceiptRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['tenant_id'] = $request->user()->tenant_id;

        $receipt = $this->receiptService->createReceipt($data);

        return response()->json([
            'message' => 'Receipt created successfully',
            'data' => new ReceiptResource($receipt),
        ], 201);
    }

    public function destroy(Receipt $receipt): JsonResponse
    {
        $receipt->delete();

        return response()->json([
            'message' => 'Receipt deleted successfully',
        ]);
    }
}
