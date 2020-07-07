<?php

use App\Role;
use Illuminate\Database\Seeder;

class ActionTypeSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Standard Vote for Accusations, usable by all
        DB::table('action_types')->insert([
            'round_type' => 'accusations',
            'all_roles' => 1,
            'alias' => 'ACCUSATION_VOTE',
            'description' => 'Standard Vote',
        ]);

        // Standard Vote for Ballot, usable by all if not on the ballot
        DB::table('action_types')->insert([
            'round_type' => 'ballot',
            'all_roles' => 1,
            'alias' => 'BALLOT_VOTE',
            'description' => 'Standard Vote',
        ]);

        $city_ballot_id = DB::table('action_types')->insertGetId([
            'round_type' => 'ballot',
            'alias' => 'CITY_BALLOT_VOTE',
            'usable_on_ballot' => 1,
            'description' => 'Standard Vote',
        ]);

        $city = Role::whereIn('alias', ['lawyer', 'mayor', 'merchant', 'preacher', 'seducer'])->get(['id', 'alias']);

        foreach ($city as $role) {
            DB::table('role_action_types')->insert([
                'role_id' => $role->id,
                'action_type_id' => $city_ballot_id
            ]);
        }

        $lawyer_signal_id = DB::table('action_types')->insertGetId([
            'round_type' => 'accusations',
            'alias' => 'LAYWER_SIGNAL',
            'description' => 'Signal',
        ]);

        DB::table('role_action_types')->insert([
            'role_id' => $city->where('alias', 'lawyer')->first()->id,
            'action_type_id' => $lawyer_signal_id
        ]);

        $mayor_signal_id = DB::table('action_types')->insertGetId([
            'round_type' => 'ballot',
            'alias' => 'MAYOR_SIGNAL',
            'usable_on_ballot' => 1,
            'description' => 'Signal',
        ]);

        DB::table('role_action_types')->insert([
            'role_id' => $city->where('alias', 'mayor')->first()->id,
            'action_type_id' => $mayor_signal_id
        ]);

        $merchant_vote_id = DB::table('action_types')->insertGetId([
            'round_type' => 'accusations',
            'alias' => 'MERCHANT_VOTES',
            'description' => 'Multiple Votes',
            'usable_on_ballot' => 1,
            'multi_select' => 1,
        ]);

        DB::table('role_action_types')->insert([
            'role_id' => $city->where('alias', 'merchant')->first()->id,
            'action_type_id' => $merchant_vote_id
        ]);

        // looks like a duplicate but they can vote on both rounds.
        $merchant_vote_id = DB::table('action_types')->insertGetId([
            'round_type' => 'ballot',
            'alias' => 'MERCHANT_VOTES',
            'description' => 'Multiple Votes',
            'multi_select' => 1,
        ]);

        DB::table('role_action_types')->insert([
            'role_id' => $city->where('alias', 'merchant')->first()->id,
            'action_type_id' => $merchant_vote_id
        ]);

        $preacher_signal_id = DB::table('action_types')->insertGetId([
            'round_type' => 'ballot',
            'alias' => 'PREACHER_SIGNALS',
            'description' => 'Signal (One Or More)',
            'multi_select' => 1,
        ]);

        DB::table('role_action_types')->insert([
            'role_id' => $city->where('alias', 'preacher')->first()->id,
            'action_type_id' => $preacher_signal_id
        ]);

        // grab the spy, inquisitor and executioner ids to finish up:
        $the_rest = Role::whereIn('alias', ['spy', 'inquisitor', 'executioner'])->get(['id', 'alias']);

        $spy_signal_id = DB::table('action_types')->insertGetId([
            'round_type' => 'accusations',
            'alias' => 'SPY_SIGNAL',
            'description' => 'Signal',
        ]);

        DB::table('role_action_types')->insert([
            'role_id' => $the_rest->where('alias', 'spy')->first()->id,
            'action_type_id' => $spy_signal_id
        ]);

        $inq_signal_id = DB::table('action_types')->insertGetId([
            'round_type' => 'accusations',
            'alias' => 'INQUISITIOR_SIGNAL',
            'description' => 'Signal',
        ]);

        DB::table('role_action_types')->insert([
            'role_id' => $the_rest->where('alias', 'inquisitor')->first()->id,
            'action_type_id' => $inq_signal_id
        ]);

        $exec_signal_id = DB::table('action_types')->insertGetId([
            'round_type' => 'ballot',
            'alias' => 'EXECUTIONER_SIGNAL',
            'description' => 'Signal',
        ]);

        DB::table('role_action_types')->insert([
            'role_id' => $the_rest->where('alias', 'executioner')->first()->id,
            'action_type_id' => $exec_signal_id
        ]);
    }
}
