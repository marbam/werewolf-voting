<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Mod Guide</title>
        <link href="{{ asset('css/app.css') }}" rel="stylesheet">
    </head>
    <body>
        <div class="container">
            <div class="jumbotron">
                <h4>Moderator Guide</h4>
            </div>
            <div>
                <p>There are two main screens that you'll be interacting with as a moderator: </p>
                <ol>
                    <li> Setup/Start page (/start) </li>
                    <li> Moderation page (will change based on game) </li>
                </ol>
            </div>
            <div>
                <h4>Setup Page</h4>
                <p>In it's simplest form, the top section allows you to select the number of players in the game</p>
                <p>From there you can enter any names and select their roles as you see fit.</p>
                <p>When you've entered names and selected roles for all players, hit "Ready to go" to start your game.</p>
                <p>There are two bits of helper ("Speedy Input") functionality:</p>
                <ul>
                    <li>Name entry - Enter a list of names separated by a comma, e.g. "Adam, Bob, Chris". Once there's a sensible number of letters in the box, you can hit "Assign Names to Players" and every name entered will be allocated to a player.</li>
                    <li>Roles - Select the roles you want in, and when you've got a sensible number, hit "Assign Roles to Players" to randomly allocate the roles.</li>
                </ul>
            </div>
            <div>
                <h4>Moderator Page</h4>
                <p>This page should give you all the functionality to handle the voting stages of the game.</p>
                <p>The top section gives you a listing of all players, their mystic and corruption status, and allows you to toggle statuses for each player.</p>
                <p>Any dead players will not show up in future Accusations or Ballots.</p>
                <p>Other statuses are linked to roles in the game, e.g. "Minion" will only show up in Vampire/Nosferatu games.</p>
                <p>At the relevant times, you can create a new round of Accusations or Ballot by clicking the relevant button</p>
                <p>If for some reason you lose the page, you can hit the "Recall" button for the relevant round to pull in the data for the most recent Accusations/Ballot</p>
                <p>Clicking on the "Refresh" buttons will update the tables, although please don't spam it!</p>
                <p>When you're happy that you've got all of the results for either round, you should be able to progress to the next stage.</p>
                <p>Clicking "Show Outcome" will show you the outcome of the ballot, not taking Jesters etc into account</p>
                <p>That's all! Good luck!</p>
            </div>
        </div>
    </body>
</html>
