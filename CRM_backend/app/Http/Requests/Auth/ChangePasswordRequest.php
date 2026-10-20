<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class ChangePasswordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string'],
            'new_password' => [
                'required',
                'string',
                'min:8',
                'regex:/[a-z]/',                          // lowercase
                'regex:/[A-Z]/',                          // uppercase
                'regex:/[0-9]/',                          // number
                'regex:/[@$!%*?&#^()_+=\-\[\]{}|:;,.`~]/', // special character
                'different:current_password',
                'confirmed',
            ],
            'new_password_confirmation' => ['required', 'string'],
        ];
    }

    /**
     * Custom error messages for password validation rules.
     */
    public function messages(): array
    {
        return [
            'current_password.required' => 'Please enter your current password.',
            'new_password.required' => 'Please enter a new password.',
            'new_password.min' => 'The new password must be at least 8 characters long.',
            'new_password.regex' => 'The new password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
            'new_password.different' => 'The new password cannot be the same as your current password.',
            'new_password.confirmed' => 'The new password and confirm password fields do not match.',
            'new_password_confirmation.required' => 'Please confirm your new password.',
        ];
    }
}
