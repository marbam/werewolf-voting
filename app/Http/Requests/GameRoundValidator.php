<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GameRoundValidator extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'game_id' => 'required',
            'round_id' => 'required'
        ];
    }

    public function messages()
    {
        return [
            'game_id.required' => 'Please provide all required values',
            'round_id.required' => 'Please provide all required values',
        ];
    }
}
