import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class ModView extends Component {
    constructor() {
        super();
        this.state = {
            players: [
                {id: 1, name: 'Martin', role: 'Clairvoyant', roleId: 1, alive: true},
            ],
            roundType: 'accusations',
            roundId: null,
            url: null,
            accusations_outcomes: []
        };
        this.changeDeadAlive = this.changeDeadAlive.bind(this);
        this.genAccusations = this.genAccusations.bind(this);
        this.refreshAccusations = this.refreshAccusations.bind(this);
    }

    componentDidMount() {
        axios.get('/api/get_players/'+this.props.game_id).then(response => {
            this.setState({
              players: response.data
            })
        })
    }

    changeDeadAlive(index) {
        let updatedPlayers = this.state.players;
        let playerId = updatedPlayers[index].id;

        axios.get('/api/change_alive_status/'+playerId).then(response => {
            updatedPlayers[index].alive = response.data;
            this.setState({
              players: updatedPlayers
            })
        })
    }

    genAccusations() {
        axios.get('/api/generate_accusations/'+this.props.game_id).then(response => {

            this.setState({
                roundType: response.data.roundType,
                roundId: response.data.roundId,
                url: response.data.url,
                accusations_outcomes: response.data.accusations_outcomes
            })
        })
    }

    refreshAccusations() {
        axios.get('/api/refresh_accusations/'+this.state.roundId+'/'+this.props.game_id).then(response => {
            this.setState({
                accusations_outcomes: response.data
            });
        })
    }

    render() {

        let votingTable = <table>
            <thead>
                <tr>
                    <td>Voter</td>
                    <td>Chose</td>
                </tr>
            </thead>
            <tbody>
                {this.state.accusations_outcomes.map((result, index) =>
                    <tr key={index}>
                        <td>{result.voter}</td>
                        <td>{result.chose}</td>
                    </tr>
                )}
            </tbody>
        </table>

        return (
            <div className="container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Alive</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.players.map((player, index) =>
                            <tr key={index}>
                                <td>{player.name}</td>
                                <td>{player.role}</td>
                                <td>{player.alive ? 'Alive' : 'Dead'}</td>
                                <td>
                                    <button onClick={() => this.changeDeadAlive(index)}>
                                        Toggle Life!
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <button onClick={this.genAccusations}>Generate Accusations</button>
                {this.state.url ? <p>Copy to Players: {this.state.url}</p> : null}
                {!this.state.url ? null : votingTable}
                {!this.state.url ? null : <button onClick={this.refreshAccusations}>Refresh</button>}
            </div>
        );
    }
}

export default ModView;

if (document.getElementById('modview')) {
    const element = document.getElementById('modview')
    const props = Object.assign({}, element.dataset)
    ReactDOM.render(<ModView {...props}/>, element);
}