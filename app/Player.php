<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    protected $fillable = [
        'name',
        'game_id',
        'allocated_role_id',
        'listing_order'
    ];

    public function role()
    {
		    return $this->hasOne("\App\Role", 'id', 'allocated_role_id');
    }

    public function status()
    {
        return $this->hasOne("\App\Status", 'player_id', 'id');
    }
}
