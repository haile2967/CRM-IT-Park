<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Opportunity;
use App\Models\OpportunityStageHistory;
use App\Models\OpportunityType;
use App\Models\PipelineStage;
use App\Models\User;
use Illuminate\Database\Seeder;

class OpportunityReferenceSeeder extends Seeder
{
    /**
     * Seed Opportunity Types and realistic Demo Opportunities.
     */
    public function run(): void
    {
        // 1. Seed Opportunity Types (SRS §5.2 FR-OPP-002)
        $types = [
            [
                'type_name' => 'Commercial Park Lease',
                'description' => 'Commercial space, data center rack, or facility lease inside Ethiopian IT Park',
                'is_active' => true,
            ],
            [
                'type_name' => 'Investment',
                'description' => 'Direct foreign or local investment, venture fund deployment, or capital allocation',
                'is_active' => true,
            ],
            [
                'type_name' => 'Partnership',
                'description' => 'Strategic ecosystem, infrastructure, or institutional collaboration agreement',
                'is_active' => true,
            ],
            [
                'type_name' => 'Program Enrollment',
                'description' => 'Incubation, acceleration, bootcamp, or innovation hub enrollment program',
                'is_active' => true,
            ],
            [
                'type_name' => 'Service',
                'description' => 'Shared IT services, cloud connectivity, power redundancy, or specialized consulting',
                'is_active' => true,
            ],
        ];

        foreach ($types as $typeData) {
            OpportunityType::firstOrCreate(
                ['type_name' => $typeData['type_name']],
                $typeData
            );
        }

        // 2. Fetch references for demo opportunities
        $admin = User::first();
        if (!$admin) {
            return;
        }

        $stages = PipelineStage::orderBy('display_order')->get()->keyBy('stage_name');
        $typeMap = OpportunityType::all()->keyBy('type_name');
        $accounts = Account::all()->keyBy('organization_name');

        if ($stages->isEmpty() || $typeMap->isEmpty() || $accounts->isEmpty()) {
            return;
        }

        // 3. Demo Opportunities linked to seeded Accounts
        $demoOpportunities = [
            [
                'account_name' => 'Ethio-Fintech Global PLC',
                'type_name' => 'Commercial Park Lease',
                'stage_name' => 'Proposal / Negotiation',
                'value' => 14500000.00,
                'probability' => 75.00,
                'expected_close_date' => now()->addDays(20)->toDateString(),
                'status' => 'open',
                'notes' => 'Lease proposal for 450 sqm Tier-2 Fintech incubator wing with dedicated high-speed fiber backbone.',
                'history' => [
                    ['from' => 'New', 'to' => 'Contacted', 'notes' => 'Initial introductory meeting with CEO Abebe Kebede.'],
                    ['from' => 'Contacted', 'to' => 'Qualified', 'notes' => 'TIN verified and technical space specs approved by engineering team.'],
                    ['from' => 'Qualified', 'to' => 'Proposal / Negotiation', 'notes' => 'Issued official 3-year commercial lease draft at 14.5M ETB.'],
                ],
            ],
            [
                'account_name' => 'East Africa Cloud Technologies',
                'type_name' => 'Commercial Park Lease',
                'stage_name' => 'Qualified',
                'value' => 24800000.00,
                'probability' => 60.00,
                'expected_close_date' => now()->addDays(45)->toDateString(),
                'status' => 'open',
                'notes' => 'Colocation and dedicated 750 sqm data center building lease with 99.999% dual-grid power requirement.',
                'history' => [
                    ['from' => 'New', 'to' => 'Contacted', 'notes' => 'Reviewed power substation capacity requirements.'],
                    ['from' => 'Contacted', 'to' => 'Qualified', 'notes' => 'Facility audit passed with Ethiopian Electric Power confirmation.'],
                ],
            ],
            [
                'account_name' => 'AfroTech Innovation Hub',
                'type_name' => 'Program Enrollment',
                'stage_name' => 'New',
                'value' => 3200000.00,
                'probability' => 35.00,
                'expected_close_date' => now()->addDays(60)->toDateString(),
                'status' => 'open',
                'notes' => 'Cohort 4 incubation application for 25 developer workstations and cloud computing credits.',
                'history' => [],
            ],
            [
                'account_name' => 'Safaricom Enterprise Solutions',
                'type_name' => 'Partnership',
                'stage_name' => 'Closed Won',
                'value' => 38000000.00,
                'probability' => 100.00,
                'expected_close_date' => now()->subDays(5)->toDateString(),
                'status' => 'closed_won',
                'closed_at' => now()->subDays(5),
                'notes' => 'Master Infrastructure Service Agreement signed. 5G testbed facility operationalization.',
                'history' => [
                    ['from' => 'New', 'to' => 'Contacted', 'notes' => 'Joint working group established.'],
                    ['from' => 'Contacted', 'to' => 'Qualified', 'notes' => 'Regulatory clearance from ECA confirmed.'],
                    ['from' => 'Qualified', 'to' => 'Proposal / Negotiation', 'notes' => 'Final terms reviewed by Park Legal Counsel.'],
                    ['from' => 'Proposal / Negotiation', 'to' => 'Closed Won', 'notes' => 'Contract signed by CEO. Ready for PMS office and antenna tower handover.'],
                ],
            ],
        ];

        foreach ($demoOpportunities as $demo) {
            $account = $accounts->get($demo['account_name']);
            $type = $typeMap->get($demo['type_name']);
            $stage = $stages->get($demo['stage_name']);

            if (!$account || !$type || !$stage) {
                continue;
            }

            // Create or update opportunity
            $opportunity = Opportunity::updateOrCreate(
                [
                    'account_id' => $account->id,
                    'opportunity_type_id' => $type->id,
                ],
                [
                    'owner_user_id' => $admin->id,
                    'stage_id' => $stage->id,
                    'value' => $demo['value'],
                    'probability' => $demo['probability'],
                    'expected_close_date' => $demo['expected_close_date'],
                    'status' => $demo['status'],
                    'closed_at' => $demo['closed_at'] ?? null,
                    'notes' => $demo['notes'],
                ]
            );

            // Seed Stage History
            foreach ($demo['history'] as $hist) {
                $fromStage = $stages->get($hist['from']);
                $toStage = $stages->get($hist['to']);

                if ($toStage) {
                    OpportunityStageHistory::firstOrCreate(
                        [
                            'opportunity_id' => $opportunity->id,
                            'to_stage_id' => $toStage->id,
                            'from_stage_id' => $fromStage?->id,
                        ],
                        [
                            'changed_by_user_id' => $admin->id,
                            'changed_at' => now()->subDays(rand(1, 15)),
                            'notes' => $hist['notes'],
                        ]
                    );
                }
            }
        }
    }
}
