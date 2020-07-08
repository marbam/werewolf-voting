<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePlayerStatusTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('player_statuses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('player_id');
            $table->foreign('player_id')->references('id')->on('players');
            $table->boolean('alive')->default(1);
            $table->boolean('guarded')->default(0);
            $table->boolean('cursed_farmer')->default(0);
            $table->boolean('cursed_necromancer')->default(0);
            $table->boolean('cursed_hag')->default(0);
            $table->boolean('criminalized')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('player_status');
    }
}
