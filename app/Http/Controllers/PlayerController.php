<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PlayerController extends Controller
{

    public function showNominees ($gameId, $type, $voteId)
    {
        // we'll need to check the game exists and that the voting round exists.

        if (!in_array($type, ['accusations', 'ballot'])) {
            abort(404);
        }

        return view('playerView');
    }


    public function getAccusable($gameId)
    {
        // plug this in later
        return [
            ['id' => 1, 'name' => 'Claire', 'roleId' => 1, 'selected' => false],
            ['id' => 2, 'name' => 'Wizzy', 'roleId' => 2, 'selected' => false],
            ['id' => 3, 'name' => 'Alfie', 'roleId' => 3, 'selected' => false],
            ['id' => 4, 'name' => 'Pete', 'roleId' => 4, 'selected' => false],
            ['id' => 5, 'name' => 'Willow', 'roleId' => 5, 'selected' => false],
        ];
    }
}
