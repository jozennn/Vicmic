<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
       Schema::create('material_requests', function (Blueprint $table) {
        $table->id();
        $table->string('item_name');
        $table->string('requested_by');
        $table->integer('quantity');
        $table->string('urgency'); // High, Medium, Low
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('material_requests');
    }
};
