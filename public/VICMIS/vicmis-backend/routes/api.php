<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
    AuthController,
    EmployeeController,
    AttendanceController,
    HRDashboardController,
    EmployeeRequestController,
    EngineeringController,
    LeadController,
    InventoryController,
    PayrollController
};

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-2fa', [AuthController::class, 'verify2FA']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // --- USER & AUTH ---
    Route::get('/user', fn(Request $request) => $request->user());
    Route::post('/logout', [AuthController::class, 'logout']);


    // --- HR DOMAIN ---
    Route::prefix('hr')->group(function () {
        Route::get('/dashboard-stats', [HRDashboardController::class, 'getStats']);
        Route::post('/announcements', [HRDashboardController::class, 'setAnnouncement']);
        Route::get('/latest-announcement', [HRDashboardController::class, 'getTodayAnnouncement']);
        Route::put('/hr/employee-requests/{id}', [EmployeeRequestController::class, 'updateStatus']);
        Route::get('/dashboard-stats', [HRDashboardController::class, 'getStats']);

        // Employee Requests within HR
        Route::prefix('employee-requests')->group(function () {
            Route::get('/pending', [EmployeeRequestController::class, 'getPending']);
            Route::post('/', [EmployeeRequestController::class, 'store']);
            
            // Changed from POST /{id}/status to PUT /{id}
            Route::put('/{id}', [EmployeeRequestController::class, 'updateStatus']);
        });
    });


    // --- ATTENDANCE MANAGEMENT ---
    Route::prefix('attendance')->group(function () {
        Route::get('/load', [AttendanceController::class, 'load']);
        Route::post('/save', [AttendanceController::class, 'save']);
        Route::post('/save-single', [AttendanceController::class, 'saveSingle']);
        Route::get('/get-month', [AttendanceController::class, 'getMonthData']);
    });

    // --- EMPLOYEE DIRECTORY ---
    Route::apiResource('employees', EmployeeController::class)->except(['show']);

    // --- ENGINEERING & LEADS ---
    Route::get('/engineering/dashboard-stats', [EngineeringController::class, 'getStats']);
    Route::apiResource('leads', LeadController::class);
    Route::patch('/leads/{id}/status', [LeadController::class, 'update']);

    // --- INVENTORY MANAGEMENT ---
    Route::prefix('inventory')->group(function () {
        // Stock & Alerts
        Route::get('/alerts', [InventoryController::class, 'getLowStockAlerts']);
        Route::post('/stock-in', [InventoryController::class, 'stockIn']);
        Route::post('/stock-out', [InventoryController::class, 'stockOut']);
        
        // Shipments & Logistics
        Route::get('/shipments', [InventoryController::class, 'getShipmentHistory']);
        Route::get('/logistics', [InventoryController::class, 'getLogisticsHistory']);
        Route::patch('/shipments/{id}/receive', [InventoryController::class, 'markAsReceived']);
        Route::patch('/logistics/{id}/delivered', [InventoryController::class, 'markAsDelivered']);

        // Categories & Requests
        Route::get('/construction', [InventoryController::class, 'getConstruction']);
        Route::get('/office', [InventoryController::class, 'getOffice']);
        Route::get('/incoming', [InventoryController::class, 'getIncoming']);
        Route::get('/delivery', [InventoryController::class, 'getDelivery']);
        Route::get('/requests', [InventoryController::class, 'getRequests']);
        
        // Approvals
        Route::get('/pending', [InventoryController::class, 'getPendingActions']);
        Route::post('/approve/{type}/{id}', [InventoryController::class, 'approveAction']);
        Route::post('/reject/{type}/{id}', [InventoryController::class, 'rejectAction']);

        // Resource Cleanup
        Route::delete('/{type}/{id}', [InventoryController::class, 'destroy']);
    });

// Clean version
    Route::prefix('payroll')->group(function () {
        Route::post('/finalize', [PayrollController::class, 'finalize']);
        Route::get('/pending', [PayrollController::class, 'getPending']);
        Route::post('/approve-all', [PayrollController::class, 'approveAll']);
        Route::post('/reject-all', [PayrollController::class, 'rejectAll']);
    });
});