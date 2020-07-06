<?php

use App\Role;
use Illuminate\Database\Seeder;

class RoleAliasSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $updates[] = ['name' => 'Alpha Wolf', 'alias' => 'alpha'];
        $updates[] = ['name' => 'Pack Wolf', 'alias' => 'pack'];
        $updates[] = ['name' => 'Wolf Pup', 'alias' => 'pup'];
        $updates[] = ['name' => 'Defector', 'alias' => 'defector'];
        $updates[] = ['name' => 'Clairvoyant', 'alias' => 'clairvoyant'];
        $updates[] = ['name' => 'Wizard', 'alias' => 'wizard'];
        $updates[] = ['name' => 'Medium', 'alias' => 'medium'];
        $updates[] = ['name' => 'Witch', 'alias' => 'witch'];
        $updates[] = ['name' => 'Healer', 'alias' => 'healer'];
        $updates[] = ['name' => 'Farmer', 'alias' => 'farmer'];
        $updates[] = ['name' => 'Priest', 'alias' => 'priest'];
        $updates[] = ['name' => 'Sinner', 'alias' => 'sinner'];
        $updates[] = ['name' => 'Monk', 'alias' => 'monk'];
        $updates[] = ['name' => 'Bard', 'alias' => 'bard'];
        $updates[] = ['name' => 'Innkeeper', 'alias' => 'innkeeper'];
        $updates[] = ['name' => 'Hermit', 'alias' => 'hermit'];
        $updates[] = ['name' => 'Jester', 'alias' => 'jester'];
        $updates[] = ['name' => 'Madman', 'alias' => 'madman'];

        $updates[] = ['name' => 'Vampire', 'alias' => 'vampire'];
        $updates[] = ['name' => 'Igor', 'alias' => 'igor'];
        $updates[] = ['name' => 'Vampire Hunter', 'alias' => 'hunter'];

        $updates[] = ['name' => 'Lawyer', 'alias' => 'lawyer'];
        $updates[] = ['name' => 'Mayor', 'alias' => 'mayor'];
        $updates[] = ['name' => 'Merchant', 'alias' => 'merchant'];
        $updates[] = ['name' => 'Preacher', 'alias' => 'preacher'];
        $updates[] = ['name' => 'Seducer', 'alias' => 'seducer'];

        $updates[] = ['name' => 'Assassin', 'alias' => 'assassin'];
        $updates[] = ['name' => 'Corrupt Guard', 'alias' => 'cguard'];
        $updates[] = ['name' => 'Guild Master', 'alias' => 'guild'];
        $updates[] = ['name' => 'Thief', 'alias' => 'thief'];
        $updates[] = ['name' => 'Spy', 'alias' => 'spy'];
        $updates[] = ['name' => 'Guard', 'alias' => 'guard'];
        $updates[] = ['name' => 'Guard', 'alias' => 'guard'];

        $updates[] = ['name' => 'Juliet', 'alias' => 'juliet'];
        $updates[] = ['name' => 'Guardian Angel', 'alias' => 'angel'];

        $updates[] = ['name' => 'Pestilent', 'alias' => 'pestilent'];
        $updates[] = ['name' => 'Undertaker', 'alias' => 'undertaker'];
        $updates[] = ['name' => 'Poacher', 'alias' => 'poacher'];
        $updates[] = ['name' => 'Vagrant', 'alias' => 'vagrant'];

        $updates[] = ['name' => 'Inquisitor', 'alias' => 'inquisitor'];
        $updates[] = ['name' => 'Executioner', 'alias' => 'executioner'];
        $updates[] = ['name' => 'Templar', 'alias' => 'templar'];

        $updates[] = ['name' => 'Hag', 'alias' => 'hag'];
        $updates[] = ['name' => 'Outcast Wolf', 'alias' => 'outcast'];
        $updates[] = ['name' => 'Lone Wolf', 'alias' => 'lone'];
        $updates[] = ['name' => 'Necromancer', 'alias' => 'necromancer'];
        $updates[] = ['name' => 'Nosferatu', 'alias' => 'nosferatu'];
        $updates[] = ['name' => 'Possessed', 'alias' => 'possessed'];

        foreach($updates as $update) {
            $roles = Role::where('name', $update['name'])->get();
            foreach($roles as $role) {
                $role->alias = $update['alias'];
                $role->save();
            }
        }
    }
}
