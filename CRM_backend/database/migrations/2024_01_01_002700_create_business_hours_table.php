<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_hours', function (Blueprint $table) {

            $table->id();
            $table->foreignId('calendar_id')->constrained('business_hours_calendars');
            $table->tinyInteger('day_of_week');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->boolean('is_working_day')->default(true);
            $table->timestamps();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('business_hours');

    }
};
