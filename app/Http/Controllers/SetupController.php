<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SetupController extends Controller
{
    public function getRoles()
    {
        return [
            ['id' => 1, 'name' => 'Clairvoyant'],
            ['id' => 2, 'name' => 'Witch'],
            ['id' => 3, 'name' => 'Wizard'],
            ['id' => 4, 'name' => 'Healer'],
            ['id' => 5, 'name' => 'Alpha'],
            ['id' => 6, 'name' => 'Pack'],
            ['id' => 7, 'name' => 'Pup'],
            ['id' => 8, 'name' => 'Defector'],
        ];
    }
}
