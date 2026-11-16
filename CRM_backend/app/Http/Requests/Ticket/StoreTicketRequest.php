<?php

namespace App\Http\Requests\Ticket;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => 'required|integer|exists:accounts,id',
            'contact_id' => 'nullable|integer|exists:contacts,id',
            'category_id' => 'required|integer|exists:ticket_categories,id',
            'priority' => 'required|string|in:Urgent,High,Medium,Low',
            'subject' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assignee_user_id' => 'nullable|integer|exists:users,id',
            'status' => 'nullable|string|in:open,in_progress,resolved,closed',
        ];
    }
}
