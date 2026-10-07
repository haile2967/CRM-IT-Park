<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('export_records', function (Blueprint $table) {

            $table->id();
            $table->foreignId('opportunity_id')->nullable()->constrained('opportunities');
            $table->foreignId('exported_by_user_id')->constrained('users');
            $table->string('export_type', 30);
            $table->string('export_format', 20);
            $table->string('file_name', 255)->nullable();
            $table->integer('record_count')->nullable();
            $table->string('status', 30)->default('completed');
            $table->dateTime('exported_at');
            $table->text('error_message')->nullable();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('export_records');

    }
};
