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
            accusations_outcomes: [],
            refreshingAccusations: false,
            refreshButtonText: 'Refresh',
            accusationTotals: [],
            totalsError: null,
            recallAccusationsText: 'Recall Previous Accusations',
            ballot_outcomes: [],
            ballotRound: null,
            ballotUrl: ''
        };
        this.changeDeadAlive = this.changeDeadAlive.bind(this);
        this.genAccusations = this.genAccusations.bind(this);
        this.refreshAccusations = this.refreshAccusations.bind(this);
        this.getAccusationTotals = this.getAccusationTotals.bind(this);
        this.grabLastAccusations = this.grabLastAccusations.bind(this);
        this.generateBallot = this.generateBallot.bind(this);
        this.refreshBallot = this.refreshBallot.bind(this);
        this.recallLastBallot = this.recallLastBallot.bind(this);

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

    grabLastAccusations() {
        axios.get('/api/recall_accusations/'+this.props.game_id).then(response => {
            if (response.data == "NO PREVIOUS") {
                this.setState({
                    recallAccusationsText: "No Previous!"
                })
            } else {
                this.setState({
                    roundType: response.data.roundType,
                    roundId: response.data.roundId,
                    url: response.data.url,
                    accusations_outcomes: response.data.accusations_outcomes,
                    recallAccusationsText: 'Recall Previous Accusations'
                })
            }
        })
    }

    refreshAccusations() {
        this.setState({
            refreshingAccusations: true,
            refreshButtonText: 'Refreshing...'
        })

        axios.get('/api/refresh_accusations/'+this.state.roundId+'/'+this.props.game_id).then(response => {
            this.setState({
                accusations_outcomes: response.data,
                refreshingAccusations: false,
                refreshButtonText: 'Refresh'
            });
        })
    }

    getAccusationTotals() {
        axios.get('/api/get_accusation_totals/'+this.props.game_id+'/'+this.state.roundId).then(response => {
            if (response.data == "NO VOTES") {
                this.setState({
                    totalsError: "No votes yet!"
                })
            } else {
                this.setState({
                    accusationTotals: response.data,
                    totalsError: null
                });
            }
        })
    }

    generateBallot() {
        // you'll have the ballot based on the accusation totals.
        // Submit these and generate a new round, plus nominees.
        // Return a list of everyone, along with their ability to vote and signal and who they actioned.
        let url = '/api/generate_ballot/'+this.props.game_id;

        axios.post(url, this.state.accusationTotals).then(response => {
            this.setState({
                ballotRound: response.data.roundId,
                ballot_outcomes: response.data.voters,
                ballotUrl: response.data.url
            })
        })
    }

    refreshBallot() {
        let url = '/api/refresh_ballot/'+this.props.game_id+'/'+this.state.ballotRound;
        axios.get(url).then(response => {
            this.setState({
                ballotRound: response.data.roundId,
                ballot_outcomes: response.data.voters,
                ballotUrl: response.data.url
            })
        })
    }

    recallLastBallot() {
        let url = '/api/recall_last_ballot/'+this.props.game_id;
        axios.get(url).then(response => {
            this.setState({
                ballotRound: response.data.roundId,
                ballot_outcomes: response.data.voters,
                ballotUrl: response.data.url
            })
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


        let accusationTotalsTable = !this.state.accusationTotals.length ? null :<table>
            <thead>
                <tr>
                    <td>Name</td>
                    <td>Votes</td>
                    <td>On Ballot?</td>
                </tr>
            </thead>
            <tbody>
                {this.state.accusationTotals.map((result, index) =>
                    <tr key={index}>
                        <td>{result.name}</td>
                        <td>{result.votes}</td>
                        <td>{result.on_ballot ? "Yes" : "No"}</td>
                    </tr>
                )}
            </tbody>
        </table>

        let ballotOutcomes = !this.state.ballot_outcomes.length ? null :<table>
            <thead>
                <tr>
                    <td>Name</td>
                    <td>Voted For</td>
                </tr>
            </thead>
            <tbody>
                {this.state.ballot_outcomes.map((result, index) =>
                    <tr key={index}>
                        <td>{result.name}</td>
                        <td>{result.voted_for_name}</td>
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
                <button onClick={this.grabLastAccusations}>{this.state.recallAccusationsText}</button>
                {this.state.url ? <p>Copy to Players: {this.state.url}</p> : null}
                {!this.state.url ? null : votingTable}
                {!this.state.url ? null : <button onClick={this.refreshAccusations}
                                                  disabled={this.state.refreshingAccusations}
                                          >
                                              {this.state.refreshButtonText}
                                          </button>
                }
                {!this.state.url ? null : <button onClick={this.getAccusationTotals}>Get Totals</button>}
                {accusationTotalsTable}
                {this.state.totalsError ? <p>{totalsError}</p> : null}
                <button onClick={this.generateBallot}>Generate Ballot</button>
                <button onClick={this.recallLastBallot}>Recall last Ballot</button>
                {ballotOutcomes}
                {!this.state.ballotUrl ? null : <p>Share Ballot Link with Players: {this.state.ballotUrl}</p> }
                <button onClick={this.refreshBallot}>Refresh Ballot</button>
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