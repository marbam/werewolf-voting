<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Nominee extends Model
{
    protected $fillable = [
        'round_id',
        'player_id'
    ];
}
