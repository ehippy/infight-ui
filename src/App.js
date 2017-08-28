import React, {Component} from 'react';
import './App.css';
import logo from './infight.svg'
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom'

let jwtDecode = require('jwt-decode');

class App extends Component {
    constructor(props) {
        super(props);

        let initialState = {
            mustAddToSlack: false
        };

        this.state = this.checkLogin(initialState);

        this.logOut = this.logOut.bind(this);
        this.startGame = this.startGame.bind(this);
    }

    siteHome = () => (
        <div className="col">
            <h2>Welcome to infight</h2>
        </div>
    );

    teamHome = ({match}) => (
        <div className="row">
            <div className="col">
                <h2>{match.params.team_domain}</h2>
                {this.teamUI()}
            </div>
        </div>
    );

    render() {
        return (
            <Router>
                <div className="container">
                    <div className="row App-header">
                        <div className="col">
                            <Link to="/"><img src={logo} className="HeaderLogo" alt="infight"/> infight</Link>
                        </div>
                        <div className="col">
                            {this.identityUI()}
                        </div>
                    </div>

                    <Route exact path="/" component={this.siteHome}/>
                    <Route path="/:team_domain" component={this.teamHome} />
                </div>
            </Router>

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
                this.authedApiCall("/" + userDetails.team_domain + "/exists", {}, (err, data)=>{
                    if (err) return;
                    app.setState({mustAddToSlack: !data});
                    if (data) {
                        //localStorage.setItem('foundTeam', true)
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

    startGame() {
        let app = this;
        this.authedApiCall("/" + app.state.user.team_domain + "/game", {method:'POST'}, (err, data)=>{
            if (err) {return alert('it broke')}
            console.log(data);
        })
    }

    authedApiCall(path, fetchOptions = {}, callback) {
        if (typeof fetchOptions.headers !== "object") {
            fetchOptions.headers = {}
        }
        fetchOptions.headers.Authorization  ='Basic ' + localStorage.getItem('infight_jwt');

        fetch(App.getApiBase() + path, fetchOptions)
            .then(response => {
                console.log(response);
                if (response.ok) {
                    response.json().then(response => {
                         callback(null, response);
                    });
                } else {
                    callback("Bad Response", response)
                }
            });
    }

    teamUI() {
        if (this.state.mustAddToSlack) {
            return (
                <div className="alert alert-info alert-dismissible fade show" role="alert">
                    <strong>You're the first one here!</strong> We need to install infight into your slack team.

                    <a href={"https://slack.com/oauth/authorize?scope=incoming-webhook,commands,bot&client_id=134879189280.222167489812&redirect_uri=" + encodeURIComponent(App.getApiBase() + '/install')}>
                        <img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png"
                             srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />
                    </a>
                </div>
            )
        } else {
            return (
                <a onClick={this.startGame}>Start a game</a>
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
                        <Link className="HeaderTeamName" to={'/'+this.state.user.team_domain}>{this.state.user.team_domain}</Link>
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
