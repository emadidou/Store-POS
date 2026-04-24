<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class SupplierController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return SupplierResource::collection(
            Supplier::query()
                ->withCount('purchases')
                ->when($request->string('search')->toString(), function ($query, string $search): void {
                    $query->where(function ($query) use ($search): void {
                        $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%")
                            ->orWhere('phone', 'like', "%{$search}%")
                            ->orWhere('siret', 'like', "%{$search}%")
                            ->orWhere('vat_number', 'like', "%{$search}%");
                    });
                })
                ->when($request->filled('is_active'), fn ($query) => $query->where('is_active', $request->boolean('is_active')))
                ->orderBy('name')
                ->paginate($request->integer('per_page', 25))
        );
    }

    public function store(StoreSupplierRequest $request): JsonResponse
    {
        return (new SupplierResource(Supplier::query()->create($request->validated())->loadCount('purchases')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Supplier $supplier): SupplierResource
    {
        return new SupplierResource($supplier->loadCount('purchases'));
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier): SupplierResource
    {
        $supplier->update($request->validated());

        return new SupplierResource($supplier->refresh()->loadCount('purchases'));
    }

    public function destroy(Supplier $supplier): Response
    {
        if ($supplier->purchases()->exists()) {
            abort(422, 'Ce fournisseur est deja lie a des achats et ne peut pas etre supprime.');
        }

        $supplier->delete();

        return response()->noContent();
    }
}
