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
Route::post('/get_roles', 'SetupController@getRoles');
Route::post('/save_players', 'SetupController@savePlayers');

// Routes for Moderator View
Route::post('/get_players', 'ModController@getPlayers');
Route::post('/change_player_status', 'ModController@updatePlayerStatus');
Route::post('/new_accusations', 'ModController@newAccusations');
Route::post('/refresh_accusations', 'ModController@refreshAccusations');
Route::post('/recall_accusations', 'ModController@recallAccusations');
Route::post('/generate_ballot/{gameId}', 'ModController@getNewBallot');
Route::post('/refresh_ballot', 'ModController@refreshVoteCounts');
Route::post('/recall_last_ballot', 'ModController@recallLastBallot');
Route::post('/who_burns', 'ModController@getBurn');
Route::post('/delete_action', 'ModController@deleteAction');
Route::post('/close_ballot', 'ModController@closeBallot');

// Routes for Player View
Route::post('/get_accusable', 'PlayerController@getAccusable');
Route::post('/get_actions', 'PlayerController@getActionOptions');
Route::post('/submit_action/{game_id}/{round_id}', 'PlayerController@submitAction'); // leave additionals in
Route::post('/get_spy_data', 'PlayerController@getSpyTable');

// Role-call Route
Route::post('/role_call', 'PlayerController@getRoleCall');