<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opportunity_stage_history', function (Blueprint $table) {

            $table->id();
            $table->foreignId('opportunity_id')->constrained('opportunities');
            $table->foreignId('from_stage_id')->nullable()->constrained('pipeline_stages');
            $table->foreignId('to_stage_id')->constrained('pipeline_stages');
            $table->foreignId('changed_by_user_id')->constrained('users');
            $table->dateTime('changed_at');
            $table->text('notes')->nullable();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('opportunity_stage_history');

    }
};
