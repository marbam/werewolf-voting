import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class ModView extends Component {
    constructor() {
        super();
        this.state = {
            players: [
                {id: 1, name: 'Martin', role: 'Clairvoyant', roleId: 1, alive: true},
            ]
        };
        this.changeDeadAlive = this.changeDeadAlive.bind(this);
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

    render() {
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