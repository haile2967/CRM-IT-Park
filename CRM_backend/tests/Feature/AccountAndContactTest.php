<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Contact;
use App\Models\Opportunity;
use App\Models\OpportunityType;
use App\Models\PipelineStage;
use App\Models\ReferenceCategory;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class AccountAndContactTest extends TestCase
{
    use DatabaseTransactions;
    protected User $admin;
    protected ReferenceCategory $accountType;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'System Administrator', 'guard_name' => 'web']);
        $this->admin = User::firstOrCreate(
            ['email' => 'admin_test@itpark.gov.et'],
            [
                'first_name' => 'Admin',
                'last_name' => 'Test',
                'status' => 'active',
                'password' => bcrypt('Password123!'),
            ]
        );
        $this->admin->syncRoles([$adminRole]);

        $this->accountType = ReferenceCategory::firstOrCreate(
            ['category_group' => 'account_type', 'category_name' => 'Commercial Park Tenant'],
            ['description' => 'Test Tenant', 'is_active' => true, 'display_order' => 1]
        );
    }

    public function test_authenticated_user_can_list_accounts(): void
    {
        Account::create([
            'organization_name' => 'Test Tech PLC',
            'account_type_id' => $this->accountType->id,
            'industry' => 'Fintech',
            'location' => 'Building A',
            'owner_user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/accounts');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'organization_name',
                        'industry',
                        'location',
                        'account_type',
                    ],
                ],
                'meta' => ['total', 'current_page'],
            ]);
    }

    public function test_accounts_metrics_endpoint(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/v1/accounts/metrics');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total',
                    'commercial_tenants',
                    'startup_incubatees',
                    'partners_investors',
                    'unassigned',
                ],
            ]);
    }

    public function test_user_can_create_account_with_primary_contact(): void
    {
        $payload = [
            'organization_name' => 'Addis Robotics Lab',
            'account_type_id' => $this->accountType->id,
            'industry' => 'Robotics & Hardware',
            'location' => 'Block 4, 3rd Floor',
            'contact_information' => [
                'email' => 'contact@addisrobotics.et',
                'phone' => '+251911998877',
            ],
            'engagement_history' => 'New park tenant agreement',
            'primary_contact' => [
                'first_name' => 'Elias',
                'last_name' => 'Hailu',
                'role_title' => 'Founder & CEO',
                'email' => 'elias@addisrobotics.et',
                'phone' => '+251911998877',
            ],
        ];

        $response = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/accounts', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.organization_name', 'Addis Robotics Lab');

        $accountId = $response->json('data.id');

        $this->assertDatabaseHas('accounts', [
            'id' => $accountId,
            'organization_name' => 'Addis Robotics Lab',
        ]);

        $this->assertDatabaseHas('contacts', [
            'account_id' => $accountId,
            'first_name' => 'Elias',
            'last_name' => 'Hailu',
            'is_primary' => true,
        ]);
    }

    public function test_user_can_update_account(): void
    {
        $account = Account::create([
            'organization_name' => 'Original Name PLC',
            'account_type_id' => $this->accountType->id,
            'industry' => 'Telecom',
            'owner_user_id' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin, 'sanctum')
            ->putJson("/api/v1/accounts/{$account->id}", [
                'organization_name' => 'Updated Name PLC',
                'industry' => 'Cloud & AI',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.organization_name', 'Updated Name PLC');

        $this->assertDatabaseHas('accounts', [
            'id' => $account->id,
            'organization_name' => 'Updated Name PLC',
            'industry' => 'Cloud & AI',
        ]);
    }

    public function test_user_can_list_and_create_contacts(): void
    {
        $account = Account::create([
            'organization_name' => 'Contact Test Org',
            'account_type_id' => $this->accountType->id,
            'owner_user_id' => $this->admin->id,
        ]);

        $createResponse = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/v1/contacts', [
                'account_id' => $account->id,
                'first_name' => 'Marta',
                'last_name' => 'Girma',
                'role_title' => 'Chief Operations Officer',
                'email' => 'marta@testorg.et',
                'phone' => '+251922001122',
                'is_primary' => true,
            ]);

        $createResponse->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.first_name', 'Marta')
            ->assertJsonPath('data.is_primary', true);

        $contactId = $createResponse->json('data.id');

        $listResponse = $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/v1/contacts?account_id={$account->id}");

        $listResponse->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data');
    }

    public function test_cannot_delete_account_with_open_opportunities(): void
    {
        $account = Account::create([
            'organization_name' => 'Protected Tenant PLC',
            'account_type_id' => $this->accountType->id,
            'owner_user_id' => $this->admin->id,
        ]);

        $oppType = OpportunityType::firstOrCreate(['type_name' => 'Commercial Lease']);
        $stage = PipelineStage::firstOrCreate(['stage_name' => 'Discovery', 'display_order' => 1]);

        Opportunity::create([
            'account_id' => $account->id,
            'opportunity_type_id' => $oppType->id,
            'stage_id' => $stage->id,
            'owner_user_id' => $this->admin->id,
            'value' => 150000.00,
            'status' => 'open',
        ]);

        $deleteResponse = $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/v1/accounts/{$account->id}");

        $deleteResponse->assertStatus(422)
            ->assertJsonPath('success', false);

        $this->assertDatabaseHas('accounts', [
            'id' => $account->id,
            'deleted_at' => null,
        ]);
    }
}
