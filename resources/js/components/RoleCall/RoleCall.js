import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class RoleCall extends Component {
    constructor() {
        super();
        this.state = {
            players:[],
            showButtons: true
        }
        this.showListing = this.showListing.bind(this);
    }

    componentDidMount() {
        axios.get('/api/role_call/'+this.props.game_id).then(response => {
            this.setState({
              players: response.data
            })
        })
    }

    showListing() {
        if (confirm('Are you sure you want to show the listing?')) {
            this.setState({
                showButtons:false
            })
        }
    }

    render() {
        return (
            this.state.showButtons ?
                <div>
                    <p>Click one of these buttons to confirm you're good to look at the role list!</p>
                    <button onClick={this.showListing}>I'm dead!</button>
                    <button onClick={this.showListing}>I'm a spectator!</button>
                    <button onClick={this.showListing}>The game is over!</button>
                </div>
            : <div>
                <table>
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
                                <td>{player.role}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
