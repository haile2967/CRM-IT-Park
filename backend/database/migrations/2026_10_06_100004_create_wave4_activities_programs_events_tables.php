<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run migrations for Activities, Communications, Programs & Events (Wave 4)
     * Tables: activities (11), communications (12), programs (19), program_applications (20),
     * events (21), event_registrations (22)
     */
    public function up(): void
    {
        // 11. activities
        Schema::create('activities', function (Blueprint $table) {
            $table->bigIncrements('activity_id');
            $table->unsignedBigInteger('assigned_user_id')->nullable();
            $table->unsignedBigInteger('lead_id')->nullable();
            $table->unsignedBigInteger('account_id')->nullable();
            $table->unsignedBigInteger('contact_id')->nullable();
            $table->unsignedBigInteger('opportunity_id')->nullable();
            $table->string('activity_type', 30); // call, meeting, email, task
            $table->string('subject', 255);
            $table->text('description')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('reminder_at')->nullable();
            $table->string('status', 30)->default('planned');
            $table->timestamps();

            $table->foreign('assigned_user_id')->references('user_id')->on('users')->nullOnDelete();
            $table->foreign('lead_id')->references('lead_id')->on('leads')->nullOnDelete();
            $table->foreign('account_id')->references('account_id')->on('accounts')->nullOnDelete();
            $table->foreign('contact_id')->references('contact_id')->on('contacts')->nullOnDelete();
            $table->foreign('opportunity_id')->references('opportunity_id')->on('opportunities')->nullOnDelete();
        });

        // 12. communications
        Schema::create('communications', function (Blueprint $table) {
            $table->bigIncrements('communication_id');
            $table->unsignedBigInteger('account_id')->nullable();
            $table->unsignedBigInteger('contact_id')->nullable();
            $table->unsignedBigInteger('lead_id')->nullable();
            $table->unsignedBigInteger('opportunity_id')->nullable();
            $table->unsignedBigInteger('activity_id')->nullable();
            $table->unsignedBigInteger('created_by_user_id');
            $table->string('communication_type', 30); // email, message, call, note
            $table->string('subject', 255)->nullable();
            $table->text('content')->nullable();
            $table->timestamp('communication_at')->useCurrent();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('account_id')->references('account_id')->on('accounts')->nullOnDelete();
            $table->foreign('contact_id')->references('contact_id')->on('contacts')->nullOnDelete();
            $table->foreign('lead_id')->references('lead_id')->on('leads')->nullOnDelete();
            $table->foreign('opportunity_id')->references('opportunity_id')->on('opportunities')->nullOnDelete();
            $table->foreign('activity_id')->references('activity_id')->on('activities')->nullOnDelete();
            $table->foreign('created_by_user_id')->references('user_id')->on('users')->restrictOnDelete();
        });

        // 19. programs
        Schema::create('programs', function (Blueprint $table) {
            $table->bigIncrements('program_id');
            $table->string('program_name', 255);
            $table->string('program_type', 50); // Incubation, training, workshop
            $table->text('description')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 20. program_applications
        Schema::create('program_applications', function (Blueprint $table) {
            $table->bigIncrements('program_application_id');
            $table->unsignedBigInteger('program_id');
            $table->unsignedBigInteger('account_id');
            $table->unsignedBigInteger('contact_id')->nullable();
            $table->unsignedBigInteger('opportunity_id')->nullable();
            $table->date('application_date')->useCurrent();
            $table->string('status', 30)->default('Applied'); // Applied, Accepted, Enrolled, Completed, Withdrawn
            $table->text('progress_notes')->nullable();
            $table->text('engagement_notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('withdrawn_at')->nullable();
            $table->timestamps();

            $table->foreign('program_id')->references('program_id')->on('programs')->cascadeOnDelete();
            $table->foreign('account_id')->references('account_id')->on('accounts')->cascadeOnDelete();
            $table->foreign('contact_id')->references('contact_id')->on('contacts')->nullOnDelete();
            $table->foreign('opportunity_id')->references('opportunity_id')->on('opportunities')->nullOnDelete();
        });

        // 21. events
        Schema::create('events', function (Blueprint $table) {
            $table->bigIncrements('event_id');
            $table->unsignedBigInteger('program_id')->nullable();
            $table->string('event_name', 255);
            $table->text('description')->nullable();
            $table->timestamp('start_datetime');
            $table->timestamp('end_datetime')->nullable();
            $table->string('location', 255)->nullable();
            $table->integer('capacity')->nullable();
            $table->string('status', 30)->default('scheduled');
            $table->timestamps();

            $table->foreign('program_id')->references('program_id')->on('programs')->nullOnDelete();
        });

        // 22. event_registrations
        Schema::create('event_registrations', function (Blueprint $table) {
            $table->bigIncrements('registration_id');
            $table->unsignedBigInteger('event_id');
            $table->unsignedBigInteger('account_id');
            $table->unsignedBigInteger('contact_id')->nullable();
            $table->string('registration_status', 30)->default('registered');
            $table->timestamp('registered_at')->useCurrent();
            $table->timestamp('attended_at')->nullable();
            $table->timestamps();

            $table->foreign('event_id')->references('event_id')->on('events')->cascadeOnDelete();
            $table->foreign('account_id')->references('account_id')->on('accounts')->cascadeOnDelete();
            $table->foreign('contact_id')->references('contact_id')->on('contacts')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_registrations');
        Schema::dropIfExists('events');
        Schema::dropIfExists('program_applications');
        Schema::dropIfExists('programs');
        Schema::dropIfExists('communications');
        Schema::dropIfExists('activities');
    }
};
