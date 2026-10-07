<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_escalation_history', function (Blueprint $table) {

            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets');
            $table->foreignId('escalation_policy_id')->nullable()->constrained('escalation_policies');
            $table->dateTime('escalated_at');
            $table->dateTime('cleared_at')->nullable();
            $table->integer('inactivity_duration_minutes')->nullable();
            $table->boolean('notification_sent')->default(false);
            $table->timestamps();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_escalation_history');

    }
};
