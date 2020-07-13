<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Game;
use App\Round;
use App\Action;
use App\Player;
use App\Nominee;
use App\PlayerStatus;

use App\Http\Requests\GameValidator;
use App\Http\Requests\GameRoundValidator;
use App\Http\Requests\PlayerRoundRoleValidator;

class ModController extends Controller
{
    public function showGame(Game $game) {
        return view('modView', ['game_id' => $game->id]);
    }

    public function getPlayers(GameValidator $request)
    {
        $game_id = $request->game_id;

        return Player::where('game_id', $game_id)
                         ->join('roles', 'players.allocated_role_id', '=', 'roles.id')
                         ->join('player_statuses', 'players.id', '=', 'player_statuses.player_id')
                         ->get([
                             'players.id',
                             'players.name',
                             'roles.id as roleId',
                             'roles.name as role',
                             'roles.mystic',
                             'roles.corrupt',
                             'player_statuses.alive',
                             'player_statuses.minion',
                             'player_statuses.guarded',
                             'player_statuses.criminalized',
                             'player_statuses.cursed_farmer',
                             'player_statuses.cursed_necromancer',
                             'player_statuses.cursed_hag',
                             'player_statuses.possessed',
                         ]);
    }

    public function updatePlayerStatus(Request $request)
    {
        $data = $request->all();
        $statusToUpdate = $data['status'];
        $status = PlayerStatus::where('player_id', $data['player_id'])->first();
        $result = 0;
        if ($status[$statusToUpdate] == 0) {
            $result = 1;
        }
        $status[$statusToUpdate] = $result;
        $status->save();
        return $result;
    }

    public function getAccusationByVoter($round_id, $game_id, $data=null)
    {
        if (!$data) {
            $data = $this->getData($round_id, $game_id);
        }
        $players = $data[0];
        $actions = $data[1];

        // setup votes array:
        $outcomes = [];
        foreach ($players as $key => $name) {
            $outcomes[$key] = ['voter_id' => null, 'voter' => $name, 'chose' => 'Waiting...', 'type' => ''];
        }

        foreach ($actions as $action) {
            if ($outcomes[$action->voter_id]['chose'] == 'Waiting...') {
                $outcomes[$action->voter_id]['chose'] = '';
            }
            $outcomes[$action->voter_id]['chose'] .= $players[$action['nominee_id']]." ";
            $action_type = strtolower($action['action_type']);
            $action_type = str_replace("_", " ", $action_type);
            $action_type = ucwords($action_type);
            $outcomes[$action->voter_id]['type'] = $action_type;
            $outcomes[$action->voter_id]['voter_id'] = $action->voter_id;
        }

        // If we're returning the data for a spy, trim it down so you can't see who is doing what.
        if (isset($data['spy'])) {
            foreach ($outcomes as $player_id => $outcome) {
                if (strpos($outcome['type'], "Vote") !== false) {
                    $outcomes[$player_id]['type'] = "Vote";
                } else if (strpos($outcome['type'], "Signal") !== false) {
                    $outcomes[$player_id]['type'] = "Signal";
                }
            }
        }

        $outcomes = array_values($outcomes);

        return $outcomes;
    }

    public function getData($round_id, $game_id) {
        $players = Player::join('player_statuses', 'player_statuses.player_id', '=', 'players.id')
                         ->where('game_id', $game_id)
                         ->where('player_statuses.alive', 1)
                         ->pluck('name', 'players.id')
                         ->toArray();

        $votes = Action::where('round_id', $round_id)
                       ->get();

        return [$players, $votes];
    }


    // Commenting the voting logic from the OraKyle:
    // There is a specific order used to determine who is on the ballot each day:
    //     1) Votes are cast and added up.
    //     2) Curses are then applied.
    //     3) Vote number modifiers are then applied (Seducer and Merchant).
    //     4) The ballot is determined at this point from the top 2 ranks of votes.
    //     5) At this stage, OTHER factors are taken into account:
    //     - The Guardian Angel takes the place of the Guarded
    //     - A Mystic is forced onto the ballot if Signalled by the Inquisitor
    //     - A player Signalled by the Lawyer is forced on or zeroed (and therefore forced off) as appropriate.

