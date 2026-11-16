<?php

namespace Tests\Feature;

use App\Enums\TicketPriority;
use App\Models\Account;
use App\Models\Contact;
use App\Models\EscalationPolicy;
use App\Models\ReferenceCategory;
use App\Models\Role;
use App\Models\Ticket;
use App\Models\TicketCategory;
use App\Models\TicketComment;
use App\Models\TicketEscalationHistory;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class TicketTest extends TestCase
{
    use DatabaseTransactions;

    protected User $admin;
    protected User $agent;
    protected Account $account;
    protected Contact $contact;
    protected TicketCategory $category;

    protected function setUp(): void
    {
        parent::setUp();

        $adminRole = Role::firstOrCreate(['name' => 'System Administrator', 'guard_name' => 'web']);
        $this->admin = User::firstOrCreate(
            ['email' => 'ticket_admin@itpark.gov.et'],
            [
                'first_name' => 'TicketAdmin',
                'last_name' => 'Admin',
                'password' => bcrypt('Password123!'),
                'status' => 'active',
                'keycloak_id' => '11111111-2222-3333-4444-999999999991',
            ]
        );
        $this->admin->syncRoles(['System Administrator']);

        $this->agent = User::firstOrCreate(
            ['email' => 'ticket_agent@itpark.gov.et'],
            [
                'first_name' => 'Abebe',
                'last_name' => 'Support',
                'password' => bcrypt('Password123!'),
                'status' => 'active',
                'keycloak_id' => '11111111-2222-3333-4444-999999999992',
            ]
        );
        $this->agent->syncRoles(['System Administrator']); // Gives access for test suite

        $refCat = ReferenceCategory::firstOrCreate(
            ['category_name' => 'Commercial Park Tenant', 'category_group' => 'account_type'],
            ['description' => 'Commercial Park Tenant', 'is_active' => true]
        );

        $this->account = Account::firstOrCreate(
            ['organization_name' => 'Ethio Data Services PLC'],
            [
                'account_type_id' => $refCat->id,
                'owner_user_id' => $this->admin->id,
                'industry' => 'Cloud & Telecom',
                'location' => 'Building B, Floor 3',
            ]
        );

        $this->contact = Contact::firstOrCreate(
            ['email' => 'contact@ethiodata.et'],
            [
                'account_id' => $this->account->id,
                'first_name' => 'Dawit',
                'last_name' => 'Kebede',
                'role_title' => 'CTO',
                'phone' => '+251911223344',
                'is_primary' => true,
            ]
        );

        $this->category = TicketCategory::firstOrCreate(
            ['category_name' => 'IT, Cloud & Telecom Infrastructure'],
            ['description' => 'Dedicated fiber connectivity and cloud servers.', 'is_active' => true]
        );
    }

    public function test_user_can_list_tickets_with_queue_filters_and_counts(): void
    {
        // Create an unassigned ticket and an assigned ticket
        $unassigned = Ticket::create([
            'account_id' => $this->account->id,
            'contact_id' => $this->contact->id,
            'category_id' => $this->category->id,
            'priority' => TicketPriority::URGENT,
            'status' => 'open',
            'subject' => 'Unassigned Fiber Outage',
            'last_activity_at' => now(),
            'assignee_user_id' => null,
            'escalated' => false,
        ]);

        $assigned = Ticket::create([
            'account_id' => $this->account->id,
            'contact_id' => $this->contact->id,
            'category_id' => $this->category->id,
            'priority' => TicketPriority::HIGH,
            'status' => 'in_progress',
            'subject' => 'Assigned Power Fluctuation',
            'last_activity_at' => now(),
            'assignee_user_id' => $this->admin->id,
            'escalated' => true,
        ]);

        $response = $this->actingAs($this->admin, 'web')->getJson('/api/v1/tickets');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data',
                'counts' => ['all', 'my_assigned', 'unassigned', 'escalated'],
                'meta' => ['current_page', 'last_page', 'total'],
            ]);

        $this->assertGreaterThanOrEqual(2, $response->json('counts.all'));
        $this->assertGreaterThanOrEqual(1, $response->json('counts.unassigned'));
        $this->assertGreaterThanOrEqual(1, $response->json('counts.escalated'));

        // Test filtering by unassigned queue
        $unassignedResponse = $this->actingAs($this->admin, 'web')->getJson('/api/v1/tickets?queue=unassigned');
        $unassignedResponse->assertStatus(200);
        foreach ($unassignedResponse->json('data') as $ticket) {
            $this->assertNull($ticket['assignee_user_id']);
        }
    }

    public function test_user_can_fetch_operational_kpi_metrics(): void
    {
        $response = $this->actingAs($this->admin, 'web')->getJson('/api/v1/tickets/metrics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'total_active',
                    'unassigned_count',
                    'escalated_count',
                    'avg_resolution_hours',
                    'urgent_high_count',
                    'priority_breakdown',
                ],
            ]);
    }

    public function test_user_can_create_ticket(): void
    {
        $payload = [
            'account_id' => $this->account->id,
            'contact_id' => $this->contact->id,
            'category_id' => $this->category->id,
            'priority' => 'Urgent',
            'subject' => 'Data Center Generator Switch Failed',
            'description' => 'Automatic Transfer Switch (ATS) did not kick in during morning grid drill.',
        ];

        $response = $this->actingAs($this->admin, 'web')->postJson('/api/v1/tickets', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.subject', 'Data Center Generator Switch Failed')
            ->assertJsonPath('data.priority', 'Urgent')
            ->assertJsonPath('data.status', 'open');

        $this->assertDatabaseHas('tickets', [
            'subject' => 'Data Center Generator Switch Failed',
            'priority' => 'Urgent',
        ]);
    }

    public function test_user_can_view_ticket_with_comments_and_history(): void
    {
        $ticket = Ticket::create([
            'account_id' => $this->account->id,
            'contact_id' => $this->contact->id,
            'category_id' => $this->category->id,
            'priority' => TicketPriority::MEDIUM,
            'status' => 'open',
            'subject' => 'Badge replacement for visitor',
            'last_activity_at' => now(),
        ]);

        TicketComment::create([
            'ticket_id' => $ticket->id,
            'user_id' => $this->admin->id,
            'comment_text' => 'New keycard issued to security booth.',
            'is_internal' => false,
        ]);

        $response = $this->actingAs($this->admin, 'web')->getJson("/api/v1/tickets/{$ticket->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $ticket->id)
            ->assertJsonPath('data.ticket_number', 'TICK-' . str_pad($ticket->id, 5, '0', STR_PAD_LEFT))
            ->assertJsonCount(1, 'data.comments');
    }

    public function test_agent_can_claim_unassigned_ticket(): void
    {
        $ticket = Ticket::create([
            'account_id' => $this->account->id,
            'category_id' => $this->category->id,
            'priority' => TicketPriority::HIGH,
            'status' => 'open',
            'subject' => 'Unclaimed Air Conditioning Warning',
            'last_activity_at' => now()->subHours(2),
            'assignee_user_id' => null,
            'escalated' => true,
        ]);

        $response = $this->actingAs($this->agent, 'web')->postJson("/api/v1/tickets/{$ticket->id}/claim");

        $response->assertStatus(200)
            ->assertJsonPath('data.assignee_user_id', $this->agent->id)
            ->assertJsonPath('data.status', 'in_progress')
            ->assertJsonPath('data.escalated', false);

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'assignee_user_id' => $this->agent->id,
            'status' => 'in_progress',
            'escalated' => false,
        ]);
    }

    public function test_agent_can_post_public_reply_and_internal_note_resetting_inactivity(): void
    {
        $ticket = Ticket::create([
            'account_id' => $this->account->id,
            'category_id' => $this->category->id,
            'priority' => TicketPriority::MEDIUM,
            'status' => 'open',
            'subject' => 'DNS Propagation Inquiry',
            'last_activity_at' => now()->subHours(5),
            'inactivity_duration_seconds' => 18000,
        ]);

        // Post public comment
        $res1 = $this->actingAs($this->admin, 'web')->postJson("/api/v1/tickets/{$ticket->id}/comments", [
            'comment_text' => 'We have flushed the root DNS zones.',
            'is_internal' => false,
        ]);

        $res1->assertStatus(201)
            ->assertJsonPath('data.comment.is_internal', false)
            ->assertJsonPath('data.ticket.status', 'in_progress');

        // Verify inactivity duration reset
        $ticket->refresh();
        $this->assertEquals(0, $ticket->inactivity_duration_seconds);

        // Post internal note
        $res2 = $this->actingAs($this->admin, 'web')->postJson("/api/v1/tickets/{$ticket->id}/comments", [
            'comment_text' => 'Staff note: check upstream carrier latency.',
            'is_internal' => true,
        ]);

        $res2->assertStatus(201)
            ->assertJsonPath('data.comment.is_internal', true);
    }

    public function test_agent_can_update_status_and_resolve_ticket(): void
    {
        $ticket = Ticket::create([
            'account_id' => $this->account->id,
            'category_id' => $this->category->id,
            'priority' => TicketPriority::LOW,
            'status' => 'in_progress',
            'subject' => 'Printer driver reconfiguration',
            'last_activity_at' => now(),
        ]);

        $response = $this->actingAs($this->admin, 'web')->patchJson("/api/v1/tickets/{$ticket->id}/status", [
            'status' => 'resolved',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'resolved');

        $ticket->refresh();
        $this->assertEquals('resolved', $ticket->status);
        $this->assertNotNull($ticket->closed_at);
    }

    public function test_user_can_manually_escalate_ticket(): void
    {
        $ticket = Ticket::create([
            'account_id' => $this->account->id,
            'category_id' => $this->category->id,
            'priority' => TicketPriority::URGENT,
            'status' => 'open',
            'subject' => 'Critical fiber cutoff on ring 1',
            'last_activity_at' => now(),
            'escalated' => false,
        ]);

        $response = $this->actingAs($this->admin, 'web')->postJson("/api/v1/tickets/{$ticket->id}/escalate", [
            'reason' => 'Tenant core production services completely dark',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.escalated', true);

        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'escalated' => true,
        ]);

        $this->assertDatabaseHas('ticket_escalation_history', [
            'ticket_id' => $ticket->id,
            'notification_sent' => true,
        ]);
    }
}
