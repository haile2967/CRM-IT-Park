<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with SRS v1.0 and Database Design v2.0 baseline data.
     */
    public function run(): void
    {
        // 1. Seed Roles (§3.2, Table 2)
        $roles = [
            ['role_name' => 'CRM Manager', 'role_tier' => 1, 'description' => 'Full visibility across all business records, reporting, pipeline, and escalations.'],
            ['role_name' => 'Business Development Officer', 'role_tier' => 2, 'description' => 'Manages leads, conversions, accounts, opportunities, and activities within assigned ownership.'],
            ['role_name' => 'Support Agent', 'role_tier' => 3, 'description' => 'Handles support tickets within assigned queue, customer communication, and triage.'],
            ['role_name' => 'System Administrator', 'role_tier' => 4, 'description' => 'Maintains reference master data, escalation rules, integration exports, and user accounts.'],
        ];
        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(
                ['role_name' => $role['role_name']],
                array_merge($role, ['is_active' => true, 'created_at' => now(), 'updated_at' => now()])
            );
        }

        $adminRoleId = DB::table('roles')->where('role_name', 'System Administrator')->value('role_id');
        $managerRoleId = DB::table('roles')->where('role_name', 'CRM Manager')->value('role_id');
        $bdoRoleId = DB::table('roles')->where('role_name', 'Business Development Officer')->value('role_id');
        $supportRoleId = DB::table('roles')->where('role_name', 'Support Agent')->value('role_id');

        // 2. Seed Baseline System Users (Table 1)
        $users = [
            [
                'role_id' => $adminRoleId,
                'first_name' => 'Admin',
                'last_name' => 'User',
                'email' => 'admin@itpark.gov.et',
                'password' => Hash::make('Admin@ITPark2026!'),
                'phone' => '+251911000001',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => $managerRoleId,
                'first_name' => 'Dawit',
                'last_name' => 'Haile',
                'email' => 'manager@itpark.gov.et',
                'password' => Hash::make('Manager@ITPark2026!'),
                'phone' => '+251911000002',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => $bdoRoleId,
                'first_name' => 'Abebe',
                'last_name' => 'Bikila',
                'email' => 'bdo@itpark.gov.et',
                'password' => Hash::make('BDO@ITPark2026!'),
                'phone' => '+251911000003',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'role_id' => $supportRoleId,
                'first_name' => 'Sara',
                'last_name' => 'Kebede',
                'email' => 'support@itpark.gov.et',
                'password' => Hash::make('Support@ITPark2026!'),
                'phone' => '+251911000004',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        foreach ($users as $user) {
            DB::table('users')->updateOrInsert(['email' => $user['email']], $user);
        }

        $adminUserId = DB::table('users')->where('email', 'admin@itpark.gov.et')->value('user_id');

        // 3. Seed Lead Sources (§8.2, Table 4)
        $sources = [
            'Referral', 'Website', 'Event', 'Partner Referral',
            'Cold Outreach', 'Walk-in', 'Social Media', 'Other'
        ];
        foreach ($sources as $source) {
            DB::table('lead_sources')->updateOrInsert(
                ['source_name' => $source],
                ['description' => "Lead acquired through {$source}", 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        // 4. Seed Reference Categories (§8.2, Table 26)
        $categories = [
            // Account / Lead types
            ['group' => 'account_type', 'name' => 'startup', 'order' => 1],
            ['group' => 'account_type', 'name' => 'investor', 'order' => 2],
            ['group' => 'account_type', 'name' => 'company', 'order' => 3],
            ['group' => 'account_type', 'name' => 'government', 'order' => 4],
            ['group' => 'account_type', 'name' => 'partner', 'order' => 5],
            // Lead categories
            ['group' => 'lead_category', 'name' => 'startup', 'order' => 1],
            ['group' => 'lead_category', 'name' => 'investor', 'order' => 2],
            ['group' => 'lead_category', 'name' => 'company', 'order' => 3],
            ['group' => 'lead_category', 'name' => 'government', 'order' => 4],
            ['group' => 'lead_category', 'name' => 'partner', 'order' => 5],
        ];
        foreach ($categories as $cat) {
            DB::table('reference_categories')->updateOrInsert(
                ['category_group' => $cat['group'], 'category_name' => $cat['name']],
                ['display_order' => $cat['order'], 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        // 5. Seed Opportunity Types (§5.2, Table 8)
        $oppTypes = ['investment', 'partnership', 'service', 'program enrollment'];
        foreach ($oppTypes as $type) {
            DB::table('opportunity_types')->updateOrInsert(
                ['type_name' => $type],
                ['description' => ucfirst($type) . ' commercial engagement', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        // 6. Seed Pipeline Stages (§5.6, Table 9)
        $stages = [
            ['name' => 'New', 'order' => 1, 'is_won' => false, 'is_lost' => false],
            ['name' => 'Contacted', 'order' => 2, 'is_won' => false, 'is_lost' => false],
            ['name' => 'Qualified', 'order' => 3, 'is_won' => false, 'is_lost' => false],
            ['name' => 'Proposal/Negotiation', 'order' => 4, 'is_won' => false, 'is_lost' => false],
            ['name' => 'Closed Won', 'order' => 5, 'is_won' => true, 'is_lost' => false],
            ['name' => 'Closed Lost', 'order' => 6, 'is_won' => false, 'is_lost' => true],
        ];
        foreach ($stages as $stage) {
            DB::table('pipeline_stages')->updateOrInsert(
                ['stage_name' => $stage['name']],
                [
                    'display_order' => $stage['order'],
                    'is_closed_won' => $stage['is_won'],
                    'is_closed_lost' => $stage['is_lost'],
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // 7. Seed Ticket Categories (§5.8, Table 14)
        $ticketCats = [
            'technical' => 'Technical and infrastructure support issues',
            'service request' => 'Requests for park amenities and services',
            'general inquiry' => 'General queries, visitor information, and questions'
        ];
        foreach ($ticketCats as $name => $desc) {
            DB::table('ticket_categories')->updateOrInsert(
                ['category_name' => $name],
                ['description' => $desc, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]
            );
        }

        // 8. Seed Business Hours Calendar (Table 27, 28, 29)
        DB::table('business_hours_calendars')->updateOrInsert(
            ['calendar_name' => 'Ethiopian IT Park Working Calendar'],
            ['timezone' => 'Africa/Addis_Ababa', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()]
        );
        $calId = DB::table('business_hours_calendars')->where('calendar_name', 'Ethiopian IT Park Working Calendar')->value('calendar_id');

        for ($day = 1; $day <= 7; $day++) {
            $isWorking = ($day <= 5); // Mon-Fri
            DB::table('business_hours')->updateOrInsert(
                ['calendar_id' => $calId, 'day_of_week' => $day],
                [
                    'start_time' => $isWorking ? '08:30:00' : null,
                    'end_time' => $isWorking ? '17:30:00' : null,
                    'is_working_day' => $isWorking,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // 9. Seed Escalation Policies (§6 BR-001, Table 15)
        // Rule: reminder_threshold_minutes strictly less than escalation_threshold_minutes
        $policies = [
            ['priority' => 'Urgent', 'reminder' => 120, 'escalation' => 240, 'basis' => 'calendar'],     // 2h reminder, 4h escalation
            ['priority' => 'High', 'reminder' => 240, 'escalation' => 480, 'basis' => 'calendar'],       // 4h reminder, 8h escalation
            ['priority' => 'Medium', 'reminder' => 480, 'escalation' => 960, 'basis' => 'business_hours'], // 8h reminder, 16h escalation
            ['priority' => 'Low', 'reminder' => 1440, 'escalation' => 2880, 'basis' => 'business_hours'],  // 24h reminder, 48h escalation
        ];
        foreach ($policies as $pol) {
            DB::table('escalation_policies')->updateOrInsert(
                ['priority' => $pol['priority']],
                [
                    'reminder_threshold_minutes' => $pol['reminder'],
                    'escalation_threshold_minutes' => $pol['escalation'],
                    'time_basis' => $pol['basis'],
                    'is_active' => true,
                    'created_by_user_id' => $adminUserId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
