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

// Route::middleware('auth:api')->get('/user', function (Request $request) {
//     return $request->user();
// });

// Initial Setup Routing:
Route::get('/get_roles', 'SetupController@getRoles');
Route::post('/save_players', 'SetupController@savePlayers');

// Routes for Moderator View
Route::get('/get_players/{id}', 'ModController@getPlayers');
Route::post('/change_player_status', 'ModController@updatePlayerStatus');
Route::get('/new_accusations/{game_id}', 'ModController@newAccusations');
Route::get('/refresh_accusations/{game_id}/{round}', 'ModController@refreshAccusations');
Route::get('/recall_accusations/{gameId}', 'ModController@recallAccusations');
Route::get('/get_accusation_totals/{gameId}/{roundId}/', 'ModController@getAccusationResults');
Route::post('/generate_ballot/{gameId}', 'ModController@getNewBallot');
Route::get('/refresh_ballot/{gameId}/{roundId}', 'ModController@refreshVoteCounts');
Route::get('/recall_last_ballot/{gameId}', 'ModController@recallLastBallot');
Route::get('/who_burns/{gameId}/{roundId}', 'ModController@getBurn');

// Routes for Player View
Route::get('/get_accusable/{game}/{round}', 'PlayerController@getAccusable');
Route::post('/get_actions', 'PlayerController@getActionOptions');
Route::post('/submit_action/{game_id}/{round_id}', 'PlayerController@submitAction');
Route::post('/get_spy_data', 'PlayerController@getSpyTable');

// Role-call Route
Route::get('/role_call/{game_id}', 'PlayerController@getRoleCall');