import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './ModView.css';

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
            ballotFeedback: null,
            closeBallotText: 'Close Ballot for Voting!'
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
        this.closeBallot = this.closeBallot.bind(this);
    }

    componentDidMount() {

        let payload = {
            game_id: this.props.game_id
        };

        axios.post('/api/get_players/', payload).then(response => {
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

        let payload = {
            game_id: this.props.game_id
        };

        axios.post('/api/new_accusations/', payload).then(response => {
            this.setState({
                roundType: response.data.general.roundType,
                roundId: response.data.general.roundId,
                accusationsUrl: response.data.general.url,
                accusations_outcomes: response.data.byVoter,
                accusationTotals: response.data.byNominee,
                accusationsComplete: false,
                ballotActions: [],
                ballotRound: null,
                ballotUrl: '',
                ballotFeedback: null

            });
        })
    }



    refreshAccusations() {
        this.setState({
            refreshingAccusations: true,
            refreshButtonText: 'Refreshing...'
        })

        let payload = {
            game_id: this.props.game_id,
            round_id: this.state.roundId
        }

        axios.post('/api/refresh_accusations', payload).then(response => {
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

        let payload = {
            game_id: this.props.game_id
        }

        axios.post('/api/recall_accusations/', payload).then(response => {
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
        let payload =  {
            game_id: this.props.game_id,
            round_id: this.state.ballotRound
        }

        axios.post('/api/refresh_ballot', payload).then(response => {
            this.setState({
                ballotRound: response.data.roundId,
                ballotActions: response.data.voters,
                ballotUrl: response.data.url
            })
        })
    }

    recallLastBallot() {
        let payload = {
            game_id: this.props.game_id
        }

        axios.post('/api/recall_last_ballot', payload).then(response => {
            this.setState({
                ballotRound: response.data.roundId,
                ballotActions: response.data.voters,
                ballotUrl: response.data.url
            })
        })
    }

    showBallotOutcome() {
        let payload = {
            game_id: this.props.game_id,
            round_id: this.state.ballotRound
        }

        axios.post('/api/who_burns', payload).then(response => {
            let feedback = null;
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

    deleteAccusationAction(result, roundId) {

        let payload = {
            round_id: roundId,
            voter_id: result.voter_id
        }

        axios.post('/api/delete_action', payload).then(response => {
            alert('deleted! (update shortly)');
        });
    }

    deleteBallotAction(result, roundId) {
        let payload = {
            round_id: roundId,
            voter_id: result.id
        }

        axios.post('/api/delete_action', payload).then(response => {
            alert('deleted! (update shortly)');
        });
    }

    closeBallot() {
        let payload = {
            game_id: this.props.game_id,
            round_id: this.state.ballotRound
        }

        axios.post('/api/close_ballot', payload).then(response => {
            this.setState({
                closeBallotText: 'Closed!'
            })
        });
    }

    render() {
        let votingTable = <table className="table">
            <thead>
                <tr>
                    <td>Voter</td>
                    <td>Chose</td>
                    <td>Type</td>
                    <td>Options</td>
                </tr>
            </thead>
            <tbody>
                {this.state.accusations_outcomes.map((result, index) =>
                    <tr key={index}>
                        <td>{result.voter}</td>
                        <td>{result.chose}</td>
                        <td>{result.type}</td>
                        <td>{result.voter_id ? <button
                                className="btn btn-sm btn-danger"
                                onClick={() => this.deleteAccusationAction(result, this.state.roundId)}>Delete
                            </button> : null}
                        </td>
                    </tr>
                )}
            </tbody>
        </table>


        let accusationTotalsTable = !this.state.accusationTotals.length ? null :
        <table className="table">
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

        let ballotOutcomes = !this.state.ballotActions.length ? null :
        <table className="table">
            <thead>
                <tr>
                    <td>Name</td>
                    <td>Voted For</td>
                    <td>Options</td>
                </tr>
            </thead>
            <tbody>
                {this.state.ballotActions.map((result, index) =>
                    <tr key={index}>
                        <td>{result.name}</td>
                        <td>{result.voted_for_name}</td>
                        <td>
                            {result.voted_for_id ? <button
                                className="btn btn-sm btn-danger"
                                onClick={() => this.deleteBallotAction(result, this.state.ballotRound)}>Delete
                            </button> : null}
                        </td>
                    </tr>
                )}
            </tbody>
        </table>

        return (
            <div className="container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>M</th>
                            <th>C</th>
                            <th className="centre-text">Alive</th>
                            <th className="centre-text">Minion</th>
                            <th className="centre-text">Criminalized</th>
                            <th className="centre-text">Guarded</th>
                            <th className="centre-text">Farmer Curse</th>
                            <th className="centre-text">Necromancer Curse</th>
                            <th className="centre-text">Hag Curse</th>
                            <th className="centre-text">Possessed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.players.map((player, index) =>
                            <tr key={index} className={`${player.alive ? null : "killed"}`}>
                                <td>{player.name}</td>
                                <td>{player.role}</td>
                                <td>{player.mystic ? "✓" : null}</td>
                                <td>{(player.corrupt || player.cursed_farmer || player.cursed_necromancer || player.cursed_hag)
                                    ? "✓" : null}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => this.changeStatus(index, 'alive')}>
                                        {player.alive ? 'Alive' : 'Dead'}
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-secondary centre-td"
                                        onClick={() => this.changeStatus(index, 'minion')}>
                                        {player.minion ? 'Minion' : 'x'}
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-secondary centre-td"
                                        onClick={() => this.changeStatus(index, 'criminalized')}>
                                        {player.criminalized ? 'Criminalized' : 'x'}
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-secondary centre-td"
                                        onClick={() => this.changeStatus(index, 'guarded')}>
                                        {player.guarded ? 'Guarded' : 'x'}
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-secondary centre-td"
                                        onClick={() => this.changeStatus(index, 'cursed_farmer')}>
                                        {player.cursed_farmer ? 'Monster Curse' : 'x'}
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-secondary centre-td"
                                        onClick={() => this.changeStatus(index, 'cursed_necromancer')}>
                                        {player.cursed_necromancer ? 'Necromancer Curse' : 'x'}
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-secondary centre-td"
                                        onClick={() => this.changeStatus(index, 'cursed_hag')}>
                                        {player.cursed_hag ? 'Bewitched' : 'x'}
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-secondary centre-td"
                                        onClick={() => this.changeStatus(index, 'possessed')}>
                                        {player.possessed ? 'Possessed' : 'x'}
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <button
                    className="btn btn-primary right-marg"
                    onClick={this.newAccusations}
                >
                    Generate New Accusations
                </button>
                <button
                    className="btn btn-primary"
                    onClick={this.grabLastAccusations}
                >
                    {this.state.recallAccusationsText}
                </button>
                {this.state.accusationsUrl ? <p>Share This Accusations Link with Players: <strong>{this.state.accusationsUrl}</strong></p> : null}
                {!this.state.accusationsUrl ? null : <button
                                                        className="btn btn-primary"
                                                        onClick={this.refreshAccusations}
                                                        disabled={this.state.refreshingAccusations}
                                                    >
                                                        {this.state.refreshButtonText}
                                                    </button>
                }
                {!this.state.accusationsUrl ? null : <h4>Listing of who is voting for who:</h4>}
                {!this.state.accusationsUrl ? null : votingTable}
                {accusationTotalsTable ? <h4>Listing of votes by target:</h4> : null}
                {accusationTotalsTable}
                {!this.state.accusationsComplete ? null :
                    <div>
                        <button
                            className="btn btn-primary right-marg"
                            onClick={this.generateBallot}
                        >
                            Generate New Ballot (Closes Accusations for Voting)
                        </button>
                        <button
                            className="btn btn-primary right-marg"
                            onClick={this.recallLastBallot}
                        >
                            Recall Most Recent Ballot
                        </button>
                        {!this.state.ballotUrl ? null : <p>Share Ballot Link with Players: <strong>{this.state.ballotUrl}</strong></p> }
                        {ballotOutcomes}
                        <button
                            className="btn btn-primary right-marg"
                            onClick={this.refreshBallot}
                        >
                            Refresh Ballot
                        </button>
                        <button
                            className="btn btn-primary right-marg"
                            onClick={this.showBallotOutcome}
                        >
                            Show Outcome
                        </button>
                        {!this.state.ballotFeedback ? null : <p>Outcome is guidance only and doesn't take Jesters etc into account!</p>}
                        {this.state.ballotFeedback}
                        {!this.state.ballotFeedback ? null : <button
                                                                onClick={this.closeBallot}
                                                                className="btn btn-primary"
                                                            >{this.state.closeBallotText}</button>
                        }
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