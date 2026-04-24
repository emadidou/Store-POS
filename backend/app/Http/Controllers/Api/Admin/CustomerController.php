<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;

class CustomerController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $customers = Customer::query()
            ->withCount('orders')
            ->withMax('orders', 'created_at')
            ->when($request->string('search')->toString(), function ($query, string $search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('full_name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate($request->integer('per_page', 25));

        return CustomerResource::collection($customers);
    }

    public function store(StoreCustomerRequest $request): CustomerResource
    {
        return new CustomerResource(Customer::query()->create($request->validated()));
    }

    public function show(Customer $customer): CustomerResource
    {
        return new CustomerResource(
            $customer->load(['orders' => fn ($query) => $query->latest()->with('items.product.category')])
                ->loadCount('orders')
                ->loadMax('orders', 'created_at')
        );
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): CustomerResource
    {
        $customer->update($request->validated());

        return new CustomerResource($customer->refresh()->loadCount('orders')->loadMax('orders', 'created_at'));
    }

    public function destroy(Customer $customer): Response
    {
        if ($customer->orders()->exists()) {
            throw ValidationException::withMessages([
                'customer' => ['Impossible de supprimer un client avec des commandes. Annulez ou archivez les commandes avant suppression.'],
            ]);
        }

        $customer->delete();

        return response()->noContent();
    }
}
