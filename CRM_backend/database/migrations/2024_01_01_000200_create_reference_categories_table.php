<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reference_categories', function (Blueprint $table) {

            $table->id();
            $table->string('category_group', 50);
            $table->string('category_name', 100);
            $table->string('description', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->nullable();
            $table->timestamps();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('reference_categories');

    }
};
