<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Player;

class PlayerController extends Controller
{

    public function showNominees ($gameId, $type, $roundId)
    {
        // we'll need to check the game exists and that the voting round exists.

        if (!in_array($type, ['accusations', 'ballot'])) {
            abort(404);
        }

        return view('playerView',
        [
            'game_id' => $gameId,
            'round_id' => $roundId
        ]);
    }


    public function getAccusable($gameId, $voteId)
    {
        return Player::where('game_id', $gameId)
                         ->join('roles', 'players.allocated_role_id', '=', 'roles.id')
                         ->join('player_statuses', 'players.id', '=', 'player_statuses.player_id')
                         ->where('player_statuses.alive', 1)
                         ->get([
                             'players.id',
                             'players.name',
                             'roles.id as roleId',
                         ]);
    }
}
