<?php

use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\AccountingExportController;
use App\Http\Controllers\Api\Admin\BusinessHourController as AdminBusinessHourController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\Admin\CreditNoteController as AdminCreditNoteController;
use App\Http\Controllers\Api\Admin\OrderDocumentController as AdminOrderDocumentController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\PickupSlotController as AdminPickupSlotController;
use App\Http\Controllers\Api\Admin\PurchaseAttachmentController as AdminPurchaseAttachmentController;
use App\Http\Controllers\Api\Admin\PurchaseController as AdminPurchaseController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\SalesJournalController;
use App\Http\Controllers\Api\Admin\StockController as AdminStockController;
use App\Http\Controllers\Api\Admin\StoreSettingController as AdminStoreSettingController;
use App\Http\Controllers\Api\Admin\SupplierController as AdminSupplierController;
use App\Http\Controllers\Api\BusinessHourController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderDocumentController;
use App\Http\Controllers\Api\PickupSlotController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StoreSettingController;
use App\Http\Controllers\Api\StoreStatusController;
use Illuminate\Support\Facades\Route;

Route::get('categories', [CategoryController::class, 'index']);
Route::get('products', [ProductController::class, 'index']);
Route::get('products/{product}', [ProductController::class, 'show']);
Route::get('pickup-slots', [PickupSlotController::class, 'index']);
Route::get('business-hours', [BusinessHourController::class, 'index']);
Route::get('store-settings', [StoreSettingController::class, 'show']);
Route::get('store-status', StoreStatusController::class);
Route::post('orders', [OrderController::class, 'store']);
Route::get('orders/{orderNumber}/voucher', [OrderController::class, 'voucher']);
Route::get('orders/{orderNumber}/document-pdf', [OrderDocumentController::class, 'show']);

Route::prefix('admin')->group(function (): void {
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:admin-login');

    Route::middleware(['auth:sanctum', 'admin'])->group(function (): void {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
        Route::patch('profile', [AuthController::class, 'updateProfile']);

        Route::get('orders', [AdminOrderController::class, 'index']);
        Route::post('orders', [AdminOrderController::class, 'store']);
        Route::get('orders/{order}', [AdminOrderController::class, 'show']);
        Route::get('orders/{order}/invoice-pdf', [AdminOrderDocumentController::class, 'invoice']);
        Route::get('orders/{order}/voucher-pdf', [AdminOrderDocumentController::class, 'voucher']);
        Route::post('orders/{order}/credit-note', [AdminCreditNoteController::class, 'store']);
        Route::get('orders/{order}/credit-note', [AdminCreditNoteController::class, 'forOrder']);
        Route::put('orders/{order}', [AdminOrderController::class, 'update']);
        Route::delete('orders/{order}', [AdminOrderController::class, 'destroy']);
        Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus']);
        Route::get('credit-notes', [AdminCreditNoteController::class, 'index']);
        Route::get('credit-notes/{order}/pdf', [AdminCreditNoteController::class, 'pdf']);

        Route::apiResource('products', AdminProductController::class);
        Route::patch('products/{product}/stock', [AdminStockController::class, 'updateProductStock']);
        Route::apiResource('categories', AdminCategoryController::class);
        Route::apiResource('customers', AdminCustomerController::class);
        Route::apiResource('suppliers', AdminSupplierController::class);
        Route::get('purchases/journal', [AdminPurchaseController::class, 'journal']);
        Route::get('purchases/stats', [AdminPurchaseController::class, 'stats']);
        Route::get('purchases/{purchase}/attachment', [AdminPurchaseAttachmentController::class, 'show']);
        Route::get('purchases/{purchase}/attachment/download', [AdminPurchaseAttachmentController::class, 'download']);
        Route::apiResource('purchases', AdminPurchaseController::class);
        Route::patch('purchases/{purchase}/status', [AdminPurchaseController::class, 'updateStatus']);
        Route::apiResource('pickup-slots', AdminPickupSlotController::class)->except(['show']);
        Route::get('stock', [AdminStockController::class, 'index']);
        Route::post('stock/adjust', [AdminStockController::class, 'adjust']);
        Route::get('stock/movements', [AdminStockController::class, 'movements']);
        Route::get('stock/alerts', [AdminStockController::class, 'alerts']);
        Route::get('stock/stats', [AdminStockController::class, 'stats']);
        Route::get('stock/movements-summary', [AdminStockController::class, 'movementsSummary']);

        Route::get('business-hours', [AdminBusinessHourController::class, 'index']);
        Route::put('business-hours', [AdminBusinessHourController::class, 'update']);
        Route::get('store-settings', [AdminStoreSettingController::class, 'show']);
        Route::put('store-settings', [AdminStoreSettingController::class, 'update']);

        Route::get('sales-journal', [SalesJournalController::class, 'index']);
        Route::get('sales-journal/export', [SalesJournalController::class, 'export']);
        Route::get('accounting-export', [AccountingExportController::class, 'index']);
        Route::get('accounting-export/csv', [AccountingExportController::class, 'csv']);
        Route::get('accounting-export/xlsx', [AccountingExportController::class, 'xlsx']);
        Route::get('accounting-export/purchases', [AccountingExportController::class, 'purchases']);
    });
});
