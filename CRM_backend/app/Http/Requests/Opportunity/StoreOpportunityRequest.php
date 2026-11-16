<?php

namespace App\Http\Requests\Opportunity;

use Illuminate\Foundation\Http\FormRequest;

class StoreOpportunityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => 'required|integer|exists:accounts,id',
            'opportunity_type_id' => 'required|integer|exists:opportunity_types,id',
            'stage_id' => 'nullable|integer|exists:pipeline_stages,id',
            'lead_id' => 'nullable|integer|exists:leads,id',
            'value' => 'nullable|numeric|min:0',
            'probability' => 'nullable|numeric|min:0|max:100',
            'expected_close_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'owner_user_id' => 'nullable|integer|exists:users,id',
            'status' => 'nullable|string|in:open,closed_won,closed_lost',
        ];
    }
}
