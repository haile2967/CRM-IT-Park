<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pipeline_stages', function (Blueprint $table) {

            $table->id();
            $table->string('stage_name', 100)->unique();
            $table->integer('display_order');
            $table->boolean('is_closed_won')->default(false);
            $table->boolean('is_closed_lost')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('pipeline_stages');

    }
};
