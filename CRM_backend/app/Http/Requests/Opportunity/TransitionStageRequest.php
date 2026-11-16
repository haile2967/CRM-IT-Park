<?php

namespace App\Http\Requests\Opportunity;

use Illuminate\Foundation\Http\FormRequest;

class TransitionStageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'stage_id' => 'required|integer|exists:pipeline_stages,id',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
