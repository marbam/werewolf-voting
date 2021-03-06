<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Role;
use App\Game;
use App\Player;
use App\PlayerStatus;
use Carbon\Carbon;

class SetupController extends Controller
{
    public function getRoles()
    {
        return Role::get(['roles.id', 'roles.name'])->toArray();
    }

    public function savePlayers(Request $request)
    {
        $date = Carbon::now()->isoFormat('DDmmYY');
        $random = rand(0, 1000);
        $code = $date.$random;

        $game = Game::create([
            'code' => $code, // bodging these in for now, it's historical data but no harm in keeping it.
            'moderator_id' => 1 // can look at this at a later date, use '1' for now.
        ]);

        $playerData = $request->all()[0];

        foreach ($playerData as $index => $data) {
            $player = Player::create([
                'name' => $data['name'],
                'game_id' => $game->id,
                'allocated_role_id' => $data['roleId'],
                'listing_order' => $index+1
            ]);
            PlayerStatus::create([
                'player_id' => $player->id
            ]);
        }

        return ['game_id' => $game->id];
    }
}
