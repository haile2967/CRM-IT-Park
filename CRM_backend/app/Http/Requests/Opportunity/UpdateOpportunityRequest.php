<?php

namespace App\Http\Requests\Opportunity;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOpportunityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => 'sometimes|required|integer|exists:accounts,id',
            'opportunity_type_id' => 'sometimes|required|integer|exists:opportunity_types,id',
            'stage_id' => 'sometimes|required|integer|exists:pipeline_stages,id',
            'value' => 'nullable|numeric|min:0',
            'probability' => 'nullable|numeric|min:0|max:100',
            'expected_close_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'status' => 'nullable|string|in:open,closed_won,closed_lost',
            'owner_user_id' => 'nullable|integer|exists:users,id',
        ];
    }
}
