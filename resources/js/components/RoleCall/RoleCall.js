import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class RoleCall extends Component {
    constructor() {
        super();
        this.state = {
            players:[],
            tableShown: false,
            revealRoles: false,
            singleShown: true,
            initialPlayers: []
        }
        this.buttonClicked = this.buttonClicked.bind(this);
        this.showRole = this.showRole.bind(this);
        this.idiotButtonClicked = this.idiotButtonClicked.bind(this);
    }

    componentDidMount() {

        let payload = {
            game_id: this.props.game_id
        };

        axios.post('/api/role_call/', payload).then(response => {
            this.setState({
              players: response.data,
              initialPlayers: response.data
            })
        })
    }

    buttonClicked (player) {
        if (player == "Spectating" && confirm("Please confirm you're okay to see all the roles!")) {
            this.setState({
                tableShown: true,
                revealRoles: true,
                singleShown: false
            })
        } else if (!player.alive) {
            this.setState({
                tableShown: true,
                revealRoles: true,
                singleShown: false
            })
        } else {
            let players = this.state.players.filter(pl => {return pl.id == player.id});
            this.setState({
                players:players,
                tableShown: true
            })
        }
    }

    showRole() {
        this.setState({
            revealRoles: true
        })
    }

    idiotButtonClicked() {
        this.setState({
            players: this.state.initialPlayers,
            tableShown: false,
            revealRoles: false,
            singleShown: true
        })
    }

    render() {
        let header = (
            <div>
                <h4>Role Allocation / Role Call</h4>
                <ul>
                    <li>If it's the start of the game, click your name to get your role.</li>
                    <li>If you have died, click your name to show the roles of all players.</li>
                </ul>
            </div>
        );

        let playerButtons = <div>
            {this.state.players.map((player, index) =>
                <button
                    key={index}
                    className="btn btn-secondary right-marg"
                    onClick={() => this.buttonClicked(player)}
                >
                    {player.name}
                </button>
            )}
            <button
                className="btn btn-secondary right-marg"
                onClick={() => this.buttonClicked("Spectating")}
                >
                I'm spectating!
            </button>
        </div>;

        return (
            <div className="container">
                {!this.state.tableShown ?
                    <div>
                        {header}
                        {playerButtons}
                    </div>
                    :
                    <div>
                        <table className="table">
                            <thead>
                                <tr>
                                    <td>Name</td>
                                    <td>Role</td>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.players.map((player, key) =>
                                    <tr key={key}>
                                        <td>{player.name}</td>
                                        <td>
                                            {this.state.revealRoles ? player.role : <button
                                                                                        onClick={this.showRole}
                                                                                        className="btn btn-success right-marg"
                                                                                    >
                                                                                        Click to show role
                                                                                    </button>}
                                            {!this.state.revealRoles ? <button
                                                                            onClick={this.idiotButtonClicked}
                                                                            className="btn btn-danger right-marg">
                                                                            I clicked on the wrong one. Take me back!
                                            </button> : null}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                }
            </div>
        )
    }
}

export default RoleCall;

if (document.getElementById('rolecall')) {
    const element = document.getElementById('rolecall')
    const props = Object.assign({}, element.dataset)
    ReactDOM.render(<RoleCall {...props}/>, element);
}
