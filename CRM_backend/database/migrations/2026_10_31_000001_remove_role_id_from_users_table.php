<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Decommissions the legacy users.role_id column in favor of Spatie's model_has_roles pivot.
     */
    public function up(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'role_id')) {
            // 1. Safety backfill: Ensure every user with a role_id is in model_has_roles
            DB::statement("
                INSERT INTO model_has_roles (role_id, model_type, model_id)
                SELECT role_id, 'App\\\\Models\\\\User', id 
                FROM users 
                WHERE role_id IS NOT NULL
                ON CONFLICT (role_id, model_id, model_type) DO NOTHING
            ");

            // 2. Drop the foreign key constraint and column
            Schema::table('users', function (Blueprint $table) {
                // Drop foreign key if it exists
                $table->dropForeign(['role_id']);
                $table->dropColumn('role_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('users') && !Schema::hasColumn('users', 'role_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreignId('role_id')->nullable()->constrained('roles')->nullOnDelete();
            });

            // Backfill role_id from model_has_roles if possible
            DB::statement("
                UPDATE users u
                SET role_id = mhr.role_id
                FROM model_has_roles mhr
                WHERE mhr.model_id = u.id AND mhr.model_type = 'App\\\\Models\\\\User'
            ");
        }
    }
};

