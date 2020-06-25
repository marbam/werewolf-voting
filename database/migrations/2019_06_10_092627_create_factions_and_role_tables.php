<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFactionsAndRoleTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('factions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->smallInteger('moons');
            $table->unsignedInteger('f_order');
            $table->boolean('show_in_listing')->default(1);
            $table->timestamps();
        });

        Schema::create('roles', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->string('description');
            $table->unsignedBigInteger('faction_id');
            $table->foreign('faction_id')->references('id')->on('factions');
            $table->unsignedBigInteger('notification_faction_id')->nullable();
            $table->foreign('notification_faction_id')->references('id')->on('factions');
            $table->unsignedInteger('moons')->nullable();
            $table->unsignedInteger('r_order');
            $table->boolean('show_faction_on_reveal')->default(1);
            $table->boolean('mystic')->default(0);
            $table->boolean('corrupt')->default(0);
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
        Schema::dropIfExists('factions_and_role_tables');
    }
}
