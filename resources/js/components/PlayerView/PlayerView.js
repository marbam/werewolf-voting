import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class PlayerView extends Component {
    constructor() {
        super();
        this.state = {
            players: [
                {id: 1, name: 'Martin', roleId: 1},
            ],
            showInitialCheck: true,
            firstResult: null,
            showDoubleCheck: false,
            enteredName: '',
            showError: false,
            showOptions: false,
            action: '',
            showVotables: false,
            choices: [],
            showSubmit: false
        };
        this.updateName = this.updateName.bind(this);
        this.completeDouble = this.completeDouble.bind(this);
        this.setOption = this.setOption.bind(this);

    }

    componentDidMount() {
        let gameId = 1; // testing
        let voteId = 1;
        let type = 'accusations';
        axios.get('/api/get_accusable/'+gameId+'/vote/'+voteId+'/'+type).then(response => {
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
            this.setState({
                showError: false,
                showInitialCheck: false,
                showDoubleCheck: false,
                showOptions:true
            });
        } else {
            this.setState({
                showError : true
            })
        }
    }

    setOption(type) {
        this.setState({
            action: type,
            showVotables: true
        });
    }

    selectChoices(index) {
        this.setState({
            choices: [this.state.players[index]],
            showSubmit: true
        })
    }

    submitChoice() {
        alert('submitted');
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
            <button
                onClick={() => this.setOption('vote')}
            >
                Vote
            </button>
        </p>;

        let votingHeading = <h4> Who receives your {this.state.action}?</h4>
        let votables = this.state.players.map((player, index) =>
            <button key={index} onClick={() => this.selectChoices(index)}>
                {player.name}
            </button>
        )

        let submitButton = <button onClick={this.submitChoice}>Submit to Mod!</button>

        return (
            <div className="container">
                {this.state.showInitialCheck ? initialHeading : null}
                {this.state.showInitialCheck ? initialCheck : null}
                {this.state.showDoubleCheck ? doubleHeading : null}
                {this.state.showDoubleCheck ? doubleCheck : null}
                {this.state.showDoubleCheck && this.state.enteredName.length > 2 ? nameSubmit : null}
                {!this.state.showError ? null : <p style={{color:"red"}}>The name you have entered doesn't match!</p> }
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
    ReactDOM.render(<PlayerView />, document.getElementById('voting'));
}