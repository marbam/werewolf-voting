import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './PlayerView.css';

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
            submittedText: <div>
                <p>Your feedback has been received! You can now close the window and get back to the game.</p>
                <p>(If you've refreshed and voted again, your initial vote has been overridden. Please let the mod know you've updated your choice)</p>
            </div>,
            disableSubmit: false,
            spyData: [],
            showSpyData: false
        };
        this.updateName = this.updateName.bind(this);
        this.completeDouble = this.completeDouble.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.setOption = this.setOption.bind(this);
        this.submitChoice = this.submitChoice.bind(this);
        this.doSpyStuff = this.doSpyStuff.bind(this);
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyDown);
        let payload = {
            game_id: this.props.game_id,
            round_id: this.props.round_id
        }

        axios.post('/api/get_accusable', payload).then(response => {
            this.setState({
              players: response.data
            })
        })
    }

    handleKeyDown(event) {
        if (event.keyCode == 13) {
            if (this.state.showDoubleCheck && this.state.enteredName.length >= 2) {
                this.completeDouble()
            }
        }
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this._handleKeyDown);
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

        if (action.alias != "SPY_SIGNAL" && action.alias != "LAWYER_SIGNAL") {
            this.setState({
                action: action,
                showVotables: true,
                choices: [],
                showSubmit: false
            });
        } else if (action.alias == "SPY_SIGNAL") {
            this.setState({
                players: [this.state.firstResult],
                action: action,
                showVotables: true,
                submittedText: <div><p>Thank you! See the votes/actions below!</p></div>,
                choices: [],
                showSubmit: false
            })
        } else if (action.alias == "LAWYER_SIGNAL") {

            let myId = this.state.firstResult.id;
            let noLawyer = this.state.players.filter(player => {return player.id != myId});

            this.setState({
                players: noLawyer,
                action: action,
                showVotables: true,
                choices: [],
                showSubmit: false
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
                submittedText: <div>
                    <p>Thanks for the signal, All accusation actions are below</p>
                    <p>Sparing hit the Refresh Button to update!</p>
                </div>,
                spyData: response.data
            })
        })
    }

    render() {
        let initialHeading = <h4>Who are you?</h4>
        let initialCheck = this.state.players.map((player, index) =>
            <button className="btn btn-dark right-marg"
                    key={index}
                    onClick={() => this.completeInitial(index)}
            >
                {player.name}
            </button>
        )

        let doubleHeading = <h4 className="top-marg">
            Great! Please type your name exactly as it appears in the button to check it's you!
        </h4>
        let doubleCheck = <input
                            value={this.enteredName}
                            onChange={this.updateName}
                            ></input>;
        let nameSubmit = <button
                            className="btn btn-primary left-marg"
                            onClick={this.completeDouble}>Confirm!
                        </button>;

        // We'll populate this further when we get to the two moon stuff!
        let optionHeading = <h4>Hi, {this.state.enteredName}! What action will you take?</h4>
        let options = <p><span className="shift-right">Your Options:</span>
            {this.state.myActionOptions.map((option, index) =>
                <button
                    className="btn btn-dark right-marg"
                    key={index}
                    onClick={() => this.setOption(option)}
                >
                    {option.description}
                </button>
            )}
        </p>;

        let votingHeading = <h4> Who receives your {this.state.action.description}?</h4>

        let nominees = this.state.players.filter(player => {return player.isNominee});

        let votables = nominees.map((player, index) =>
            <button
                className="btn btn-secondary left-marg"
                key={index}
                onClick={() => this.selectChoices(player)}
            >
                {player.name}
            </button>
        )

        let choiceListing = this.state.choices.map((player, index) =>
            <li>{player.name}</li>
        )

        let submitButton = <button
                            className="btn btn-primary left-marg"
                            onClick={this.submitChoice}
                            disabled={this.state.disableSubmit}
                           >
                            {this.state.submittingText}
                        </button>

        let spyTable = null;
        if (this.state.spyData.length) {
            spyTable = <table className="table">
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
                {this.state.submittedText}
                {!this.state.showSpyData ? null :
                    spyTable
                }
                {!this.state.showSpyData ? null :
                    <button
                        className="btn btn-primary"
                        onClick={this.doSpyStuff}
                    >
                        Refresh
                    </button>
                }
            </div>
        }

        return (
            <div className="container">
                {this.state.showInitialCheck ? initialHeading : null}
                {this.state.showInitialCheck ? initialCheck : null}
                {this.state.showDoubleCheck ? doubleHeading : null}
                {this.state.showDoubleCheck ? doubleCheck : null}
                {this.state.showDoubleCheck && this.state.enteredName.length >= 2 ? nameSubmit : null}
                {!this.state.showSelectError ? null : <p style={{color:"red"}}>The name you have entered doesn't match!</p> }
                {this.state.showOptions ? optionHeading : null}
                {this.state.showOptions ? options : null}
                {this.state.showVotables ? votingHeading : null}
                {this.state.showVotables ? votables : null}
                {this.state.choices.length ? <h4 className="top-marg">You have selected:</h4> : null}
                {this.state.choices.length ? choiceListing : null}
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
