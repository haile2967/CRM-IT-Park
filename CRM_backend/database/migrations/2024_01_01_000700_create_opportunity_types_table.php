<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opportunity_types', function (Blueprint $table) {

            $table->id();
            $table->string('type_name', 100)->unique();
            $table->string('description', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('opportunity_types');

    }
};
