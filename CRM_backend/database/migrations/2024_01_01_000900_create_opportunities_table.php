<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opportunities', function (Blueprint $table) {

            $table->id();
            $table->foreignId('lead_id')->nullable()->constrained('leads');
            $table->foreignId('account_id')->constrained('accounts');
            $table->foreignId('owner_user_id')->nullable()->constrained('users');
            $table->foreignId('opportunity_type_id')->constrained('opportunity_types');
            $table->foreignId('stage_id')->constrained('pipeline_stages');
            $table->decimal('probability', 5, 2)->nullable();
            $table->decimal('value', 18, 2)->nullable();
            $table->date('expected_close_date')->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 30)->default('open');
            $table->dateTime('closed_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('opportunities');

    }
};
