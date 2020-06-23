import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PlayerRow from './PlayerRow/PlayerRow';

class Setup extends Component {
    constructor() {
        super();
        this.state = {
            playerCount: 9,
            players: [
                {name: '', roleId: ''},
                {name: '', roleId: ''},
                {name: '', roleId: ''},
                {name: '', roleId: ''},
                {name: '', roleId: ''},
                {name: '', roleId: ''},
                {name: '', roleId: ''},
                {name: '', roleId: ''},
                {name: '', roleId: ''}
            ],
            roles: []
        };
        this.addRemovePlayer = this.addRemovePlayer.bind(this);
        this.updatePlayerCount = this.updatePlayerCount.bind(this);
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
        setPlayerCount(event.target.value);
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
                        <PlayerRow key={index} roles={this.state.roles}></PlayerRow>
                    )}
                </div>
            </div>
        );
    }



}

export default Setup;

if (document.getElementById('setup')) {
    ReactDOM.render(<Setup />, document.getElementById('setup'));
}
