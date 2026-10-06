<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run migrations for Notifications, Audit Logs & Export Records (Wave 5)
     * Tables: notifications (23), audit_logs (24), export_records (25)
     */
    public function up(): void
    {
        // 23. notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->bigIncrements('notification_id');
            $table->unsignedBigInteger('recipient_user_id')->nullable();
            $table->unsignedBigInteger('recipient_role_id')->nullable();
            $table->unsignedBigInteger('ticket_id')->nullable();
            $table->string('notification_type', 50); // Reminder, escalation, system notification
            $table->string('title', 255);
            $table->text('message')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('recipient_user_id')->references('user_id')->on('users')->nullOnDelete();
            $table->foreign('recipient_role_id')->references('role_id')->on('roles')->nullOnDelete();
            $table->foreign('ticket_id')->references('ticket_id')->on('tickets')->cascadeOnDelete();
        });

        // 24. audit_logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->bigIncrements('audit_log_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('entity_type', 100);
            $table->unsignedBigInteger('entity_id');
            $table->string('action', 30); // create, update, delete, login, etc.
            $table->string('field_name', 100)->nullable();
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('user_id')->references('user_id')->on('users')->nullOnDelete();
            $table->index(['entity_type', 'entity_id']);
        });

        // 25. export_records
        Schema::create('export_records', function (Blueprint $table) {
            $table->bigIncrements('export_record_id');
            $table->unsignedBigInteger('opportunity_id')->nullable();
            $table->unsignedBigInteger('exported_by_user_id');
            $table->string('export_type', 30); // PMS handoff or report export
            $table->string('export_format', 20); // CSV, Excel, JSON
            $table->string('file_name', 255)->nullable();
            $table->integer('record_count')->nullable();
            $table->string('status', 30)->default('completed'); // completed, failed
            $table->timestamp('exported_at')->useCurrent();
            $table->text('error_message')->nullable();

            $table->foreign('opportunity_id')->references('opportunity_id')->on('opportunities')->nullOnDelete();
            $table->foreign('exported_by_user_id')->references('user_id')->on('users')->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('export_records');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('notifications');
    }
};
