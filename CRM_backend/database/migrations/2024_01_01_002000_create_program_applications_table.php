<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('program_applications', function (Blueprint $table) {

            $table->id();
            $table->foreignId('program_id')->constrained('programs');
            $table->foreignId('account_id')->constrained('accounts');
            $table->foreignId('contact_id')->nullable()->constrained('contacts');
            $table->foreignId('opportunity_id')->nullable()->constrained('opportunities');
            $table->date('application_date');
            $table->string('status', 30)->default('Applied');
            $table->text('progress_notes')->nullable();
            $table->text('engagement_notes')->nullable();
            $table->dateTime('completed_at')->nullable();
            $table->dateTime('withdrawn_at')->nullable();
            $table->timestamps();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('program_applications');

    }
};
