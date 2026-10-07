<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('escalation_recipients', function (Blueprint $table) {

            $table->id();
            $table->foreignId('escalation_policy_id')->constrained('escalation_policies');
            $table->foreignId('user_id')->nullable()->constrained('users');
            $table->foreignId('role_id')->nullable()->constrained('roles');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('escalation_recipients');

    }
};
