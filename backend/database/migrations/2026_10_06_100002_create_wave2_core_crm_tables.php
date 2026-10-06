<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run migrations for Core CRM Entities (Wave 2)
     * Tables: accounts (5), contacts (6), leads (3)
     */
    public function up(): void
    {
        // 5. accounts
        Schema::create('accounts', function (Blueprint $table) {
            $table->bigIncrements('account_id');
            $table->unsignedBigInteger('owner_user_id')->nullable();
            $table->string('organization_name', 255);
            $table->unsignedBigInteger('account_type_id');
            $table->string('industry', 150)->nullable();
            $table->string('location', 255)->nullable();
            $table->text('contact_information')->nullable();
            $table->text('engagement_history')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('owner_user_id')->references('user_id')->on('users')->nullOnDelete();
            $table->foreign('account_type_id')->references('category_id')->on('reference_categories')->restrictOnDelete();
        });

        // 6. contacts
        Schema::create('contacts', function (Blueprint $table) {
            $table->bigIncrements('contact_id');
            $table->unsignedBigInteger('account_id');
            $table->unsignedBigInteger('owner_user_id')->nullable();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('role_title', 150)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('email', 255)->nullable();
            $table->boolean('is_primary')->default(false);
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('account_id')->references('account_id')->on('accounts')->cascadeOnDelete();
            $table->foreign('owner_user_id')->references('user_id')->on('users')->nullOnDelete();
        });

        // 3. leads
        Schema::create('leads', function (Blueprint $table) {
            $table->bigIncrements('lead_id');
            $table->unsignedBigInteger('owner_user_id')->nullable();
            $table->string('name', 255);
            $table->string('organization', 255)->nullable();
            $table->string('email', 255)->nullable();
            $table->string('phone', 50)->nullable();
            $table->unsignedBigInteger('source_id')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('status', 30)->default('new'); // new, contacted, qualified, rejected
            $table->text('notes')->nullable();
            $table->timestamp('converted_at')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('owner_user_id')->references('user_id')->on('users')->nullOnDelete();
            $table->foreign('source_id')->references('source_id')->on('lead_sources')->nullOnDelete();
            $table->foreign('category_id')->references('category_id')->on('reference_categories')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
        Schema::dropIfExists('contacts');
        Schema::dropIfExists('accounts');
    }
};
