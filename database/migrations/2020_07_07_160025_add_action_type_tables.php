<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddActionTypeTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('action_types', function (Blueprint $table) {
            $table->id();
            $table->string('round_type', 15);
            $table->boolean('all_roles')->default(0);
            $table->string('alias', 20);
            $table->string('description');
            $table->boolean('usable_on_ballot')->default(0);
            $table->boolean('multi_select')->default(0);
            $table->timestamps();
        });

        Schema::create('role_action_types', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('role_id');
            $table->foreign('role_id')->references('id')->on('roles');
            $table->unsignedBigInteger('action_type_id');
            $table->foreign('action_type_id')->references('id')->on('action_types');
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
        Schema::dropIfExists('role_action_types');
        Schema::dropIfExists('action_types');
    }
}
