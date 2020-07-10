<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call(FactionRoleSeeder::class);
        $this->call(RoleAliasSeeder::class);
        $this->call(ActionTypeSeeder::class);
        $this->call(ShadowSeeder::class);
    }
}
