import React, {Component} from 'react';
import './App.css';
import logo from './infight.svg'

let jwtDecode = require('jwt-decode');

class App extends Component {
    constructor(props) {
        super(props);

        let initialState = {
            mustAddToSlack: false
        };

        this.state = this.checkLogin(initialState);
        this.logOut = this.logOut.bind(this);
    }

    render() {
        return (
            <div className="container">
                <div className="row App-header">
                    <div className="col"><img src={logo} className="HeaderLogo" alt="infight"/> infight</div>
                    <div className="col">
                        {this.identityUI()}
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        {this.teamUI()}
                    </div>
                </div>
            </div>

        );
    }

    getBaseUrl() {
        return new URL(window.location.href).origin;
    }

    checkLogin(initialState) {
        let url = new URL(window.location.href);
        let cookieValue = url.searchParams.get("cookie");
        if (cookieValue) {
            localStorage.setItem('infight_jwt', cookieValue);
            window.location.href = this.getBaseUrl();
        }

        let userDetails = null;
        if (localStorage.getItem('infight_jwt')) {

            userDetails = jwtDecode(localStorage.getItem('infight_jwt'));
            console.log(userDetails);
        }

        initialState['loggedIn'] = localStorage.getItem('infight_jwt') !== null;
        initialState['user'] = userDetails;

        if (userDetails !== null){
            let app = this;
            if (!localStorage.getItem('foundTeam')) {
                fetch(App.getApiBase() + "/" + userDetails.team_domain + "/exists", {
                    headers: {'Authorization': 'Basic ' + localStorage.getItem('infight_jwt')}
                })
                    .then(response => {
                        console.log(response);
                        if (response.ok) {
                            response.json().then(foundTeam => {
                                app.setState({mustAddToSlack: !foundTeam});
                                if (foundTeam) {
                                    localStorage.setItem('foundTeam', true)
                                }
                            });
                        }
                    });
            }
        }

        return initialState;
    }


    logOut() {
        localStorage.removeItem('infight_jwt');
        localStorage.removeItem('foundTeam');
        this.setState({loggedIn: false});
    }

    teamUI() {
        if (this.state.mustAddToSlack) {
            return (
                <div className="alert alert-info alert-dismissible fade show" role="alert">
                    <strong>You're the first one here!</strong> We need to install infight into your slack team.

                    <a href={"https://slack.com/oauth/authorize?scope=incoming-webhook,commands,bot&client_id=134879189280.222167489812&redirect_uri=" + encodeURIComponent(App.getApiBase() + '/install')}>
                        <img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png"
                             srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />
                    </a>
                </div>
            )
        }
    }

    identityUI() {

        if (this.state.loggedIn) {
            return (
                <div className="float-right">
                    <div>
                        <img className="User-header-img" src={this.state.user.user_img} alt={this.state.user.user_name}/>
                        <span>{this.state.user.user_name}</span>
                        <span className="HeaderTeamName">{this.state.user.team_domain}</span>
                        <a onClick={this.logOut} className="AppLogOut">Log Out</a>
                    </div>
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

    static getApiBase() {
        return "http://localhost:8000"
    }
}

export default App;
