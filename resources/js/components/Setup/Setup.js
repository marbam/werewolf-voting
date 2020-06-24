import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PlayerRow from './PlayerRow/PlayerRow';

class Setup extends Component {
    constructor() {
        super();
        this.state = {
            playerCount: 9,
            players: [
                {name: 'Player A', roleId: ''},
                {name: 'Player B', roleId: ''},
                {name: '', roleId: ''},
                {name: '', roleId: ''},
                {name: '', roleId: ''},
                {name: '', roleId: ''},
                {name: '', roleId: ''},
                {name: '', roleId: ''},
                {name: '', roleId: ''}
            ],
            roles: [],
            inputOK: true,
            showError: false,
        };
        this.addRemovePlayer = this.addRemovePlayer.bind(this);
        this.updatePlayerCount = this.updatePlayerCount.bind(this);
        this.save = this.save.bind(this);
        this.preSaveValidate = this.preSaveValidate.bind(this);
        this.changeName = this.changeName.bind(this);
        this.changeRole = this.changeRole.bind(this);
    }

    componentDidMount() {
        axios.get('api/get_roles').then(response => {
            this.setState({
              roles: response.data
            })
        })
    }

    addRemovePlayer(action) {
        let updatedPlayers = this.state.players;
        if (action == 'add') {
            updatedPlayers.push({name: '', roleId: ''});
        } else {
            if (updatedPlayers.length > 0) {
                updatedPlayers.pop();
            }
        }
        this.setState({
            playerCount: updatedPlayers.length,
            players: updatedPlayers
        })
    }

    updatePlayerCount(event) {
        let players = this.state.players;
        let requiredSize = event.target.value;
        if (requiredSize > players.length) {
            while (players.length < requiredSize) {
                players.push({name: '', roleId: ''});
            }
        } else if (requiredSize < players.length) {
            // we need to remove the last player from the array until the array length == the updated count.
            while(requiredSize < players.length) {
                players.pop();
            }
        }
        this.setState({
            players: players,
            playerCount: players.length
        })
    }

    preSaveValidate() {
        this.setState({
            inputOK: true
        })
        let localThis = this;
        this.state.players.forEach(function(player) {
            if (player.name === '' || player.roleId === '') {
                localThis.setState({
                    showError:true,
                    inputOK: false
                });
                return;
            }
        })
    }

    save() {
        this.setState({
            showError:false
        });
        // loop through all players and check they've got a name and a role!
        this.preSaveValidate();
        if (this.state.inputOK) {
            // submit
            axios.post('/api/save_players', [
                this.state.players,
            ])
            .then(function(response){
                // then wipe everything.
                // if (response['status'] == 200) {
                // do bits
                // }
            })
        }
    }

    changeName(index) {
        let players = this.state.players;
        players[index].name = event.target.value;
        this.setState({
            players: players
        });
    }

    changeRole(index) {
        let players = this.state.players;
        players[index].roleId = event.target.value;
        this.setState({
            players: players
        });
    }

    render() {
        return (
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <button onClick={() => this.addRemovePlayer('minus')}>-</button>
                        <input value={this.state.playerCount} onChange={this.updatePlayerCount}></input>
                        <button onClick={() => this.addRemovePlayer('add')}>+</button>
                    </div>
                    {this.state.players.map((player, index) =>
                        <PlayerRow
                            key={index}
                            index={index}
                            name={player.name}
                            role={player.roleId}
                            roles={this.state.roles}
                            nameC={this.changeName}
                            roleC={this.changeRole}
                        >
                        </PlayerRow>
                    )}
                </div>
                { this.state.showError ?
                    <p style={{color: 'red'}}>Please ensure all players have a name and a role!</p>
                    : null
                }
                <button onClick={this.save}>Ready to go!</button>
            </div>
        );
    }
}

export default Setup;

if (document.getElementById('setup')) {
    ReactDOM.render(<Setup />, document.getElementById('setup'));
}
