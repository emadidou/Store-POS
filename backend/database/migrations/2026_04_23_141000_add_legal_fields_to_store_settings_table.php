<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('store_settings', function (Blueprint $table): void {
            $table->string('company_name')->nullable()->after('store_name');
            $table->string('legal_form', 80)->nullable()->after('company_name');
            $table->string('siret', 32)->nullable()->after('address');
            $table->string('vat_number', 48)->nullable()->after('siret');
            $table->string('rc', 48)->nullable()->after('vat_number');
            $table->string('ice', 48)->nullable()->after('rc');
            $table->decimal('vat_rate', 5, 2)->default(5.50)->after('ice');
            $table->boolean('vat_exempt')->default(false)->after('vat_rate');
        });
    }

    public function down(): void
    {
        Schema::table('store_settings', function (Blueprint $table): void {
            $table->dropColumn(['company_name', 'legal_form', 'siret', 'vat_number', 'rc', 'ice', 'vat_rate', 'vat_exempt']);
        });
    }
};