    // Writing this separately to start with for testing purposes but ultimately it'll make sense to
    // combine it with the getAccusationByVoter() as they will probably both be called at the same time!
    public function getAccusationResults($game_id, $round_id, $data=null)
    {
        if (!$data) {
            $data = $this->getData($round_id, $game_id);
        }

        $players = $data[0];
        $actions = $data[1];

        if (!$actions) {
            return "NO VOTES";
        }

        $results = [];
        foreach ($players as $id => $name) {
            $results[$id]['id'] = $id;
            $results[$id]['name'] = $name;
            $results[$id]['votes'] = 0;
            $results[$id]['on_ballot'] = 0;
        }

        foreach ($actions as $action) {
            if (strpos($action->action_type, "VOTE") !== false || $action->action_type == "SPY_SIGNAL") {
                $results[$action->nominee_id]['votes']++;
            }
        }

        // bolt on the additional vote from curses:
        $cursed_player_ids = Player::where('game_id', $game_id)
                                   ->join('player_statuses', 'players.id', '=', 'player_statuses.player_id')
                                   ->where('player_statuses.alive', 1)
                                   ->where(function($curses) {
                                       $curses->where('player_statuses.cursed_farmer', 1)
                                              ->orWhere('player_statuses.cursed_necromancer', 1)
                                              ->orWhere('player_statuses.cursed_hag', 1);
                                   })->pluck('players.id')->toArray();

        foreach ($cursed_player_ids as $id) {
            $results[$id]['votes']++;
        }

        // get the city roles in the game!
        $city = Player::join('roles', 'players.allocated_role_id', '=', 'roles.id')
                      ->join('player_statuses', 'player_statuses.player_id', '=', 'players.id')
                      ->where('player_statuses.alive', 1)
                      ->where('player_statuses.minion', 0)
                      ->where('players.game_id', $game_id)
                      ->whereIn('roles.alias', ['lawyer', 'mayor', 'merchant', 'preacher', 'seducer'])
                      ->get(['roles.alias', 'players.id']);

        // The seducer's votes are halved and then rounded up on both rounds of voting.
        $seducer = $city->where('alias', 'seducer')->first();
        if ($seducer) {
            $number_of_votes = $results[$seducer->id]['votes'];
            $halve_it = $number_of_votes / 2;
            $rounded_up = ceil($halve_it);
            $results[$seducer->id]['votes'] = $rounded_up;
        }

        // The merchant receives one fewer vote for every other city player alive on both rounds of voting.
        $merchant = $city->where('alias', 'merchant')->first();
        if ($merchant) {
            $subtract_votes = $city->where('alias', '!=', 'merchant')->count();
            $number_of_votes = $results[$merchant->id]['votes'];
            $number_of_votes =- $subtract_votes;
            if ($number_of_votes < 0) {
                $number_of_votes = 0;
            }
            $results[$merchant->id]['votes'] = $number_of_votes;
        }

        // get a count of each number of votes so we can calculate the top two tiers:
        $vote_array = [];
        foreach ($results as $result) {
            if (!isset($vote_array[$result['votes']])) {
                $vote_array[$result['votes']] = 1;
            } else {
                $vote_array[$result['votes']]++;
            }
        }

        // get the two highest tiers of votes.
        $highest = $this->getHighest($vote_array);
        // returns e.g. [2, 4] where 2 is the number of players with 4 votes.
        unset($vote_array[$highest[1]]);
        $second_highest = $this->getHighest($vote_array);
        $topTiers = [$highest[1], $second_highest[1]]; // will contain the top two tiers of votes.

        if ($topTiers[0] == 0) {
            unset($topTiers[0]); // anyone with 0 votes will never be on the ballot. (Guarded to come later.)
        }

        if ($topTiers[1] == 0) {
            unset($topTiers[1]); // anyone with 0 votes will never be on the ballot. (Guarded to come later.)
        }

        if (count($topTiers)) {
            // finally go through and update any players who are in the top two tiers of votes.
            foreach ($results as $index => $result) {
                if (in_array($result['votes'], $topTiers)) {
                    $results[$index]['on_ballot'] = 1;
                }
            }
        }

        // adding in Guardian logic separately for now, can rejig it a bit later once there's more functionality going on.

        $guardedPlayer = Player::where('game_id', $game_id)
                               ->join('player_statuses', 'players.id', '=', 'player_statuses.player_id')
                               ->where('player_statuses.guarded', 1)
                               ->first(['players.id']);

        if ($guardedPlayer && $results[$guardedPlayer->id]['on_ballot']) {
            // remove the guarded from the ballot, find and add the guardian to it.
            $guardian = Player::where('game_id', $game_id)
                                 ->join('roles', 'players.allocated_role_id', '=', 'roles.id')
                                 ->where('roles.alias', 'angel')
                                 ->join('player_statuses', 'players.id', '=', 'player_statuses.player_id')
                                 ->where('player_statuses.alive', 1)
                                 ->first(['players.id']);

            $results[$guardedPlayer->id]['on_ballot'] = 0;
            $results[$guardian->id]['on_ballot'] = 1;
        }

        // find out if one of the votes is of type "LAYWER_SIGNAL", if so, check if the target is a City or Criminal.
        // if so, remove them from the Ballot.

        $lawyer_signal = $actions->where('action_type', "LAWYER_SIGNAL")->first();
        if ($lawyer_signal) {
            $target = Player::where('players.id', $lawyer_signal->nominee_id)
                            ->join('roles', 'players.allocated_role_id', '=', 'roles.id')
                            ->join('factions', 'roles.faction_id', '=', 'factions.id')
                            ->join('player_statuses', 'player_statuses.player_id', '=', 'players.id')
                            ->get(['players.id', 'factions.name', 'player_statuses.criminalized'])
                            ->first();

            if (in_array($target->name, ['Criminals', 'City']) || $target->criminalized ) {
                $results[$target->id]['on_ballot'] = 0;
            } else {
                $results[$target->id]['on_ballot'] = 1; // always on ballot if they're not criminal or city
            }
        }

        // If the Inquisitor has signalled a mystic, add them to the ballot, regardless of votes.
        $inquisitor_signal = $actions->where('action_type', "INQUISITOR_SIGNAL")->first();
        if ($inquisitor_signal) {
            $target = Player::where('players.id', $inquisitor_signal->nominee_id)
                ->join('roles', 'players.allocated_role_id', '=', 'roles.id')
                ->get(['players.id', 'roles.mystic'])
                ->first();

            if ($target->mystic) {
                $results[$target->id]['on_ballot'] = 1;
            }
        }

        $results = array_values($results); // reset the outer keys so it's mappable in javascript

        return $results;
    }

