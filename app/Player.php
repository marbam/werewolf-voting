<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    protected $fillable = [
        'name',
        'game_id',
        'listing_order'
    ];

    public function role()
    {
		return $this->hasOne("\App\Role", 'id', 'allocated_role_id');
    }
}
