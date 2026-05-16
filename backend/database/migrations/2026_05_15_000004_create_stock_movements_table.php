<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type'); // stock_in, stock_out, transfer, adjustment, return
            $table->decimal('quantity', 15, 3);
            $table->decimal('before_quantity', 15, 3)->default(0);
            $table->decimal('after_quantity', 15, 3)->default(0);
            $table->decimal('cost', 15, 2)->default(0);
            $table->text('reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'product_id']);
            $table->index(['tenant_id', 'warehouse_id']);
            $table->index(['tenant_id', 'type']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
