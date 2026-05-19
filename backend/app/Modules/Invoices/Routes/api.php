<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Invoices\Controllers\CustomerController;
use App\Modules\Invoices\Controllers\InvoiceController;
use App\Modules\Invoices\Controllers\QuotationController;
use App\Modules\Invoices\Controllers\ReceiptController;

Route::middleware(['auth:sanctum'])->group(function () {
    // Customers
    Route::apiResource('customers', CustomerController::class);

    // Invoices
    Route::get('invoices', [InvoiceController::class, 'index']);
    Route::post('invoices', [InvoiceController::class, 'store']);
    Route::get('invoices/{invoice}', [InvoiceController::class, 'show']);
    Route::put('invoices/{invoice}', [InvoiceController::class, 'update']);
    Route::delete('invoices/{invoice}', [InvoiceController::class, 'destroy']);
    Route::post('invoices/{invoice}/confirm', [InvoiceController::class, 'confirm']);
    Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'downloadPdf']);

    // Quotations
    Route::apiResource('quotations', QuotationController::class);

    // Receipts
    Route::get('receipts', [ReceiptController::class, 'index']);
    Route::get('receipts/{receipt}', [ReceiptController::class, 'show']);
    Route::post('receipts', [ReceiptController::class, 'store']);
    Route::delete('receipts/{receipt}', [ReceiptController::class, 'destroy']);
});
