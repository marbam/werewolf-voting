<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = [
        'alias'
    ];

    public function faction()
    {
		    return $this->hasOne("\App\Faction", 'id', 'faction_id');
    }
}
