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
Route::get('/change_alive_status/{player_id}', 'ModController@changeAliveStatus');
Route::get('/get_accusable/{game}/{round}', 'PlayerController@getAccusable');

Route::get('/generate_accusations/{game_id}', 'ModController@createAccusations');
Route::get('/refresh_accusations/{round_id}/{game_id}', 'ModController@getAccusationOutcome');
Route::post('/submit_action/{game_id}/{round_id}', 'PlayerController@submitAction');
Route::get('/get_accusation_totals/{gameId}/{roundId}/', 'ModController@getAccusationResults');

Route::get('/recall_accusations/{gameId}', 'ModController@recallAccusations');
Route::post('/generate_ballot/{gameId}', 'ModController@getNewBallot');
Route::get('/refresh_ballot/{gameId}/{roundId}', 'ModController@refreshVoteCounts');
Route::get('/recall_last_ballot/{gameId}', 'ModController@recallLastBallot');
Route::get('/who_burns/{gameId}/{roundId}', 'ModController@getBurn');