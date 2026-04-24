<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('store_settings', 'share_capital')) {
            return;
        }

        Schema::table('store_settings', function (Blueprint $table): void {
            $table->decimal('share_capital_amount', 12, 2)->nullable()->after('share_capital');
        });

        DB::table('store_settings')->orderBy('id')->chunkById(100, function ($settings): void {
            foreach ($settings as $setting) {
                $raw = (string) ($setting->share_capital ?? '');
                $amount = preg_replace('/[^0-9,.\-]/', '', $raw);
                $amount = str_replace(',', '.', $amount);

                DB::table('store_settings')->where('id', $setting->id)->update([
                    'share_capital_amount' => is_numeric($amount) ? (float) $amount : null,
                ]);
            }
        });

        Schema::table('store_settings', function (Blueprint $table): void {
            $table->dropColumn('share_capital');
        });

        Schema::table('store_settings', function (Blueprint $table): void {
            $table->renameColumn('share_capital_amount', 'share_capital');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('store_settings', 'share_capital')) {
            return;
        }

        Schema::table('store_settings', function (Blueprint $table): void {
            $table->string('share_capital_text', 80)->nullable()->after('share_capital');
        });

        DB::table('store_settings')->orderBy('id')->chunkById(100, function ($settings): void {
            foreach ($settings as $setting) {
                DB::table('store_settings')->where('id', $setting->id)->update([
                    'share_capital_text' => $setting->share_capital !== null ? (string) $setting->share_capital : null,
                ]);
            }
        });

        Schema::table('store_settings', function (Blueprint $table): void {
            $table->dropColumn('share_capital');
        });

        Schema::table('store_settings', function (Blueprint $table): void {
            $table->renameColumn('share_capital_text', 'share_capital');
        });
    }
};
