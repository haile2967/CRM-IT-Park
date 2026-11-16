<?php

namespace App\Http\Requests\Account;

use Illuminate\Foundation\Http\FormRequest;

class StoreAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'organization_name' => 'required|string|max:255',
            'account_type_id' => 'required|exists:reference_categories,id',
            'industry' => 'nullable|string|max:150',
            'location' => 'nullable|string|max:255',
            'owner_user_id' => 'nullable|exists:users,id',
            'contact_information' => 'nullable|array',
            'contact_information.email' => 'nullable|email|max:255',
            'contact_information.phone' => 'nullable|string|max:50',
            'contact_information.website' => 'nullable|string|max:255',
            'engagement_history' => 'nullable|string',
            'primary_contact' => 'nullable|array',
            'primary_contact.first_name' => 'required_with:primary_contact|string|max:100',
            'primary_contact.last_name' => 'required_with:primary_contact|string|max:100',
            'primary_contact.role_title' => 'nullable|string|max:150',
            'primary_contact.email' => 'nullable|email|max:255',
            'primary_contact.phone' => 'nullable|string|max:50',
        ];
    }
}
