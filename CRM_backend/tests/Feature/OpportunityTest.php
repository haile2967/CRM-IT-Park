<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\ExportRecord;
use App\Models\Opportunity;
use App\Models\OpportunityStageHistory;
use App\Models\OpportunityType;
use App\Models\PipelineStage;
use App\Models\ReferenceCategory;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class OpportunityTest extends TestCase
{
    use DatabaseTransactions;

    protected User $admin;
    protected Account $account;
    protected OpportunityType $oppType;
    protected PipelineStage $stageNew;
    protected PipelineStage $stageWon;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'System Administrator', 'guard_name' => 'web']);
        $this->admin = User::firstOrCreate(
            ['email' => 'opp_admin@itpark.gov.et'],
            [
                'first_name' => 'OppAdmin',
                'last_name' => 'System',
                'password' => bcrypt('Password123!'),
                'status' => 'active',
                'keycloak_id' => '11111111-2222-3333-4444-555555555555',
            ]
        );
        $this->admin->syncRoles(['System Administrator']);

        $category = ReferenceCategory::firstOrCreate(
            ['category_name' => 'Commercial Park Tenant', 'category_group' => 'account_type'],
            ['description' => 'Commercial Park Tenant', 'is_active' => true]
        );

        $this->account = Account::firstOrCreate(
            ['organization_name' => 'Test Tech PLC'],
            [
                'account_type_id' => $category->id,
                'owner_user_id' => $this->admin->id,
                'industry' => 'Cloud Hosting',
                'location' => 'Addis Ababa',
            ]
        );

        $this->oppType = OpportunityType::firstOrCreate(
            ['type_name' => 'Commercial Park Lease'],
            ['description' => 'Commercial lease', 'is_active' => true]
        );

        $this->stageNew = PipelineStage::firstOrCreate(
            ['stage_name' => 'New'],
            ['display_order' => 1, 'is_closed_won' => false, 'is_closed_lost' => false, 'is_active' => true]
        );

        $this->stageWon = PipelineStage::firstOrCreate(
            ['stage_name' => 'Closed Won'],
            ['display_order' => 5, 'is_closed_won' => true, 'is_closed_lost' => false, 'is_active' => true]
        );
    }

    public function test_authenticated_user_can_list_opportunities(): void
    {
        Opportunity::create([
            'account_id' => $this->account->id,
            'opportunity_type_id' => $this->oppType->id,
            'stage_id' => $this->stageNew->id,
            'owner_user_id' => $this->admin->id,
            'value' => 500000.00,
            'probability' => 50.00,
            'expected_close_date' => now()->addMonth()->toDateString(),
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->admin, 'web')
            ->getJson('/api/v1/opportunities');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'value', 'probability', 'status', 'account', 'opportunity_type', 'stage']
                ],
                'meta' => ['total', 'current_page']
            ]);
    }

    public function test_opportunities_metrics_endpoint(): void
    {
        Opportunity::create([
            'account_id' => $this->account->id,
            'opportunity_type_id' => $this->oppType->id,
            'stage_id' => $this->stageNew->id,
            'owner_user_id' => $this->admin->id,
            'value' => 1000000.00,
            'probability' => 60.00,
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->admin, 'web')
            ->getJson('/api/v1/opportunities/metrics');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_opportunities',
                    'open_deals_count',
                    'total_pipeline_value',
                    'weighted_forecast_value',
                    'win_rate_pct',
                    'stage_breakdown',
                ]
            ]);
    }

    public function test_kanban_board_endpoint(): void
    {
        $response = $this->actingAs($this->admin, 'web')
            ->getJson('/api/v1/opportunities/kanban');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'stage_id',
                        'stage_name',
                        'total_deals',
                        'total_value',
                        'weighted_value',
                        'opportunities',
                    ]
                ]
            ]);
    }

    public function test_user_can_create_opportunity_and_logs_history(): void
    {
        $payload = [
            'account_id' => $this->account->id,
            'opportunity_type_id' => $this->oppType->id,
            'stage_id' => $this->stageNew->id,
            'value' => 750000.00,
            'probability' => 40.00,
            'expected_close_date' => now()->addDays(30)->toDateString(),
            'notes' => 'Testing opportunity creation workflow.',
        ];

        $response = $this->actingAs($this->admin, 'web')
            ->postJson('/api/v1/opportunities', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.value', 750000);

        $oppId = $response->json('data.id');

        $this->assertDatabaseHas('opportunities', [
            'id' => $oppId,
            'account_id' => $this->account->id,
            'status' => 'open',
        ]);

        $this->assertDatabaseHas('opportunity_stage_history', [
            'opportunity_id' => $oppId,
            'to_stage_id' => $this->stageNew->id,
        ]);
    }

    public function test_user_can_transition_stage_to_closed_won(): void
    {
        $opportunity = Opportunity::create([
            'account_id' => $this->account->id,
            'opportunity_type_id' => $this->oppType->id,
            'stage_id' => $this->stageNew->id,
            'owner_user_id' => $this->admin->id,
            'value' => 2000000.00,
            'probability' => 30.00,
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->admin, 'web')
            ->patchJson("/api/v1/opportunities/{$opportunity->id}/stage", [
                'stage_id' => $this->stageWon->id,
                'notes' => 'Contract signed by executive committee.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.status', 'closed_won')
            ->assertJsonPath('data.probability', 100);

        $this->assertDatabaseHas('opportunities', [
            'id' => $opportunity->id,
            'status' => 'closed_won',
            'stage_id' => $this->stageWon->id,
        ]);

        $this->assertDatabaseHas('opportunity_stage_history', [
            'opportunity_id' => $opportunity->id,
            'from_stage_id' => $this->stageNew->id,
            'to_stage_id' => $this->stageWon->id,
        ]);
    }

    public function test_pms_export_endpoint_generates_handoff_and_records_audit(): void
    {
        $opportunity = Opportunity::create([
            'account_id' => $this->account->id,
            'opportunity_type_id' => $this->oppType->id,
            'stage_id' => $this->stageWon->id,
            'owner_user_id' => $this->admin->id,
            'value' => 5000000.00,
            'probability' => 100.00,
            'expected_close_date' => now()->toDateString(),
            'status' => 'closed_won',
        ]);

        // JSON format export
        $response = $this->actingAs($this->admin, 'web')
            ->getJson("/api/v1/opportunities/{$opportunity->id}/pms-export?format=json");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.opportunity.id', $opportunity->id)
            ->assertJsonPath('data.account.organization_name', 'Test Tech PLC');

        $this->assertDatabaseHas('export_records', [
            'opportunity_id' => $opportunity->id,
            'export_type' => 'PMS handoff',
            'export_format' => 'JSON',
            'status' => 'completed',
        ]);
    }
}