    public function newAccusations(GameValidator $request)
    {
        return $this->combinedAccusations($request->game_id, ['new' => 1]);
    }

    public function refreshAccusations(GameRoundValidator $request)
    {
        $game_id = $request->game_id;
        $round = Round::findOrFail($request->round_id);
        return $this->combinedAccusations($game_id, ['round' => $round]);
    }

    public function recallAccusations(GameValidator $request)
    {
        $game_id = $request->game_id;
        $round = Round::where([
            'game_id' => $game_id,
            'type' => 'Accusations',
        ])->orderBy('id', 'DESC')
          ->first();

        if (!$round) {
            return "NO PREVIOUS";
        }

        return $this->combinedAccusations($game_id, ['recall' => 1, 'round' => $round]);
    }

    public function combinedAccusations($game_id, $extraData = [])
    {
        // so the idea behind this one is that it will return both sets of Accusation tables in one fell swoop.
        // Ideally there's no need for this to be two function calls - Refresh should update both tables.

        if (isset($extraData['new'])) {
            $round = Round::create([
                'game_id' => $game_id,
                'type' => 'Accusations',
            ]);
        } else {
            $round = $extraData['round'];
        }

        if (isset($extraData['new']) || isset($extraData['recall'])) {
            $data['general'] = [
                'roundId' => $round->id,
                'roundType' => strtolower($round->type),
                'url' => URL('/game/'.$game_id.'/accusations/'.$round->id),
            ];
        }

        $data['byVoter'] = $this->getAccusationByVoter($round->id, $game_id);
        $data['byNominee'] = $this->getAccusationResults($game_id, $round->id);
        return $data;
    }

    protected function getHighest($voting_array)
    {
        $votes = 0;
        $players = 0;

        foreach($voting_array as $number_votes => $number_players) {
            if ($number_votes > $votes) {
                $votes = $number_votes;
                $players = $number_players;
            }
        }
        return [$players, $votes];
    }

    public function getNewBallot(Request $request, $game_id)
    {
        $addedData = ['type' => 'new', 'request' => $request];
        return $this->getBallot($game_id, $addedData);
    }

