<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_registrations', function (Blueprint $table) {

            $table->id();
            $table->foreignId('event_id')->constrained('events');
            $table->foreignId('account_id')->constrained('accounts');
            $table->foreignId('contact_id')->nullable()->constrained('contacts');
            $table->string('registration_status', 30)->default('registered');
            $table->dateTime('registered_at');
            $table->dateTime('attended_at')->nullable();
            $table->timestamps();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('event_registrations');

    }
};
