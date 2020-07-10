<?php

use App\Role;
use Illuminate\Database\Seeder;

class ShadowSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $shadow_aliases = [
            'alpha',
            'pack',
            'pup',
            'vampire',
            'outcast',
            'lone',
            'necromancer',
            'hag',
            'nosferatu',
            'possessed',
            'creature',
            'arsonist'
        ];

        $roles = Role::whereIn('alias', $shadow_aliases)->get();

        foreach ($roles as $role) {
            $role->shadow = 1;
            $role->save();
        }
    }
}