    public function recallLastBallot(GameValidator $request)
    {
        $game_id = $request->game_id;

        $round_id = Round::where([
            'game_id' => $game_id,
            'type' => 'Ballot',
        ])->orderBy('id', 'DESC')->first()->id;

        $accusations_round = Round::where([
            'game_id' => $game_id,
            'type' => 'Accusations'
        ])->orderBy('id', 'DESC')->first()->id;

        $outcomes = $this->getAccusationResults($game_id, $accusations_round);

        $addedData = ['type' => 'existing', 'round_id' => $round_id, 'accusation_votes' => $outcomes];
        return $this->getBallot($game_id, $addedData);
    }

    public function refreshVoteCounts(GameRoundValidator $request)
    {
        $game_id = $request->game_id;
        $round_id = $request->round_id;

        $accusations_round = Round::where([
            'game_id' => $game_id,
            'type' => 'Accusations'
        ])->orderBy('id', 'DESC')->first()->id;

        $outcomes = $this->getAccusationResults($game_id, $accusations_round);
        $addedData = ['type' => 'existing', 'round_id' => $round_id, 'accusation_votes' => $outcomes];
        return $this->getBallot($game_id, $addedData);
    }


    public function getBallot($game_id, $addedData)
    {
        if ($addedData['type'] == 'new') {
            $round = Round::create([
                'game_id' => $game_id,
                'type' => 'Ballot',
            ]);
            $round_id = $round->id;
            $voteData = $addedData['request']->all();

            foreach ($voteData as $player) {
                if ($player['on_ballot']) {
                    Nominee::create([
                        'round_id' => $round_id,
                        'player_id' => $player['id']
                    ]);
                }
            }
        } else {
            $round_id = $addedData['round_id'];
            if (isset($addedData['accusation_votes']['byNominee'])) {
                $voteData = $addedData['accusation_votes']['byNominee'];
            } else {
                $voteData = $addedData['accusation_votes'];
            }
        }

        $cityInGame = Player::join('roles', 'players.allocated_role_id', '=', 'roles.id')
                            ->where('game_id', $game_id)
                            ->whereIn('alias', ['lawyer', 'mayor', 'merchant', 'preacher', 'seducer'])
                            ->pluck('players.id')->toArray();

        $voters = [];
        foreach ($voteData as $player) {
            if (!$player['on_ballot'] || in_array($player['id'], $cityInGame)) {
                $voter = [
                    'id' => $player['id'],
                    'name' => $player['name'],
                    'voted_for_id' => null,
                    'voted_for_name' => 'Awaiting...'
                ];
                $voters[$player['id']] = $voter;
            }
        }

        if ($addedData['type'] != 'new') {
            $votes = Action::where('round_id', $round_id)
            ->get();

            $players = Player::join('player_statuses', 'player_statuses.player_id', '=', 'players.id')
                ->where('game_id', $game_id)
                ->where('player_statuses.alive', 1)
                ->pluck('name', 'players.id')
                ->toArray();

            foreach ($votes as $vote) {
                $voters[$vote->voter_id]['voted_for_id'] = $vote->nominee_id;
                if ($voters[$vote->voter_id]['voted_for_name'] == "Awaiting...") {
                    $voters[$vote->voter_id]['voted_for_name'] = $players[$vote->nominee_id]." ";
                } else {
                    $voters[$vote->voter_id]['voted_for_name'] .= $players[$vote->nominee_id]." ";
                }
            }
        }

        $voters = array_values($voters); // reset the outer keys so it's mappable in javascript

        // for now we'll assume that if you're on the ballot, you can't vote, although that'll change.
        return [
            'roundId' => $round_id,
            'roundType' => 'ballot',
            'voters'=> $voters,
            'url' => URL('/game/'.$game_id.'/ballot/'.$round_id),
        ];
    }

