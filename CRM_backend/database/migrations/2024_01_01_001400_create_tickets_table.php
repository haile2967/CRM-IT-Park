<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {

            $table->id();
            $table->foreignId('account_id')->nullable()->constrained('accounts');
            $table->foreignId('contact_id')->nullable()->constrained('contacts');
            $table->foreignId('assignee_user_id')->nullable()->constrained('users');
            $table->foreignId('category_id')->constrained('ticket_categories');
            $table->string('priority', 20)->default('Medium');
            $table->string('status', 30)->default('open');
            $table->string('subject', 255);
            $table->text('description')->nullable();
            $table->dateTime('last_activity_at');
            $table->integer('inactivity_duration_seconds')->nullable();
            $table->boolean('escalated')->default(false);
            $table->dateTime('escalated_at')->nullable();
            $table->dateTime('closed_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');

    }
};
