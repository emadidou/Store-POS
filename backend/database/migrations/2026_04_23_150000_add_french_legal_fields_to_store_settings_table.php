<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('store_settings', function (Blueprint $table): void {
            if (! Schema::hasColumn('store_settings', 'siren')) {
                $table->string('siren', 16)->nullable()->after('siret');
            }

            if (! Schema::hasColumn('store_settings', 'rcs_city')) {
                $table->string('rcs_city', 120)->nullable()->after('rc');
            }

            if (! Schema::hasColumn('store_settings', 'share_capital')) {
                $table->string('share_capital', 80)->nullable()->after('legal_form');
            }

            if (! Schema::hasColumn('store_settings', 'ape_code')) {
                $table->string('ape_code', 16)->nullable()->after('siren');
            }
        });
    }

    public function down(): void
    {
        Schema::table('store_settings', function (Blueprint $table): void {
            $columns = array_filter(['siren', 'rcs_city', 'share_capital', 'ape_code'], fn (string $column): bool => Schema::hasColumn('store_settings', $column));

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
