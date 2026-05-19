<?php

namespace App\Modules\Invoices\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Invoices\Models\Invoice;
use App\Modules\Invoices\Services\InvoiceService;
use App\Modules\Invoices\Requests\StoreInvoiceRequest;
use App\Modules\Invoices\Requests\UpdateInvoiceRequest;
use App\Modules\Invoices\Resources\InvoiceResource;
use App\Modules\Invoices\Resources\InvoiceListResource;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function __construct(
        private readonly InvoiceService $invoiceService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $invoices = $this->invoiceService->list(
            $request->only(['search', 'status', 'customer_id', 'date_from', 'date_to', 'sort_by', 'sort_dir']),
            (int) $request->input('per_page', 15)
        );

        return response()->json([
            'data' => InvoiceListResource::collection($invoices->items()),
            'meta' => [
                'current_page' => $invoices->currentPage(),
                'last_page' => $invoices->lastPage(),
                'per_page' => $invoices->perPage(),
                'total' => $invoices->total(),
            ],
        ]);
    }

    public function show(Invoice $invoice): JsonResponse
    {
        $invoice->load(['items', 'customer', 'receipts', 'stockMovements']);

        return response()->json([
            'data' => new InvoiceResource($invoice),
        ]);
    }

    public function store(StoreInvoiceRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['tenant_id'] = $request->user()->tenant_id;

        $items = $data['items'];
        unset($data['items']);

        $invoice = $this->invoiceService->createWithItems($data, $items);

        return response()->json([
            'message' => 'Invoice created successfully',
            'data' => new InvoiceResource($invoice),
        ], 201);
    }

    public function update(UpdateInvoiceRequest $request, Invoice $invoice): JsonResponse
    {
        if ($request->filled('status')) {
            $newStatus = $request->input('status');

            if ($newStatus === 'confirmed' && $invoice->status === 'draft') {
                $invoice = $this->invoiceService->confirm($invoice);

                return response()->json([
                    'message' => 'Invoice confirmed and stock deducted successfully',
                    'data' => new InvoiceResource($invoice),
                ]);
            }

            if ($newStatus === 'cancelled') {
                $invoice = $this->invoiceService->cancel($invoice);

                return response()->json([
                    'message' => 'Invoice cancelled successfully',
                    'data' => new InvoiceResource($invoice),
                ]);
            }
        }

        $data = $request->validated();
        $items = $data['items'] ?? null;
        unset($data['items'], $data['status']);

        $invoice->update($data);

        if ($items) {
            $invoice->items()->delete();
            foreach ($items as $item) {
                $itemSubtotal = $item['quantity'] * $item['unit_price'];
                $itemDiscount = $item['discount'] ?? 0;
                $itemTax = $item['tax'] ?? 0;
                $itemTotal = $itemSubtotal - $itemDiscount + $itemTax;

                $invoice->items()->create([
                    'product_id' => $item['product_id'] ?? null,
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'discount' => $itemDiscount,
                    'tax' => $itemTax,
                    'subtotal' => $itemSubtotal - $itemDiscount,
                    'total' => $itemTotal,
                ]);
            }

            $invoice->refresh();
            $subtotal = $invoice->items()->sum('subtotal');
            $total = $invoice->items()->sum('total');
            $invoice->update([
                'subtotal' => $subtotal,
                'total' => $total,
            ]);
        }

        return response()->json([
            'message' => 'Invoice updated successfully',
            'data' => new InvoiceResource($invoice->fresh()->load(['items', 'customer'])),
        ]);
    }

    public function confirm(Request $request, Invoice $invoice): JsonResponse
    {
        try {
            $invoice = $this->invoiceService->confirm($invoice);
            $invoice->load(['items', 'customer', 'stockMovements']);

            return response()->json([
                'message' => 'Invoice confirmed and stock deducted successfully',
                'data' => new InvoiceResource($invoice),
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function downloadPdf(Request $request, Invoice $invoice)
    {
        try {
            $invoice->load(['items', 'customer', 'receipts']);
            $tenant = $request->user()->tenant;

            $pdf = Pdf::loadView('invoices.pdf', [
                'invoice' => $invoice,
                'tenant' => $tenant,
            ]);

            return $pdf->download("invoice-{$invoice->invoice_number}.pdf");
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to generate PDF: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Invoice $invoice): JsonResponse
    {
        $invoice->delete();

        return response()->json([
            'message' => 'Invoice deleted successfully',
        ]);
    }
}
