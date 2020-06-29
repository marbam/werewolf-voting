<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Player;
use App\Round;
use App\Action;
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

    public function createAccusations($game_id) {
        $round = Round::create([
            'game_id' => $game_id,
            'type' => 'Accusations',
        ]);

        $outcomes = $this->getAccusationOutcome($round->id, $game_id);

        return [
            'roundId' => $round->id,
            'roundType' => strtolower($round->type),
            'url' => '/game/'.$game_id.'/accusations/'.$round->id,
            'accusations_outcomes' => $outcomes
        ];
    }

    public function getAccusationOutcome($round_id, $game_id) {
        $players = Player::where('game_id', $game_id)->pluck('name', 'id')->toArray();

        $votes = Action::where('round_id', $round_id)
                       ->get();

        // setup votes array:
        $outcomes = [];
        foreach ($players as $key => $name) {
            $outcomes[$key] = ['voter' => $name, 'chose' => 'Waiting...'];
        }

        foreach ($votes as $vote) {
            $outcomes['voter_id']['chose'] = $players[$vote['nominee_id']];
        }

        $outcomes = array_values($outcomes);

        return $outcomes;
    }
}
