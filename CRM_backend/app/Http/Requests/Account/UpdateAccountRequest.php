<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'organization_name' => 'sometimes|required|string|max:255',
            'account_type_id' => 'sometimes|required|exists:reference_categories,id',
            'industry' => 'nullable|string|max:150',
            'location' => 'nullable|string|max:255',
            'owner_user_id' => 'nullable|exists:users,id',
            'contact_information' => 'nullable|array',
            'contact_information.email' => 'nullable|email|max:255',
            'contact_information.phone' => 'nullable|string|max:50',
            'contact_information.website' => 'nullable|string|max:255',
            'engagement_history' => 'nullable|string',
        ];
    }
}
