<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Route::get('/', function () {
//     return view('welcome');
// });

Route::get('/', function () {
    return view('gameSetup');
});

Route::get('/game/{id}', 'ModController@showGame');

Route::get('/game/{id}/vote/{voteId}/accusation', function () {
    return view('playerView');
});

Route::get('/game/{id}/vote/{voteId}/ballot', function () {
    return view('playerView');
});