<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Maybe extends Model
{
    protected $fillable = [
        'game_id',
        'role_id',
        'faction_id',
    ];
}
