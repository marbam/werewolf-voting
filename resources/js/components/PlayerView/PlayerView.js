import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class PlayerView extends Component {
    constructor() {
        super();
        this.state = {
            players: [],
            showInitialCheck: true,
            firstResult: null,
            showDoubleCheck: false,
            enteredName: '',
            showSelectError: false,
            showIneligibleScreen: false,
            myActionOptions: [],
            showOptions: false,
            action: '',
            showVotables: false,
            choices: [],
            showSubmit: false,
            submittingText : "Submit to Mod!",
            submitted: false,
            submittedText: "Your feedback has been received! You can now close the window and get back to the game!",
            disableSubmit: false,
            spyData: [],
            showSpyData: false
        };
        this.updateName = this.updateName.bind(this);
        this.completeDouble = this.completeDouble.bind(this);
        this.setOption = this.setOption.bind(this);
        this.submitChoice = this.submitChoice.bind(this);
        this.doSpyStuff = this.doSpyStuff.bind(this);
    }

    componentDidMount() {
        let game_id = this.props.game_id;
        let round_id = this.props.round_id;
        axios.get('/api/get_accusable/'+game_id+'/'+round_id).then(response => {
            this.setState({
              players: response.data
            })
        })
    }

    completeInitial(index) {
        this.setState({
            firstResult: this.state.players[index],
            showDoubleCheck: true
        });
    }

    updateName(event) {
        this.setState({
            enteredName: event.target.value
        })
    }

    completeDouble() {
        if (this.state.firstResult.name == this.state.enteredName) {
            let payload = {
                player_id: this.state.firstResult.id,
                round_id: this.props.round_id,
                role_id: this.state.firstResult.roleId
            };

            axios.post('/api/get_actions/', payload).then(response => {
                this.setState({
                    myActionOptions: response.data
                });
            }).then(eh => {
                if (this.state.myActionOptions.length) {
                    this.setState({
                        showSelectError: false,
                        showInitialCheck: false,
                        showDoubleCheck: false,
                        showOptions: true
                    });
                } else {
                    this.setState({
                        showIneligibleScreen: true
                    });
                }
            })
        } else {
            this.setState({
                showSelectError : true
            })
        }
    }

    setOption(action) {
        if (action.alias == "SPY_SIGNAL") {
            this.setState({
                players: [this.state.firstResult],
                action: action,
                showVotables: true,
                submittedText: "Thank you! See the votes/actions below!"
            })
        } else {
            this.setState({
                action: action,
                showVotables: true
            });
        }
    }

    selectChoices(player) {
        if (!this.state.action.multi_select || !this.state.choices.length) {
            this.setState({
                choices: [player],
                showSubmit: true,
            })
        } else {
            let choices = this.state.choices;
            let showSubmit = false;
            if (choices.length) {
                // check if the player's already exists in the choices array, if so, remove it.
                let found_index = null;
                for (let i = 0; i < choices.length; i++) {
                    if (choices[i].id === player.id) {
                        found_index = i;
                    }
                }
                if (found_index !== null) {
                    choices.splice(found_index, 1);
                } else { // add it
                    choices.push(player);
                }

                if (choices.length) {
                    showSubmit = true;
                }

                this.setState({
                    choices: choices,
                    showSubmit: showSubmit,
                })
            }
        }
    }

    submitChoice() {
        this.setState({
            submittingText: "Sending..."
        })

        let payload = {
            voter_id : this.state.firstResult.id,
            action_type: this.state.action.alias,
            choices: this.state.choices
        };

        axios.post('/api/submit_action/'+this.props.game_id+'/'+this.props.round_id, payload).then(response => {
            this.setState({
                submitted: true,
                submittingText: "Sent!",
                disableSubmit: true
            });
        })

        if (this.state.action.alias == "SPY_SIGNAL") {
            this.doSpyStuff();
        }
    }

    doSpyStuff() {
        let payload = {
            game_id: this.props.game_id,
            round_id: this.props.round_id,
            voter : this.state.firstResult,
        }

        axios.post('/api/get_spy_data/', payload).then(response => {
            this.setState({
                showSpyData: true,
                submittedText: "Thanks for the signal, All accusation actions are below. Sparing hit the Refresh Button to update!",
                spyData: response.data
            })
        })
    }

    render() {
        let initialHeading = <h4>Who are you?</h4>;
        let initialCheck = this.state.players.map((player, index) =>
            <button key={index} onClick={() => this.completeInitial(index)}>{player.name}</button>
        )

        let doubleHeading = <h4>Type it (with Capitals) to confirm!</h4>
        let doubleCheck = <input
                            value={this.enteredName}
                            onChange={this.updateName}
                            ></input>;
        let nameSubmit = <button onClick={this.completeDouble}>Confirm!</button>;

        // We'll populate this further when we get to the two moon stuff!
        let optionHeading = <h4>Hi, {this.state.enteredName}! What action will you take?</h4>
        let options = <p>Your Options:
            {this.state.myActionOptions.map((option, index) =>
                <button key={index} onClick={() => this.setOption(option)}>
                    {option.description}
                </button>
            )}
        </p>;

        let votingHeading = <h4> Who receives your {this.state.action.description}?</h4>

        let nominees = this.state.players.filter(player => {return player.isNominee});

        let votables = nominees.map((player, index) =>
            <button key={index} onClick={() => this.selectChoices(player)}>
                {player.name}
            </button>
        )

        let submitButton = <button
                            onClick={this.submitChoice}
                            disabled={this.state.disableSubmit}
                           >
                            {this.state.submittingText}
                        </button>

        let spyTable = null;
        if (this.state.spyData.length) {
            spyTable = <table>
                <thead>
                    <tr>
                        <td>Player</td>
                        <td>Chose</td>
                        <td>Type</td>
                    </tr>
                </thead>
                <tbody>
                    {this.state.spyData.map((result, index) =>
                        <tr key={index}>
                            <td>{result.voter}</td>
                            <td>{result.chose}</td>
                            <td>{result.type}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        }

        if (this.state.showIneligibleScreen) {
            return <p>Thanks for selecting, you can't vote/signal in this round! </p>
        }

        if (this.state.submitted) {
            return <div>
                <p>{this.state.submittedText}</p>
                {!this.state.showSpyData ? null :
                    spyTable
                }
                {!this.state.showSpyData ? null :
                    <button onClick={this.doSpyStuff}>Refresh</button>
                }
            </div>
        }

        return (
            <div className="container">
                {this.state.showInitialCheck ? initialHeading : null}
                {this.state.showInitialCheck ? initialCheck : null}
                {this.state.showDoubleCheck ? doubleHeading : null}
                {this.state.showDoubleCheck ? doubleCheck : null}
                {this.state.showDoubleCheck && this.state.enteredName.length > 2 ? nameSubmit : null}
                {!this.state.showSelectError ? null : <p style={{color:"red"}}>The name you have entered doesn't match!</p> }
                {this.state.showOptions ? optionHeading : null}
                {this.state.showOptions ? options : null}
                {this.state.showVotables ? votingHeading : null}
                {this.state.showVotables ? votables : null}
                {this.state.showSubmit ? <br/> : null}
                {this.state.showSubmit ? submitButton : null}
            </div>
        );
    }
}

export default PlayerView;

if (document.getElementById('voting')) {
    const element = document.getElementById('voting')
    const props = Object.assign({}, element.dataset)
    ReactDOM.render(<PlayerView {...props}/>, document.getElementById('voting'));
}
