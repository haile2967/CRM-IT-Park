<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_hours_calendars', function (Blueprint $table) {

            $table->id();
            $table->string('calendar_name', 100)->unique();
            $table->string('timezone', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('business_hours_calendars');

    }
};
