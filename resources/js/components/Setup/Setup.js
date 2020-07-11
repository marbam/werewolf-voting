import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PlayerRow from './PlayerRow/PlayerRow';

class Setup extends Component {
    constructor() {
        super();
        this.state = {
            playerCount: 5,
            players: [
                {name: 'Player A', roleId: ''},
                {name: 'Player B', roleId: ''},
                {name: '', roleId: ''},
                {name: '', roleId: ''},
                {name: '', roleId: ''},
            ],
            roles: [],
            showError: false,
            playerNames: '',
            selectedRoles: [],
        };
        this.addRemovePlayer = this.addRemovePlayer.bind(this);
        this.updatePlayerCount = this.updatePlayerCount.bind(this);
        this.save = this.save.bind(this);
        this.preSaveValidate = this.preSaveValidate.bind(this);
        this.changeName = this.changeName.bind(this);
        this.changeRole = this.changeRole.bind(this);
        this.assignToPlayers = this.assignToPlayers.bind(this);
        this.selectRole = this.selectRole.bind(this);
        this.removeSelected = this.removeSelected.bind(this);
        this.assignRoles = this.assignRoles.bind(this);
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
            showError:false,
        })
        let localThis = this;
        let result = true;
        this.state.players.forEach(function(player) {
            if (player.name === '' || player.roleId === '') {
                localThis.setState({
                    showError:true,
                });
                result = false;
            }
        })
        return result;
    }

    save() {
        this.setState({
            showError:false
        });
        // loop through all players and check they've got a name and a role!
        if (this.preSaveValidate() && confirm("Are you sure this is good to go? There's no going back if not!")) {
            // submit
            axios.post('/api/save_players', [
                this.state.players,
            ])
            .then(response => {
                if (response['status'] == 200 && response.data.game_id) {
                    window.location.replace("/game/"+response.data.game_id);
                    // yes this should definitely be using BrowserRouter and whatnot but this isn't a SPA, and this works. Eh.
                    // can refactor later.
                }
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

    assignToPlayers() {
        let names = this.state.playerNames.split(",");
        names.forEach((name, index) => {names[index] = name.trim()});
        let players = this.state.players;
        names.forEach((name, index) => {
            if (players[index]) {
                players[index].name = name;
            }
        })
        this.setState({
            players: players
        });
    }

    selectRole(index) {
        let selected = this.state.selectedRoles;
        selected.push(this.state.roles[index]);
        this.setState({
            selectedRoles: selected
        })
    }

    removeSelected(index) {
        let availableRoles = this.state.selectedRoles;
        availableRoles.splice(index, 1);
        this.setState({
            selectedRoles:availableRoles
        });
    }

    assignRoles() {
        // starting with player 0, assign a random role until there are no more roles left.
        let availableRoles = [...this.state.selectedRoles];
        let players = this.state.players;
        players.forEach((player, index) => {
            if (availableRoles.length) {
                let rolesIndex = Math.floor(Math.random() * (availableRoles.length-1));
                let roleId = availableRoles[rolesIndex].id;
                player.roleId = roleId;
                players[index] = player;
                availableRoles.splice(rolesIndex, 1);
            }
        })

        this.setState({
            players: players
        })
    }

    render() {
        return (
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-12">
                        <label>Number of Players:</label>
                        <button onClick={() => this.addRemovePlayer('minus')}>-</button>
                        <input value={this.state.playerCount} onChange={this.updatePlayerCount}></input>
                        <button onClick={() => this.addRemovePlayer('add')}>+</button>
                    </div>
                    <div className="col-md-12">
                        <h4>Player / Role List</h4>
                        {this.state.players.map((player, index) =>
                            <PlayerRow
                                key={index}
                                index={index}
                                name={player.name}
                                selectedRole={player.roleId}
                                roles={this.state.roles}
                                nameC={this.changeName}
                                roleC={this.changeRole}
                            >
                            </PlayerRow>
                        )}
                    </div>
                    <div>
                        { this.state.showError ?
                            <p style={{color: 'red'}}>Please ensure all players have a name and a role!</p>
                            : null
                        }
                    </div>
                    <div>
                        <button className="btn btn-primary" type="button" onClick={this.save}>Ready to go!</button>
                    </div>
                </div>
                <br/>
                <div className="row justify-content-center">
                    <div>
                        <h4>Speedy Input</h4>
                        <label>Enter names separated with a comma: </label>
                        <input
                            value={this.state.playerNames}
                            onChange={(event) => {this.setState({playerNames: event.target.value})}}
                        ></input>
                        { this.state.playerNames.length < 20 ? null :
                            <button onClick={this.assignToPlayers}>Assign Names to Players</button>
                        }
                        <br/>
                    </div>
                </div>

                <div className="row">
                    <h4>Selectable Roles</h4>
                    {this.state.roles.map((role, index) =>
                        <button type="button" key={index} onClick={() => this.selectRole(index)}>{role.name}</button>
                    )}
                </div>
                <br/>
                <div className="row">
                    <h4>Selected Roles {this.state.selectedRoles.length ? '('+this.state.selectedRoles.length+')' : null}</h4>
                    <table>
                        <tbody>
                            {this.state.selectedRoles.map((role, index) =>
                                <tr key={index}>
                                    <td>{role.name}</td>
                                    <td><button type="button" onClick={() => this.removeSelected(index)}>Remove</button></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <br/>
                    {this.state.selectedRoles.length <= 7 ? null :
                        <button type="button" onClick={this.assignRoles}>Assign Roles to Players</button>
                    }
                </div>
            </div>
        );
    }
}

export default Setup;

if (document.getElementById('setup')) {
    ReactDOM.render(<Setup />, document.getElementById('setup'));
}
