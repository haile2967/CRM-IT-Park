<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {

            $table->id();
            $table->foreignId('owner_user_id')->nullable()->constrained('users');
            $table->string('name', 255);
            $table->string('organization', 255)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('phone', 50)->nullable();
            $table->foreignId('source_id')->nullable()->constrained('lead_sources');
            $table->foreignId('category_id')->nullable()->constrained('reference_categories');
            $table->string('status', 30)->default('new');
            $table->text('notes')->nullable();
            $table->dateTime('converted_at')->nullable();
            $table->softDeletes();
            $table->timestamps();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('leads');

    }
};
