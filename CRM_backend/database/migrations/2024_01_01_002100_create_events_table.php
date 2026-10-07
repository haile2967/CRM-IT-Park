<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {

            $table->id();
            $table->foreignId('program_id')->nullable()->constrained('programs');
            $table->string('event_name', 255);
            $table->text('description')->nullable();
            $table->dateTime('start_datetime');
            $table->dateTime('end_datetime')->nullable();
            $table->string('location', 255)->nullable();
            $table->integer('capacity')->nullable();
            $table->string('status', 30)->default('scheduled');
            $table->timestamps();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('events');

    }
};
