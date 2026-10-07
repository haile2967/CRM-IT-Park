<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('communications', function (Blueprint $table) {

            $table->id();
            $table->foreignId('account_id')->nullable()->constrained('accounts');
            $table->foreignId('contact_id')->nullable()->constrained('contacts');
            $table->foreignId('lead_id')->nullable()->constrained('leads');
            $table->foreignId('opportunity_id')->nullable()->constrained('opportunities');
            $table->foreignId('activity_id')->nullable()->constrained('activities');
            $table->foreignId('created_by_user_id')->constrained('users');
            $table->string('communication_type', 30);
            $table->string('subject', 255)->nullable();
            $table->text('content')->nullable();
            $table->dateTime('communication_at');
            $table->timestamps();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('communications');

    }
};
