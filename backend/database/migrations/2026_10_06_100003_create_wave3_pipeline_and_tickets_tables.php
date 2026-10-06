<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run migrations for Deals Pipeline & Support Ticketing (Wave 3)
     * Tables: opportunities (7), opportunity_stage_history (10), escalation_policies (15),
     * escalation_recipients (16), tickets (13), ticket_escalation_history (17), ticket_comments (18)
     */
    public function up(): void
    {
        // 7. opportunities
        Schema::create('opportunities', function (Blueprint $table) {
            $table->bigIncrements('opportunity_id');
            $table->unsignedBigInteger('lead_id')->nullable();
            $table->unsignedBigInteger('account_id');
            $table->unsignedBigInteger('owner_user_id')->nullable();
            $table->unsignedBigInteger('opportunity_type_id');
            $table->unsignedBigInteger('stage_id');
            $table->decimal('probability', 5, 2)->nullable();
            $table->decimal('value', 18, 2)->nullable();
            $table->date('expected_close_date')->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 30)->default('open'); // open, closed_won, closed_lost
            $table->timestamp('closed_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('lead_id')->references('lead_id')->on('leads')->nullOnDelete();
            $table->foreign('account_id')->references('account_id')->on('accounts')->cascadeOnDelete();
            $table->foreign('owner_user_id')->references('user_id')->on('users')->nullOnDelete();
            $table->foreign('opportunity_type_id')->references('opportunity_type_id')->on('opportunity_types')->restrictOnDelete();
            $table->foreign('stage_id')->references('stage_id')->on('pipeline_stages')->restrictOnDelete();
        });

        // 10. opportunity_stage_history
        Schema::create('opportunity_stage_history', function (Blueprint $table) {
            $table->bigIncrements('history_id');
            $table->unsignedBigInteger('opportunity_id');
            $table->unsignedBigInteger('from_stage_id')->nullable();
            $table->unsignedBigInteger('to_stage_id');
            $table->unsignedBigInteger('changed_by_user_id');
            $table->timestamp('changed_at')->useCurrent();
            $table->text('notes')->nullable();

            $table->foreign('opportunity_id')->references('opportunity_id')->on('opportunities')->cascadeOnDelete();
            $table->foreign('from_stage_id')->references('stage_id')->on('pipeline_stages')->nullOnDelete();
            $table->foreign('to_stage_id')->references('stage_id')->on('pipeline_stages')->restrictOnDelete();
            $table->foreign('changed_by_user_id')->references('user_id')->on('users')->restrictOnDelete();
        });

        // 15. escalation_policies
        Schema::create('escalation_policies', function (Blueprint $table) {
            $table->bigIncrements('escalation_policy_id');
            $table->string('priority', 20); // Urgent, High, Medium, Low
            $table->integer('reminder_threshold_minutes');
            $table->integer('escalation_threshold_minutes');
            $table->string('time_basis', 30)->default('calendar'); // calendar, business_hours
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by_user_id');
            $table->timestamps();

            $table->foreign('created_by_user_id')->references('user_id')->on('users')->restrictOnDelete();
        });

        // 16. escalation_recipients
        Schema::create('escalation_recipients', function (Blueprint $table) {
            $table->bigIncrements('escalation_recipient_id');
            $table->unsignedBigInteger('escalation_policy_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('role_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('escalation_policy_id')->references('escalation_policy_id')->on('escalation_policies')->cascadeOnDelete();
            $table->foreign('user_id')->references('user_id')->on('users')->nullOnDelete();
            $table->foreign('role_id')->references('role_id')->on('roles')->nullOnDelete();
        });

        // 13. tickets
        Schema::create('tickets', function (Blueprint $table) {
            $table->bigIncrements('ticket_id');
            $table->unsignedBigInteger('account_id')->nullable();
            $table->unsignedBigInteger('contact_id')->nullable();
            $table->unsignedBigInteger('assignee_user_id')->nullable();
            $table->unsignedBigInteger('category_id');
            $table->string('priority', 20)->default('Medium'); // Urgent, High, Medium, Low
            $table->string('status', 30)->default('open'); // open, in progress, resolved, closed
            $table->string('subject', 255);
            $table->text('description')->nullable();
            $table->timestamp('last_activity_at')->useCurrent();
            $table->bigInteger('inactivity_duration_seconds')->nullable();
            $table->boolean('escalated')->default(false);
            $table->timestamp('escalated_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('account_id')->references('account_id')->on('accounts')->nullOnDelete();
            $table->foreign('contact_id')->references('contact_id')->on('contacts')->nullOnDelete();
            $table->foreign('assignee_user_id')->references('user_id')->on('users')->nullOnDelete();
            $table->foreign('category_id')->references('category_id')->on('ticket_categories')->restrictOnDelete();
        });

        // 17. ticket_escalation_history
        Schema::create('ticket_escalation_history', function (Blueprint $table) {
            $table->bigIncrements('escalation_history_id');
            $table->unsignedBigInteger('ticket_id');
            $table->unsignedBigInteger('escalation_policy_id')->nullable();
            $table->timestamp('escalated_at')->useCurrent();
            $table->timestamp('cleared_at')->nullable();
            $table->integer('inactivity_duration_minutes')->nullable();
            $table->boolean('notification_sent')->default(false);
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('ticket_id')->references('ticket_id')->on('tickets')->cascadeOnDelete();
            $table->foreign('escalation_policy_id')->references('escalation_policy_id')->on('escalation_policies')->nullOnDelete();
        });

        // 18. ticket_comments
        Schema::create('ticket_comments', function (Blueprint $table) {
            $table->bigIncrements('ticket_comment_id');
            $table->unsignedBigInteger('ticket_id');
            $table->unsignedBigInteger('user_id');
            $table->text('comment_text');
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('ticket_id')->references('ticket_id')->on('tickets')->cascadeOnDelete();
            $table->foreign('user_id')->references('user_id')->on('users')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_comments');
        Schema::dropIfExists('ticket_escalation_history');
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('escalation_recipients');
        Schema::dropIfExists('escalation_policies');
        Schema::dropIfExists('opportunity_stage_history');
        Schema::dropIfExists('opportunities');
    }
};
