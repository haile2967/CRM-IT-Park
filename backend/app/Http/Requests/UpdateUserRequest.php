<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    public function rules(): array
    {
        $userId = $this->route('user') ?? $this->route('id');
        if (is_object($userId)) {
            $userId = $userId->user_id;
        }

        return [
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'last_name' => ['sometimes', 'required', 'string', 'max:100'],
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId, 'user_id'),
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'role_id' => ['sometimes', 'required', 'integer', 'exists:roles,role_id'],
            'phone' => ['nullable', 'string', 'max:50'],
            'status' => ['sometimes', 'required', 'string', 'in:active,inactive'],
        ];
    }
}
