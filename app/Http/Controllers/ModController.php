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
            'url' => '/game/'.$game_id.'/accusations/'.$round->id,
            'accusations_outcomes' => $outcomes
        ];
    }
}
