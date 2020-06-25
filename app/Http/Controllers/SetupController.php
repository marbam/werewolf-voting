<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Role;
class SetupController extends Controller
{
    public function getRoles()
    {
        return Role::join('factions', 'roles.faction_id', '=', 'factions.id')
                   ->where('factions.moons', 1)
                   ->get(['roles.id', 'roles.name'])->toArray();
    }

    public function savePlayers()
    {
        // to be done when we've got the database ready.
    }
}
