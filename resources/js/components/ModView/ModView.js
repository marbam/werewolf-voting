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
            accusationsUrl: null,
            accusations_outcomes: [],
            refreshingAccusations: false,
            refreshButtonText: 'Refresh',
            accusationTotals: [],
            recallAccusationsText: 'Recall Most Recent Accusations',
            accusationsComplete: false,
            ballotActions: [],
            ballotRound: null,
            ballotUrl: '',
            ballotFeedback: null
        };
        this.changeStatus = this.changeStatus.bind(this);
        this.newAccusations = this.newAccusations.bind(this);
        this.refreshAccusations = this.refreshAccusations.bind(this);
        this.grabLastAccusations = this.grabLastAccusations.bind(this);
        this.generateBallot = this.generateBallot.bind(this);
        this.refreshBallot = this.refreshBallot.bind(this);
        this.recallLastBallot = this.recallLastBallot.bind(this);
        this.showBallotOutcome = this.showBallotOutcome.bind(this);
        this.checkAccusationsDone = this.checkAccusationsDone.bind(this);
    }

    componentDidMount() {
        axios.get('/api/get_players/'+this.props.game_id).then(response => {
            this.setState({
              players: response.data
            })
        })
    }

    changeStatus(index, status) {
        let updatedPlayers = this.state.players;
        let playerId = updatedPlayers[index].id;

        let payload = {
            player_id: playerId,
            status: status
        }

        axios.post('/api/change_player_status/', payload).then(response => {
            updatedPlayers[index][status] = response.data;
            this.setState({
              players: updatedPlayers
            })
        })
    }

    newAccusations() {
        axios.get('/api/new_accusations/'+this.props.game_id).then(response => {
            this.setState({
                roundType: response.data.general.roundType,
                roundId: response.data.general.roundId,
                accusationsUrl: response.data.general.url,
                accusations_outcomes: response.data.byVoter,
                accusationTotals: response.data.byNominee,
            });
        })
    }

    refreshAccusations() {
        this.setState({
            refreshingAccusations: true,
            refreshButtonText: 'Refreshing...'
        })

        axios.get('/api/refresh_accusations/'+this.props.game_id+'/'+this.state.roundId).then(response => {
            this.setState({
                accusations_outcomes: response.data.byVoter,
                accusationTotals: response.data.byNominee,
                refreshingAccusations: false,
                refreshButtonText: 'Refresh'
            })
        }).then(check => {
            this.checkAccusationsDone();
        });
    }

    grabLastAccusations() {
        axios.get('/api/recall_accusations/'+this.props.game_id).then(response => {
            if (response.data == "NO PREVIOUS") {
                this.setState({
                    recallAccusationsText: "No Previous!"
                })
            } else {
                this.setState({
                    roundType: response.data.general.roundType,
                    roundId: response.data.general.roundId,
                    accusationsUrl: response.data.general.url,
                    accusations_outcomes: response.data.byVoter,
                    accusationTotals: response.data.byNominee,
                    recallAccusationsText: 'Recall Most Recent Accusations'
                })
            }
        }).then(check => {
            this.checkAccusationsDone();
        })
    }

    checkAccusationsDone() {
        let done = true;
        let actions = this.state.accusations_outcomes;
        for (let i = 0; i < actions.length; i++) {
            if (actions[i].chose == "Waiting...") {
                done = false;
            }
        }
        this.setState({
            accusationsComplete: done
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
                ballotActions: response.data.voters,
                ballotUrl: response.data.url
            })
        })
    }

    refreshBallot() {
        let url = '/api/refresh_ballot/'+this.props.game_id+'/'+this.state.ballotRound;
        axios.get(url).then(response => {
            this.setState({
                ballotRound: response.data.roundId,
                ballotActions: response.data.voters,
                ballotUrl: response.data.url
            })
        })
    }

    recallLastBallot() {
        let url = '/api/recall_last_ballot/'+this.props.game_id;
        axios.get(url).then(response => {
            this.setState({
                ballotRound: response.data.roundId,
                ballotActions: response.data.voters,
                ballotUrl: response.data.url
            })
        })
    }

    showBallotOutcome() {
        let url = '/api/who_burns/'+this.props.game_id+'/'+this.state.ballotRound;
        axios.get(url).then(response => {
            let feedback = 'test';
            if (response.data == "DRAW") {
                feedback = "The village is undecided";
            } else {
                feedback = "Burning today on the bonfire is "+response.data[1].name+" with "+response.data[0]+" votes";
            }
            this.setState({
                ballotFeedback:<p>{feedback}</p>
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

        let ballotOutcomes = !this.state.ballotActions.length ? null :<table>
            <thead>
                <tr>
                    <td>Name</td>
                    <td>Voted For</td>
                </tr>
            </thead>
            <tbody>
                {this.state.ballotActions.map((result, index) =>
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
                            <th>M</th>
                            <th>C</th>
                            <th>Alive</th>
                            <th>Guarded</th>
                            <th>Farmer Curse</th>
                            <th>Necromancer Curse</th>
                            <th>Hag Curse</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.players.map((player, index) =>
                            <tr key={index}>
                                <td>{player.name}</td>
                                <td>{player.role}</td>
                                <td>M</td>
                                <td>C</td>
                                <td>
                                    <button onClick={() => this.changeStatus(index, 'alive')}>
                                        {player.alive ? 'Alive' : 'Dead'}
                                    </button>
                                </td>
                                <td>
                                    <button onClick={() => this.changeStatus(index, 'guarded')}>
                                        {player.guarded ? 'Guarded' : 'x'}
                                    </button>
                                </td>
                                <td>
                                    <button onClick={() => this.changeStatus(index, 'cursed_farmer')}>
                                        {player.cursed_farmer ? 'Monster Curse' : 'x'}
                                    </button>
                                </td>
                                <td>
                                    <button onClick={() => this.changeStatus(index, 'cursed_necromancer')}>
                                        {player.cursed_necromancer ? 'Necromancer Curse' : 'x'}
                                    </button>
                                </td>
                                <td>
                                    <button onClick={() => this.changeStatus(index, 'cursed_hag')}>
                                        {player.cursed_hag ? 'Bewitched' : 'x'}
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <button onClick={this.newAccusations}>New Accusations</button>
                <button onClick={this.grabLastAccusations}>{this.state.recallAccusationsText}</button>
                {this.state.accusationsUrl ? <p>Share This Accusations Link with Players: {this.state.accusationsUrl}</p> : null}
                {!this.state.accusationsUrl ? null : <button onClick={this.refreshAccusations}
                                                  disabled={this.state.refreshingAccusations}
                                          >
                                              {this.state.refreshButtonText}
                                          </button>
                }
                {!this.state.accusationsUrl ? null : votingTable}
                {accusationTotalsTable}
                {!this.state.accusationsComplete ? null :
                    <div>
                        <button onClick={this.generateBallot}>Generate Ballot</button>
                        <button onClick={this.recallLastBallot}>Recall Most Recent Ballot</button>
                        {!this.state.ballotUrl ? null : <p>Share Ballot Link with Players: {this.state.ballotUrl}</p> }
                        {ballotOutcomes}
                        <button onClick={this.refreshBallot}>Refresh Ballot</button>
                        <button onClick={this.showBallotOutcome}>Show Outcome</button>
                        {!this.state.ballotFeedback ? null : <p>Outcome is guidance only and doesn't take Jesters etc into account!</p>}
                        {this.state.ballotFeedback}
                    </div>
                }
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