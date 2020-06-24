<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ModController extends Controller
{
    public function getPlayers($gameId)
    {
        // plug this in later
        return [
            ['id' => 1, 'name' => 'Claire', 'role' => 'Clairvoyant', 'roleId' => 1, 'alive' => true],
            ['id' => 2, 'name' => 'Wizzy', 'role' => 'Wizard', 'roleId' => 2, 'alive' => true],
            ['id' => 3, 'name' => 'Alfie', 'role' => 'Alpha Wolf', 'roleId' => 3, 'alive' => true],
            ['id' => 4, 'name' => 'Pete', 'role' => 'Pack Wolf', 'roleId' => 4, 'alive' => true],
            ['id' => 5, 'name' => 'Willow', 'role' => 'Witch', 'roleId' => 5, 'alive' => true],
        ];
    }
}
