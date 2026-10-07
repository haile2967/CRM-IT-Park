<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('escalation_policies', function (Blueprint $table) {

            $table->id();
            $table->string('priority', 20);
            $table->integer('reminder_threshold_minutes');
            $table->integer('escalation_threshold_minutes');
            $table->string('time_basis', 30)->default('calendar');
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by_user_id')->constrained('users');
            $table->timestamps();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('escalation_policies');

    }
};
