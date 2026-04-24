<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return ProductResource::collection(
            Product::query()->with('category')->latest()->paginate($request->integer('per_page', 25))
        );
    }

    public function store(StoreProductRequest $request): ProductResource
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        if (array_key_exists('stock', $data)) {
            $data['last_stock_update_at'] = now();
        }

        return new ProductResource(Product::query()->create($data)->load('category'));
    }

    public function show(Product $product): ProductResource
    {
        return new ProductResource($product->load('category'));
    }

    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $data = $request->validated();
        $removeImage = (bool) ($data['remove_image'] ?? false);
        unset($data['remove_image']);

        if ($removeImage || $request->hasFile('image')) {
            $this->deleteProductImage($product);
            $data['image'] = null;
        }

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        if (array_key_exists('stock', $data)) {
            $data['last_stock_update_at'] = now();
        }

        $product->update($data);

        return new ProductResource($product->refresh()->load('category'));
    }

    public function destroy(Product $product): Response
    {
        $this->deleteProductImage($product);
        $product->delete();

        return response()->noContent();
    }

    private function deleteProductImage(Product $product): void
    {
        if ($product->image && ! str_starts_with($product->image, 'http://') && ! str_starts_with($product->image, 'https://')) {
            Storage::disk('public')->delete($product->image);
        }
    }
}
