<?php

use Illuminate\Support\Facades\Route;
use App\Modules\Inventory\Controllers\ProductController;
use App\Modules\Inventory\Controllers\CategoryController;
use App\Modules\Inventory\Controllers\WarehouseController;
use App\Modules\Inventory\Controllers\StockMovementController;
use App\Modules\Inventory\Controllers\UploadController;

Route::middleware(['auth:sanctum'])->group(function () {
    // Products
    Route::get('products/barcode', [ProductController::class, 'byBarcode']);
    Route::get('products/sku', [ProductController::class, 'bySku']);
    Route::apiResource('products', ProductController::class);

    // Categories
    Route::apiResource('categories', CategoryController::class);

    // Warehouses
    Route::apiResource('warehouses', WarehouseController::class);

    // Stock Movements
    Route::get('stock/summary', [StockMovementController::class, 'summary']);
    Route::post('stock/transfer', [StockMovementController::class, 'transfer']);
    Route::apiResource('stock', StockMovementController::class)->only(['index', 'store']);

    // Uploads
    Route::post('uploads', [UploadController::class, 'upload']);
});
