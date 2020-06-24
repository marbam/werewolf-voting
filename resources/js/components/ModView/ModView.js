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
        this.kill = this.kill.bind(this);
    }

    componentDidMount() {
        let gameId = 1; // testing
        axios.get('/api/get_players/'+gameId).then(response => {
            this.setState({
              players: response.data
            })
        })
    }

    kill(index) {
       let updatedPlayers = this.state.players;
       updatedPlayers[index].alive = !updatedPlayers[index].alive;
       this.setState({
           players:updatedPlayers
       });
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
                                    <button onClick={() => this.kill(index)}>
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
    ReactDOM.render(<ModView />, document.getElementById('modview'));
}
