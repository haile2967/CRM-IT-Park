<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Contact;
use App\Models\ReferenceCategory;
use App\Models\User;
use Illuminate\Database\Seeder;

class AccountReferenceSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Account Types in reference_categories
        $accountTypes = [
            [
                'category_group' => 'account_type',
                'category_name' => 'Startup Incubatee',
                'description' => 'Early-stage innovative tech startups in incubation & acceleration cohorts',
                'display_order' => 1,
            ],
            [
                'category_group' => 'account_type',
                'category_name' => 'Commercial Park Tenant',
                'description' => 'Enterprises leasing office suites, Tier-3 data center racks, or assembly floors',
                'display_order' => 2,
            ],
            [
                'category_group' => 'account_type',
                'category_name' => 'Strategic Partner / Investor',
                'description' => 'Venture capital funds, commercial banks, development partners, and telecom operators',
                'display_order' => 3,
            ],
            [
                'category_group' => 'account_type',
                'category_name' => 'Government & Academic Partner',
                'description' => 'Research universities, innovation labs, and public sector partner agencies',
                'display_order' => 4,
            ],
        ];

        foreach ($accountTypes as $type) {
            ReferenceCategory::updateOrCreate(
                [
                    'category_group' => $type['category_group'],
                    'category_name' => $type['category_name'],
                ],
                array_merge($type, ['is_active' => true])
            );
        }

        // 2. Fetch admin user and account types for seed data
        $admin = User::first();
        $incubateeType = ReferenceCategory::where('category_group', 'account_type')
            ->where('category_name', 'Startup Incubatee')->first();
        $tenantType = ReferenceCategory::where('category_group', 'account_type')
            ->where('category_name', 'Commercial Park Tenant')->first();
        $partnerType = ReferenceCategory::where('category_group', 'account_type')
            ->where('category_name', 'Strategic Partner / Investor')->first();

        // 3. Seed Realistic Initial Accounts & Contacts
        $demoAccounts = [
            [
                'account' => [
                    'organization_name' => 'Ethio-Fintech Global PLC',
                    'account_type_id' => $tenantType?->id ?? 1,
                    'industry' => 'Fintech & Digital Payments',
                    'location' => 'Building B, 2nd Floor, Phase 1',
                    'owner_user_id' => $admin?->id,
                    'contact_information' => json_encode([
                        'email' => 'info@ethiofintech.et',
                        'phone' => '+251 11 667 8901',
                        'website' => 'https://ethiofintech.et',
                    ]),
                    'engagement_history' => 'Commercial park tenant since 2024. Leased 350 sqm office suite with dedicated fiber.',
                ],
                'contact' => [
                    'first_name' => 'Dawit',
                    'last_name' => 'Kebede',
                    'role_title' => 'Managing Director',
                    'email' => 'dawit.k@ethiofintech.et',
                    'phone' => '+251 91 123 4567',
                    'is_primary' => true,
                ],
            ],
            [
                'account' => [
                    'organization_name' => 'East Africa Cloud Technologies',
                    'account_type_id' => $tenantType?->id ?? 1,
                    'industry' => 'AI, Big Data & Cloud Hosting',
                    'location' => 'ICT Park Data Center Facility 1',
                    'owner_user_id' => $admin?->id,
                    'contact_information' => json_encode([
                        'email' => 'support@eacloud.africa',
                        'phone' => '+251 11 556 7890',
                        'website' => 'https://eacloud.africa',
                    ]),
                    'engagement_history' => 'Major hyperscale hosting tenant operating 12 high-density server racks in Park Tier-3 facility.',
                ],
                'contact' => [
                    'first_name' => 'Amina',
                    'last_name' => 'Mohammed',
                    'role_title' => 'Chief Technology Officer',
                    'email' => 'amina.m@eacloud.africa',
                    'phone' => '+251 92 234 5678',
                    'is_primary' => true,
                ],
            ],
            [
                'account' => [
                    'organization_name' => 'AfroTech Innovation Hub',
                    'account_type_id' => $incubateeType?->id ?? 1,
                    'industry' => 'Software Engineering & SaaS',
                    'location' => 'Incubation Hub, Innovation Complex 3rd Floor',
                    'owner_user_id' => $admin?->id,
                    'contact_information' => json_encode([
                        'email' => 'hello@afrotechhub.org',
                        'phone' => '+251 11 445 6789',
                        'website' => 'https://afrotechhub.org',
                    ]),
                    'engagement_history' => 'Cohort 4 Startup Incubatee. Developing AI-powered regional language translation models.',
                ],
                'contact' => [
                    'first_name' => 'Yared',
                    'last_name' => 'Bekele',
                    'role_title' => 'Co-Founder & Lead Engineer',
                    'email' => 'yared@afrotechhub.org',
                    'phone' => '+251 93 345 6789',
                    'is_primary' => true,
                ],
            ],
            [
                'account' => [
                    'organization_name' => 'Safaricom Enterprise Solutions',
                    'account_type_id' => $partnerType?->id ?? 1,
                    'industry' => 'Telecom, IoT & Hardware',
                    'location' => 'ICT Park Commercial Plaza, Suite 400',
                    'owner_user_id' => $admin?->id,
                    'contact_information' => json_encode([
                        'email' => 'enterprise@safaricom.et',
                        'phone' => '+251 77 100 2000',
                        'website' => 'https://safaricom.et',
                    ]),
                    'engagement_history' => 'Strategic telecommunications infrastructure partner providing 5G testbeds and dark fiber connectivity.',
                ],
                'contact' => [
                    'first_name' => 'Michael',
                    'last_name' => 'Tesfaye',
                    'role_title' => 'Director of Ecosystem Partnerships',
                    'email' => 'm.tesfaye@safaricom.et',
                    'phone' => '+251 94 456 7890',
                    'is_primary' => true,
                ],
            ],
        ];

        foreach ($demoAccounts as $item) {
            $account = Account::updateOrCreate(
                ['organization_name' => $item['account']['organization_name']],
                $item['account']
            );

            Contact::updateOrCreate(
                [
                    'account_id' => $account->id,
                    'email' => $item['contact']['email'],
                ],
                array_merge($item['contact'], [
                    'account_id' => $account->id,
                    'owner_user_id' => $account->owner_user_id,
                ])
            );
        }
    }
}
