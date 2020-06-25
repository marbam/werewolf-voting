<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    protected $fillable = [
        'game_id',
        'role_id',
        'allocated'
    ];
}
