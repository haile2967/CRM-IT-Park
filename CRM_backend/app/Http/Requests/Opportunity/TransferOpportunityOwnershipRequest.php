<?php

namespace App\Http\Requests\Opportunity;

use Illuminate\Foundation\Http\FormRequest;

class TransferOpportunityOwnershipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'new_owner_user_id' => 'required|integer|exists:users,id',
            'reason' => 'nullable|string|max:500',
        ];
    }
}
