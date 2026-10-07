<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_holidays', function (Blueprint $table) {

            $table->id();
            $table->foreignId('calendar_id')->constrained('business_hours_calendars');
            $table->date('holiday_date');
            $table->string('holiday_name', 150);
            
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('business_holidays');

    }
};
