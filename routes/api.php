<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/get_roles', 'SetupController@getRoles');
Route::post('/save_players', 'SetupController@savePlayers');
Route::get('/get_players/{id}', 'ModController@getPlayers');
Route::get('/get_accusable/{id}', 'PlayerController@getAccusable');
