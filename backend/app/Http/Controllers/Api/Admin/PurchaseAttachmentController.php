<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PurchaseAttachmentController extends Controller
{
    public function show(Purchase $purchase): BinaryFileResponse
    {
        abort_unless($purchase->attachment_path && Storage::disk('local')->exists($purchase->attachment_path), 404);

        return response()->file(Storage::disk('local')->path($purchase->attachment_path));
    }

    public function download(Purchase $purchase): BinaryFileResponse
    {
        abort_unless($purchase->attachment_path && Storage::disk('local')->exists($purchase->attachment_path), 404);

        return response()->download(Storage::disk('local')->path($purchase->attachment_path));
    }
}
