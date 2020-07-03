<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Player;
use App\Round;
use App\Action;
use App\PlayerStatus;
use App\Nominee;

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

    public function createAccusations($game_id)
    {
        $round = Round::create([
            'game_id' => $game_id,
            'type' => 'Accusations',
        ]);

        $outcomes = $this->getAccusationOutcome($round->id, $game_id);

        return [
            'roundId' => $round->id,
            'roundType' => strtolower($round->type),
            'url' => URL('/game/'.$game_id.'/accusations/'.$round->id),
            'accusations_outcomes' => $outcomes
        ];
    }

    public function getAccusationOutcome($round_id, $game_id)
    {
        $data = $this->getData($round_id, $game_id);
        $players = $data[0];
        $votes = $data[1];

        // setup votes array:
        $outcomes = [];
        foreach ($players as $key => $name) {
            $outcomes[$key] = ['voter' => $name, 'chose' => 'Waiting...'];
        }

        foreach ($votes as $vote) {
            $outcomes[$vote->voter_id]['chose'] = $players[$vote['nominee_id']];
        }

        $outcomes = array_values($outcomes);

        return $outcomes;
    }

    protected function getData($round_id, $game_id) {
        $players = Player::join('player_statuses', 'player_statuses.player_id', '=', 'players.id')
                         ->where('game_id', $game_id)
                         ->where('player_statuses.alive', 1)
                         ->pluck('name', 'players.id')
                         ->toArray();

        $votes = Action::where('round_id', $round_id)
                       ->get();

        return [$players, $votes];
    }


    // Writing this separately to start with for testing purposes but ultimately it'll make sense to
    // combine it with the getAccusationOutcome() as they will probably both be called at the same time!
    public function getAccusationResults($game_id, $round_id, $data=null)
    {
        if (!$data) {
            $data = $this->getData($round_id, $game_id);
        }

        $players = $data[0];
        $votes = $data[1];

        if (!$votes) {
            return "NO VOTES";
        }

        $results = [];
        foreach ($players as $id => $name) {
            $results[$id]['id'] = $id;
            $results[$id]['name'] = $name;
            $results[$id]['votes'] = 0;
            $results[$id]['on_ballot'] = 0;
        }


        foreach ($votes as $action) {
            if ($action->action_type == "VOTE") {
                $results[$action->nominee_id]['votes']++;
            }
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

        if($topTiers[0] == 0) {
            unset($topTiers[0]); // anyone with 0 votes will never be on the ballot. (Guarded to come later.)
        }

        if($topTiers[1] == 0) {
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

        $results = array_values($results); // reset the outer keys so it's mappable in javascript

        return $results;
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

    public function recallAccusations($game_id)
    {
        $round = Round::where([
            'game_id' => $game_id,
            'type' => 'Accusations',
        ])->orderBy('id', 'DESC')
          ->first();

        if (!$round) {
            return "NO PREVIOUS";
        }

        $outcomes = $this->getAccusationOutcome($round->id, $game_id);

        return [
            'roundId' => $round->id,
            'roundType' => strtolower($round->type),
            'url' => URL('/game/'.$game_id.'/accusations/'.$round->id),
            'accusations_outcomes' => $outcomes
        ];
    }

    public function getNewBallot(Request $request, $game_id)
    {
        $addedData = ['type' => 'new', 'request' => $request];
        return $this->getBallot($game_id, $addedData);
    }

    public function recallLastBallot($game_id)
    {
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

    public function refreshVoteCounts($game_id, $round_id)
    {
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
            $data = $addedData['request']->all();

            foreach ($data as $player) {
                if ($player['on_ballot']) {
                    Nominee::create([
                        'round_id' => $round_id,
                        'player_id' => $player['id']
                    ]);
                }
            }
        } else {
            $round_id = $addedData['round_id'];
            $data = $addedData['accusation_votes'];
        }

        $voters = [];
        foreach ($data as $player) {
            if (!$player['on_ballot']) {
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
                $voters[$vote->voter_id]['voted_for_name'] = $players[$vote->nominee_id];
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

    public function getBurn($game_id, $roundId)
    {
        // Signals and whatnot can come later. For now we'll just figure out who has the most votes!
        $actions = Action::where('round_id', $roundId)->get();
        $totals = [];
        foreach ($actions as $action) {
            if (!isset($totals[$action->player_id])) {
                $totals[$action->player_id] = 0;
            }
            $totals[$action->player_id]++;
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
            // get players and then return the relevant names;
            $player = Player::find($burning_ids);
            return [$highest, $player];
        }



    }
}
