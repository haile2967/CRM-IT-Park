<?php

namespace App\Http\Requests\Contact;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_id' => 'sometimes|required|exists:accounts,id',
            'first_name' => 'sometimes|required|string|max:100',
            'last_name' => 'sometimes|required|string|max:100',
            'role_title' => 'nullable|string|max:150',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'is_primary' => 'nullable|boolean',
            'owner_user_id' => 'nullable|exists:users,id',
        ];
    }
}
