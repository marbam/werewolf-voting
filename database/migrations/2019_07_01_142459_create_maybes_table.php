<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateMaybesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('maybes', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('game_id');
            $table->foreign('game_id')->references('id')->on('games');
            $table->unsignedBigInteger('role_id')->nullable();
            $table->foreign('role_id')->references('id')->on('roles');
            $table->unsignedBigInteger('faction_id')->nullable();
            $table->foreign('faction_id')->references('id')->on('factions');
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
        Schema::dropIfExists('maybes');
    }
}
