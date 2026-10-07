<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activities', function (Blueprint $table) {

            $table->id();
            $table->foreignId('assigned_user_id')->nullable()->constrained('users');
            $table->foreignId('lead_id')->nullable()->constrained('leads');
            $table->foreignId('account_id')->nullable()->constrained('accounts');
            $table->foreignId('contact_id')->nullable()->constrained('contacts');
            $table->foreignId('opportunity_id')->nullable()->constrained('opportunities');
            $table->string('activity_type', 30);
            $table->string('subject', 255);
            $table->text('description')->nullable();
            $table->dateTime('scheduled_at')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->dateTime('reminder_at')->nullable();
            $table->string('status', 30)->default('planned');
            $table->timestamps();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('activities');

    }
};
