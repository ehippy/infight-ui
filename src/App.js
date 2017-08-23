import React, {Component} from 'react';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loggedIn: localStorage.getItem('infight_jwt') !== undefined
        };

        let url = new URL(window.location.href);
        let c = url.searchParams.get("cookie");
        console.log(c);

        if (c) {
            localStorage.setItem('infight_jwt', c);
            window.location.href = url.origin;
        }
        this.logOut = this.logOut.bind(this);

    }

    render() {
        return (
            <div className="container">
                <div className="row App-header">
                    <div className="col">infight</div>
                    <div className="col">
                        {this.identityUI()}
                    </div>
                </div>
                <p className="App-intro">
                    To get started, edit <code>src/App.js</code> and save to reload. brah!
                </p>
            </div>

        );
    }

    logOut() {
        localStorage.removeItem('infight_jwt');
        this.setState({loggedIn: false});
    }

    identityUI() {

        if (this.state.loggedIn) {
            return (
                <div>
                    <div>U R LOGGED</div>
                    <a onClick={this.logOut}>Log Out</a>
                </div>
            )
        } else {
            return (
                <a href="https://slack.com/oauth/authorize?scope=identity.basic,identity.team,identity.avatar&client_id=134879189280.222167489812"
                   className="float-right">
                    <img alt="Sign in with Slack" height="40" width="172"
                         src="https://platform.slack-edge.com/img/sign_in_with_slack.png"
                         srcSet="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x"/>
                </a>
            )
        }

    }
}

export default App;
