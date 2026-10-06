<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run migrations for Master Reference Data & System Calendars (Wave 1)
     * Tables: lead_sources (4), reference_categories (26), opportunity_types (8),
     * pipeline_stages (9), ticket_categories (14), business_hours_calendars (27),
     * business_hours (28), business_holidays (29)
     */
    public function up(): void
    {
        // 4. lead_sources
        Schema::create('lead_sources', function (Blueprint $table) {
            $table->bigIncrements('source_id');
            $table->string('source_name', 100)->unique();
            $table->string('description', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 26. reference_categories
        Schema::create('reference_categories', function (Blueprint $table) {
            $table->bigIncrements('category_id');
            $table->string('category_group', 50);
            $table->string('category_name', 100);
            $table->string('description', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->nullable();
            $table->timestamps();
        });

        // 8. opportunity_types
        Schema::create('opportunity_types', function (Blueprint $table) {
            $table->bigIncrements('opportunity_type_id');
            $table->string('type_name', 100)->unique();
            $table->string('description', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 9. pipeline_stages
        Schema::create('pipeline_stages', function (Blueprint $table) {
            $table->bigIncrements('stage_id');
            $table->string('stage_name', 100)->unique();
            $table->integer('display_order');
            $table->boolean('is_closed_won')->default(false);
            $table->boolean('is_closed_lost')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 14. ticket_categories
        Schema::create('ticket_categories', function (Blueprint $table) {
            $table->bigIncrements('category_id');
            $table->string('category_name', 100)->unique();
            $table->string('description', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 27. business_hours_calendars
        Schema::create('business_hours_calendars', function (Blueprint $table) {
            $table->bigIncrements('calendar_id');
            $table->string('calendar_name', 100)->unique();
            $table->string('timezone', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 28. business_hours
        Schema::create('business_hours', function (Blueprint $table) {
            $table->bigIncrements('business_hour_id');
            $table->unsignedBigInteger('calendar_id');
            $table->smallInteger('day_of_week'); // 1-7
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->boolean('is_working_day')->default(true);
            $table->timestamps();

            $table->foreign('calendar_id')->references('calendar_id')->on('business_hours_calendars')->cascadeOnDelete();
        });

        // 29. business_holidays
        Schema::create('business_holidays', function (Blueprint $table) {
            $table->bigIncrements('holiday_id');
            $table->unsignedBigInteger('calendar_id');
            $table->date('holiday_date');
            $table->string('holiday_name', 150);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('calendar_id')->references('calendar_id')->on('business_hours_calendars')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_holidays');
        Schema::dropIfExists('business_hours');
        Schema::dropIfExists('business_hours_calendars');
        Schema::dropIfExists('ticket_categories');
        Schema::dropIfExists('pipeline_stages');
        Schema::dropIfExists('opportunity_types');
        Schema::dropIfExists('reference_categories');
        Schema::dropIfExists('lead_sources');
    }
};
