<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Role;
use App\Game;
use App\Round;
use App\Player;
use App\Action;
use App\Nominee;
use App\ActionType;

class PlayerController extends Controller
{

    public function showNominees (Game $game, $type, Round $round)
    {
        // bit of validation to ensure you're looking at the right screen:
        if (!in_array($type, ['accusations', 'ballot'])) {
            abort(404);
        }

        if ($game->id != $round->game_id) {
            about(404);
        }

        if (ucfirst($type) != $round->type) {
            abort(404);
        }

        return view('playerView',
        [
            'game_id' => $game->id,
            'round_id' => $round->id
        ]);
    }

    public function getAccusable(Game $game, Round $round)
    {
        $players = Player::where('game_id', $game->id)
                        ->join('roles', 'players.allocated_role_id', '=', 'roles.id')
                        ->join('player_statuses', 'players.id', '=', 'player_statuses.player_id')
                        ->where('player_statuses.alive', 1)
                        ->get([
                            'players.id',
                            'players.name',
                            'roles.id as roleId',
                        ]);

        if ($round->type == "Accusations") {
            foreach ($players as $player) {
                $player->isNominee = 1;
            }
            return $players;
        } else if ($round->type == "Ballot") {

            $nominees = Nominee::where('round_id', $round->id)->pluck('player_id')->toArray();
            foreach ($players as $player) {
                // for now we'll assume that if you're on the ballot, you can't vote. This will change later.
                if (in_array($player->id, $nominees)) {
                    $player->isNominee = 1;
                } else {
                    $player->isNominee = 0;
                }
            }
            return $players;
        }
        return abort(404);
    }

    public function getActionOptions(Request $request)
    {
        $data = $request->all();
        $round = Round::find($data['round_id']);
        $data['round_type'] = strtolower($round->type);

        if ($data['round_type'] == "ballot") {
            $nominees = Nominee::where('round_id', $round->id)->pluck('player_id', 'id')->toArray();
            $on_ballot = false;
            if (in_array($data['player_id'], $nominees)) {
                $on_ballot = true;
            }
        }

        $actions = ActionType::where('round_type', $data['round_type'])
                         ->leftJoin('role_action_types', 'role_action_types.action_type_id', '=', 'action_types.id')
                         ->when($data['round_type'] == "ballot" && $on_ballot, function($query) {
                             $query->where('usable_on_ballot', 1);
                         })
                         ->where(function($sub) use ($data) {
                            $sub->where('all_roles', 1)
                                ->orWhere(function($specifics) use ($data) {
                                    $specifics->where('role_action_types.role_id', $data['role_id']);
                                });
                         })->get(['action_types.alias', 'action_types.description', 'action_types.multi_select'])->toArray();

        return $actions;
    }

    public function submitAction(Request $request, $game_id, $round_id)
    {
        $data = $request->all();

        // Check we don't already have a vote for the player from this round.
        // Could use a firstOrCreate etc but I've seen race conditions in the past.
        $alreadySubmitted = Action::where([
            'round_id' => $round_id,
            'voter_id' => $data['voter_id']
        ])->count();

        if (!$alreadySubmitted) {
            foreach($data['choices'] as $choice) {
                Action::insert([
                    'round_id' => $round_id,
                    'action_type' => strtoupper($data['action_type']),
                    'voter_id' => $data['voter_id'],
                    'nominee_id' => $choice['id'],
                ]);
            }
        }
    }

    public function showRoleCall(Game $game)
    {
        return view('roleCall',
        [
            'game_id' => $game->id,
        ]);
    }

    public function getRoleCall($game_id)
    {
        return Player::join('roles', 'players.allocated_role_id', '=', 'roles.id')
                         ->where('players.game_id', $game_id)
                         ->get(['players.name', 'roles.name as role'])->toArray();
    }
}
