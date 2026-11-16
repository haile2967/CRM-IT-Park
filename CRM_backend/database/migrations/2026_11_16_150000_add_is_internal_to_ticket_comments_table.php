<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('ticket_comments') && !Schema::hasColumn('ticket_comments', 'is_internal')) {
            Schema::table('ticket_comments', function (Blueprint $table) {
                $table->boolean('is_internal')->default(false)->after('comment_text');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('ticket_comments') && Schema::hasColumn('ticket_comments', 'is_internal')) {
            Schema::table('ticket_comments', function (Blueprint $table) {
                $table->dropColumn('is_internal');
            });
        }
    }
};
