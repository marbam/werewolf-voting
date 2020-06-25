<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Player;
use App\PlayerStatus;

class ModController extends Controller
{
    public function showGame($id) {
        return view('modView', ['game_id' => $id]);
    }

    public function getPlayers($gameId)
    {
        return Player::where('game_id', $gameId)
                         ->join('roles', 'players.allocated_role_id', '=', 'roles.id')
                         ->join('player_statuses', 'players.id', '=', 'player_statuses.player_id')
                         ->get([
                             'players.id',
                             'players.name',
                             'roles.name as role',
                             'roles.id as roleId',
                             'player_statuses.alive'
                         ]);
    }

    public function changeAliveStatus($player_id)
    {
        $status = PlayerStatus::where('player_id', $player_id)->first();
        $result = 0;
        if ($status->alive == 0) {
            $result = 1;
        }
        $status->alive = $result;
        $status->save();
        return $result;
    }
}
