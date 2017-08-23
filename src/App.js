import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">

          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>

          <a href="https://slack.com/oauth/authorize?scope=identity.basic,identity.team,identity.avatar&client_id=134879189280.222167489812"><img alt="Sign in with Slack" height="40" width="172" src="https://platform.slack-edge.com/img/sign_in_with_slack.png" srcset="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x" /></a>

          </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload. brah!
        </p>
      </div>
    );
  }
}

export default App;
