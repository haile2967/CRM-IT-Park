<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {

            $table->id();
            $table->foreignId('recipient_user_id')->nullable()->constrained('users');
            $table->foreignId('recipient_role_id')->nullable()->constrained('roles');
            $table->foreignId('ticket_id')->nullable()->constrained('tickets');
            $table->string('notification_type', 50);
            $table->string('title', 255);
            $table->text('message')->nullable();
            $table->boolean('is_read')->default(false);
            $table->dateTime('sent_at')->nullable();
            $table->dateTime('read_at')->nullable();
            $table->timestamps();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');

    }
};
