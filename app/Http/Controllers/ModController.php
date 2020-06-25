<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Player;

class ModController extends Controller
{
    public function showGame($id) {
        return view('modView', ['game_id' => $id]);
    }

    public function getPlayers($gameId)
    {
        $players = Player::where('game_id', $gameId)
                         ->join('roles', 'players.allocated_role_id', '=', 'roles.id')
                         ->get([
                             'players.id',
                             'players.name',
                             'roles.name as role',
                             'roles.id as roleId'
                         ]);

        // this will need adding to the database!
        foreach ($players as $player) {
            $player->alive = true;
        }

        return $players;
    }
}