    public function getBurn(GameRoundValidator $request)
    {
        $game_id = $request->game_id;
        $round_id = $request->round_id;

        $players = Player::join('roles', 'players.allocated_role_id', '=', 'roles.id')
                         ->join('player_statuses', 'player_statuses.player_id', '=', 'players.id')
                         ->where('players.game_id', $game_id)
                         ->where('player_statuses.alive', 1)
                         ->get([
                             'players.id',
                             'roles.alias',
                             'roles.mystic',
                             'player_statuses.minion',
                             'roles.shadow'
                         ]);

        $nominees = Nominee::where('round_id', $round_id)->get();
        $totals = [];
        foreach ($nominees as $nominee) {
            $totals[$nominee->player_id] = 0;
        }

        $actions = Action::where('round_id', $round_id)->get();

        foreach ($actions as $action) {
            if (strpos($action->action_type, "VOTE") !== false) {
                $totals[$action->nominee_id]++;
            } else if ($action->action_type == "MAYOR_SIGNAL") {
                // mayor's signal target gets an extra vote for OTHER every city player alive PLUS ONE.
                $number_of_votes = $players->whereIn('alias', ['lawyer', 'merchant', 'preacher', 'seducer'])
                                        ->where('minion', 0)
                                        ->count();
                $number_of_votes++;
                $totals[$action->nominee_id] += $number_of_votes;
            }
        }

        $cursed_player_ids = Player::where('game_id', $game_id)
                                   ->join('player_statuses', 'players.id', '=', 'player_statuses.player_id')
                                   ->where('player_statuses.alive', 1)
                                   ->where(function($curses) {
                                       $curses->where('player_statuses.cursed_farmer', 1)
                                              ->orWhere('player_statuses.cursed_necromancer', 1)
                                              ->orWhere('player_statuses.cursed_hag', 1);
                                   })->pluck('players.id')->toArray();

        foreach ($cursed_player_ids as $player_id) {
            if (isset($totals[$player_id])) {
                $totals[$player_id]++; // singular extra vote for cursed players
            }
        }

        // Seducer's votes are always halved and rounded up.
        $seducer = $players->where('alias', 'seducer')->first();
        if ($seducer && isset($totals[$seducer->id])) {
            $id = $seducer->id;
            $number_of_votes = $totals[$id];
            $halve_it = $number_of_votes / 2;
            $rounded_up = ceil($halve_it);
            $totals[$id] = $rounded_up;
        }

        // The merchant receives one fewer vote for every other city player alive on both rounds of voting.
        $merchant = $players->where('alias', 'merchant')->first();
        if ($merchant && isset($totals[$merchant->id])) {
            $subtract_votes = $players->whereIn('alias', ['lawyer', 'mayor', 'preacher', 'seducer'])
                                      ->where('minion', 0)
                                      ->count();

            $number_of_votes = $totals[$merchant->id];
            $number_of_votes =- $subtract_votes;
            if ($number_of_votes < 0) {
                $number_of_votes = 0;
            }
            $results[$merchant->id] = $number_of_votes;
        }

        // Executioner check
        $executioner_signal = $actions->where('action_type', 'EXECUTIONER_SIGNAL')->first();
        if ($executioner_signal) {
            $target_id = $executioner_signal->nominee_id;
            // check to see if the target player is a mystic or a shadow (including minion and possessed)
            $target = $players->where('id', $target_id)->first();
            if ($target->mystic || $target->shadow || $target->minion || $target->possessed) {
                foreach($totals as $key => $count) {
                    if ($key != $target_id) {
                        $totals[$id] = 0;
                    }
                }
            }
        }

        $highest = max($totals);
        $burning_ids = [];

        foreach($totals as $player_id => $total) {
            if ($total == $highest) {
                $burning_ids[] = $player_id;
            }
        }

        if (count($burning_ids) > 1) {
            return "DRAW";
        } else {

            // preacher checks
            // if the preacher is alive and the person to be burned is city, return a tie.
            $city_ids = $players->whereIn('alias', ['lawyer', 'mayor', 'merchant', 'preacher', 'seducer'])->pluck('id')->toArray();
            if (in_array($burning_ids[0], $city_ids)) {
                return "DRAW";
            }

            // if the preacher has signalled the highest player, return a tie
            $preacher_success = $actions->where('action_type', 'PREACHER_SIGNALS')
                              ->where('nominee_id', $burning_ids[0])
                              ->count();

            if ($preacher_success) {
                return "DRAW";
            }

            // otherwise, get players and then return the relevant names;
            $player = Player::find($burning_ids)->first();
            return [$highest, $player];
        }
    }

    public function deleteAction(Request $request)
    {
        Action::where('round_id', $request->round_id)
              ->where('voter_id', $request->voter_id)
              ->delete();
    }
}
