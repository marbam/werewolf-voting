<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Werewolf Voting</title>
    </head>
    <body>
        <div id="modview" data-game_id="{{$game_id}}"></div>

        <script src="{{ asset('js/app.js') }}"></script>
    </body>
</html>
