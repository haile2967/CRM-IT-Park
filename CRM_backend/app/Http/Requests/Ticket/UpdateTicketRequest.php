<?php

namespace App\Http\Requests\Ticket;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => 'sometimes|required|integer|exists:accounts,id',
            'contact_id' => 'nullable|integer|exists:contacts,id',
            'category_id' => 'sometimes|required|integer|exists:ticket_categories,id',
            'priority' => 'sometimes|required|string|in:Urgent,High,Medium,Low',
            'subject' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'assignee_user_id' => 'nullable|integer|exists:users,id',
            'status' => 'sometimes|required|string|in:open,in_progress,resolved,closed',
        ];
    }
}
