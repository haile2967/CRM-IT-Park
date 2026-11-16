<?php

namespace Database\Seeders;

use App\Enums\TicketPriority;
use App\Models\Account;
use App\Models\Contact;
use App\Models\EscalationPolicy;
use App\Models\Ticket;
use App\Models\TicketCategory;
use App\Models\TicketComment;
use App\Models\TicketEscalationHistory;
use App\Models\User;
use Illuminate\Database\Seeder;

class TicketReferenceSeeder extends Seeder
{
    /**
     * Seed Ticket Categories, Escalation Policies, and realistic Demo Tickets.
     */
    public function run(): void
    {
        $admin = User::first();
        if (!$admin) {
            return;
        }

        // 1. Seed 5 Professional Ticket Categories
        $categories = [
            [
                'category_name' => 'IT, Cloud & Telecom Infrastructure',
                'description' => 'Dedicated fiber connectivity, server rack colocation, IP allocation, and data center cooling.',
                'is_active' => true,
            ],
            [
                'category_name' => 'Power, Facility & Utilities',
                'description' => 'Secondary grid backup, UPS generator power, HVAC climate maintenance, and office repairs.',
                'is_active' => true,
            ],
            [
                'category_name' => 'Physical Access & Security',
                'description' => 'Biometric access registration, smart NFC keycards, vehicle parking passes, and visitor security.',
                'is_active' => true,
            ],
            [
                'category_name' => 'Billing, Metering & Contracts',
                'description' => 'Power sub-metering, utility invoicing, currency exchange approval, and lease renewals.',
                'is_active' => true,
            ],
            [
                'category_name' => 'Incubation & Business Advisory',
                'description' => 'Duty-free equipment clearance, legal/tax advisory, and startup acceleration mentorship.',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $cat) {
            TicketCategory::firstOrCreate(
                ['category_name' => $cat['category_name']],
                $cat
            );
        }

        // 2. Seed Escalation Policies for all 4 Priorities
        $policies = [
            [
                'priority' => TicketPriority::URGENT,
                'reminder_threshold_minutes' => 120, // 2 hours
                'escalation_threshold_minutes' => 240, // 4 hours
                'time_basis' => 'calendar',
                'is_active' => true,
                'created_by_user_id' => $admin->id,
            ],
            [
                'priority' => TicketPriority::HIGH,
                'reminder_threshold_minutes' => 240, // 4 hours
                'escalation_threshold_minutes' => 480, // 8 hours
                'time_basis' => 'calendar',
                'is_active' => true,
                'created_by_user_id' => $admin->id,
            ],
            [
                'priority' => TicketPriority::MEDIUM,
                'reminder_threshold_minutes' => 720, // 12 hours
                'escalation_threshold_minutes' => 1440, // 24 hours
                'time_basis' => 'business_hours',
                'is_active' => true,
                'created_by_user_id' => $admin->id,
            ],
            [
                'priority' => TicketPriority::LOW,
                'reminder_threshold_minutes' => 1440, // 24 hours
                'escalation_threshold_minutes' => 2880, // 48 hours
                'time_basis' => 'business_hours',
                'is_active' => true,
                'created_by_user_id' => $admin->id,
            ],
        ];

        foreach ($policies as $pol) {
            EscalationPolicy::firstOrCreate(
                ['priority' => $pol['priority']],
                $pol
            );
        }

        // 3. Demo Tickets Linked to Corporate Accounts
        $accounts = Account::all()->keyBy('organization_name');
        $catMap = TicketCategory::all()->keyBy('category_name');
        $urgentPolicy = EscalationPolicy::where('priority', TicketPriority::URGENT)->first();

        if ($accounts->isEmpty() || $catMap->isEmpty()) {
            return;
        }

        $demoTickets = [
            [
                'account_name' => 'East Africa Cloud Technologies',
                'category_name' => 'Power, Facility & Utilities',
                'priority' => TicketPriority::URGENT,
                'status' => 'open',
                'subject' => 'Data Center Wing B Secondary UPS Backup Power Trip',
                'description' => 'Secondary ATS switch failed during weekly test transfer. Server racks 12-18 currently running on single grid input without battery redundancy.',
                'assignee_user_id' => null, // In Unassigned Queue!
                'escalated' => true,
                'escalated_at' => now()->subHours(2),
                'last_activity_at' => now()->subHours(5),
                'inactivity_duration_seconds' => 18000,
                'comments' => [
                    [
                        'user_id' => $admin->id,
                        'comment_text' => 'Automatic Inactivity Alert: Ticket unassigned for over 4 hours. Escalated to Park Facility Operations Director.',
                        'is_internal' => true,
                        'created_at' => now()->subHours(2),
                    ],
                ],
            ],
            [
                'account_name' => 'Ethio-Fintech Global PLC',
                'category_name' => 'IT, Cloud & Telecom Infrastructure',
                'priority' => TicketPriority::HIGH,
                'status' => 'in_progress',
                'subject' => 'Dedicated Fiber 10Gbps Cross-Connect Packet Loss',
                'description' => 'Intermittent 8-12% packet drops observed on outbound banking gateway VLAN 402 connecting to EthSwitch.',
                'assignee_user_id' => $admin->id,
                'escalated' => false,
                'last_activity_at' => now()->subMinutes(25),
                'inactivity_duration_seconds' => 1500,
                'comments' => [
                    [
                        'user_id' => $admin->id,
                        'comment_text' => 'Initial OTDR test indicates signal reflection at fiber junction box JB-04 near the park substation.',
                        'is_internal' => true,
                        'created_at' => now()->subHours(1),
                    ],
                    [
                        'user_id' => $admin->id,
                        'comment_text' => 'Technicians dispatched with fusion splicer. ETA to full recovery: 45 minutes.',
                        'is_internal' => false,
                        'created_at' => now()->subMinutes(25),
                    ],
                ],
            ],
            [
                'account_name' => 'AfroTech Innovation Hub',
                'category_name' => 'Physical Access & Security',
                'priority' => TicketPriority::MEDIUM,
                'status' => 'open',
                'subject' => 'Biometric Smart NFC Keycards Issuance (25 Engineers)',
                'description' => 'Cohort 4 developers onboarding next Monday. Need NFC badges programmed for 24/7 incubator access and turnstile gates.',
                'assignee_user_id' => null, // Unassigned!
                'escalated' => false,
                'last_activity_at' => now()->subHours(1),
                'inactivity_duration_seconds' => 3600,
                'comments' => [],
            ],
            [
                'account_name' => 'Safaricom Enterprise Solutions',
                'category_name' => 'IT, Cloud & Telecom Infrastructure',
                'priority' => TicketPriority::HIGH,
                'status' => 'resolved',
                'subject' => '5G Testbed Roof Antenna Installation Site Access Clearance',
                'description' => 'Rooftop mounting brackets installed on Tower 3. Structural engineering certification filed with Ministry of Innovation and Technology.',
                'assignee_user_id' => $admin->id,
                'escalated' => false,
                'closed_at' => now()->subDay(),
                'last_activity_at' => now()->subDay(),
                'inactivity_duration_seconds' => 86400,
                'comments' => [
                    [
                        'user_id' => $admin->id,
                        'comment_text' => 'Safety audit completed. Antenna mast certified for 120 km/h wind load resistance. Tenant handed rooftop keys.',
                        'is_internal' => false,
                        'created_at' => now()->subDay(),
                    ],
                ],
            ],
            [
                'account_name' => 'East Africa Cloud Technologies',
                'category_name' => 'Billing, Metering & Contracts',
                'priority' => TicketPriority::LOW,
                'status' => 'closed',
                'subject' => 'Sub-metered Power Invoicing & Forex Payment Endorsement',
                'description' => 'Requesting itemized kilowatt-hour billing breakdown for Q3 data center electricity consumption to process NBE foreign exchange clearance.',
                'assignee_user_id' => $admin->id,
                'escalated' => false,
                'closed_at' => now()->subDays(3),
                'last_activity_at' => now()->subDays(3),
                'inactivity_duration_seconds' => 259200,
                'comments' => [
                    [
                        'user_id' => $admin->id,
                        'comment_text' => 'Official verified meter statement issued and stamped by Park Finance Division.',
                        'is_internal' => false,
                        'created_at' => now()->subDays(3),
                    ],
                ],
            ],
        ];

        foreach ($demoTickets as $item) {
            $account = $accounts->get($item['account_name']);
            $cat = $catMap->get($item['category_name']);

            if (!$account || !$cat) {
                continue;
            }

            $primaryContact = $account->primaryContact;

            $ticket = Ticket::updateOrCreate(
                [
                    'account_id' => $account->id,
                    'subject' => $item['subject'],
                ],
                [
                    'contact_id' => $primaryContact?->id,
                    'assignee_user_id' => $item['assignee_user_id'],
                    'category_id' => $cat->id,
                    'priority' => $item['priority'],
                    'status' => $item['status'],
                    'description' => $item['description'],
                    'escalated' => $item['escalated'],
                    'escalated_at' => $item['escalated_at'] ?? null,
                    'last_activity_at' => $item['last_activity_at'],
                    'inactivity_duration_seconds' => $item['inactivity_duration_seconds'],
                    'closed_at' => $item['closed_at'] ?? null,
                ]
            );

            // Seed escalation history if escalated
            if ($item['escalated'] && $urgentPolicy) {
                TicketEscalationHistory::firstOrCreate(
                    [
                        'ticket_id' => $ticket->id,
                        'escalated_at' => $item['escalated_at'],
                    ],
                    [
                        'escalation_policy_id' => $urgentPolicy->id,
                        'inactivity_duration_minutes' => 240,
                        'notification_sent' => true,
                    ]
                );
            }

            // Seed comments
            foreach ($item['comments'] as $comm) {
                TicketComment::firstOrCreate(
                    [
                        'ticket_id' => $ticket->id,
                        'comment_text' => $comm['comment_text'],
                    ],
                    [
                        'user_id' => $comm['user_id'],
                        'is_internal' => $comm['is_internal'],
                        'created_at' => $comm['created_at'],
                        'updated_at' => $comm['created_at'],
                    ]
                );
            }
        }
    }
}
