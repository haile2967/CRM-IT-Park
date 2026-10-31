<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TicketCategory\CreateTicketCategoryRequest;
use App\Http\Requests\TicketCategory\UpdateTicketCategoryRequest;
use App\Http\Resources\TicketCategoryResource;
use App\Models\TicketCategory;
use App\Services\TicketCategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TicketCategoryController extends Controller
{
    public function __construct(
        private readonly TicketCategoryService $service
    ) {}

    /**
     * List ticket categories.
     *
     * System Administrator: returns all categories with tickets_count (or active only when ?active_only=true).
     * Non-admin roles: returns only active categories for ticket dropdowns.
     *
     * Authorized: all authenticated users (auth:sanctum)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $isAdmin = $user && $user->hasRole('System Administrator');

        $categories = $this->service->getAllCategories($request->query(), $isAdmin);

        return TicketCategoryResource::collection($categories);
    }

    /**
     * Create a new ticket category.
     *
     * Authorized role: System Administrator
     */
    public function store(CreateTicketCategoryRequest $request): JsonResponse
    {
        $category = $this->service->createCategory($request->validated());

        return response()->json([
            'success' => true,
            'message' => "Ticket category \"{$category->category_name}\" created successfully.",
            'data'    => [
                'ticket_category' => new TicketCategoryResource($category),
            ],
        ], 201);
    }

    /**
     * View details of a single ticket category.
     *
     * Authorized: all authenticated users (auth:sanctum)
     */
    public function show(Request $request, TicketCategory $ticket_category): JsonResponse
    {
        $user = $request->user();
        $isAdmin = $user && $user->hasRole('System Administrator');

        if ($isAdmin) {
            $ticket_category->loadCount('tickets');
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'ticket_category' => new TicketCategoryResource($ticket_category),
            ],
        ]);
    }

    /**
     * Update an existing ticket category (name, description, and/or active status).
     *
     * Authorized role: System Administrator
     */
    public function update(UpdateTicketCategoryRequest $request, TicketCategory $ticket_category): JsonResponse
    {
        $category = $this->service->updateCategory($ticket_category, $request->validated());
        $category->loadCount('tickets');

        return response()->json([
            'success' => true,
            'message' => "Ticket category \"{$category->category_name}\" updated successfully.",
            'data'    => [
                'ticket_category' => new TicketCategoryResource($category),
            ],
        ]);
    }

    /**
     * Permanently delete a ticket category.
     *
     * A category can only be deleted if no tickets are linked to it.
     *
     * Authorized role: System Administrator
     */
    public function destroy(TicketCategory $ticket_category): JsonResponse
    {
        $categoryName = $ticket_category->category_name;

        try {
            $this->service->deleteCategory($ticket_category);

            return response()->json([
                'success' => true,
                'message' => "Ticket category \"{$categoryName}\" deleted successfully.",
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
