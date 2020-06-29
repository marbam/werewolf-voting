<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Action extends Model
{
    protected $fillable = [
        'round_id',
        'action_type',
        'voter_id',
        'nominee_id'
    ];
}