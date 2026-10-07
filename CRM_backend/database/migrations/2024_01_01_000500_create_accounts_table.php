<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts', function (Blueprint $table) {

            $table->id();
            $table->foreignId('owner_user_id')->nullable()->constrained('users');
            $table->string('organization_name', 255);
            $table->foreignId('account_type_id')->constrained('reference_categories');
            $table->string('industry', 150)->nullable();
            $table->string('location', 255)->nullable();
            $table->text('contact_information')->nullable();
            $table->text('engagement_history')->nullable();
            $table->softDeletes();
            $table->timestamps();
        
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('accounts');

    }
};
