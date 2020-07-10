<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PlayerStatus extends Model
{
    protected $fillable = [
        'player_id',
        'alive',
        'minion',
        'guarded',
        'cursed_farmer',
        'cursed_necromancer',
        'cursed_hag',
        'criminalized',
        'possessed'
    ];
}
