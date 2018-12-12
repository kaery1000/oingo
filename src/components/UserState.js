import React, { Component } from 'react';
import { Grid, Loader, Dimmer, Button, Form, Input, Icon, Message } from 'semantic-ui-react';
import { awsSigning } from '../utils';
import config from '../config';

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const poolData = {
  UserPoolId: config.cognito.userPoolId,
  ClientId: config.cognito.clientId
};

class UserState extends Component {
  state = {
    loadingData: false,
    loading: false,
    errorMessage: '',
    msg: '',
    loggedin: false,
    sessionPayload: '',
    userState: '',
  }

  async componentDidMount() {
    this.setState({ loadingData: true });
    document.title = "Oingo | User State";

    let session = '', loggedin = false;
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
    if (cognitoUser != null) {
      loggedin = true;
      cognitoUser.getSession((err, result) => {
        if (err) {
          alert(err);
          return;
        }
        session = result;
      });
    }

    if (loggedin) {
      let rdsRequest = {
        'retrieve': 'getState',
        'uID': session.idToken.payload.sub
      }

      let res = await awsSigning(rdsRequest, 'v1/oingordsaction');
      if ('body' in res.data && !!res.data.body) {
        this.setState({ userState: res.data.body });
      }
    }

    this.setState({ sessionPayload: session, loggedin, loadingData: false });
  }

  onSubmit = async () => {
    this.setState({ errorMessage: '', loading: true, msg: '' });
    let rdsRequest = {
      'action': 'addState',
      'uID': this.state.sessionPayload.idToken.payload.sub,
      'userState': this.state.userState
    }

    let res = await awsSigning(rdsRequest, 'v1/oingordsaction');
    this.setState({ loading: false, msg: "State updated!" });
  }

  render() {
    if (this.state.loadingData) {
      return (
        <Dimmer active inverted>
          <Loader size='massive'>Loading...</Loader>
        </Dimmer>
      );
    }


    let statusMessage;

    if (this.state.msg === '') {
      statusMessage = null;
    } else {
      statusMessage = (
        <Message positive>
          <Message.Header>Success!</Message.Header>
          {this.state.msg}
        </Message>
      );
    }

    return (
      <div>
        <h2>User State</h2>
        {this.state.loggedin === false &&
          <h3>Please Login!</h3>
        }

        {this.state.loggedin === true &&
          <Grid stackable>
            <Grid.Column>
              <h4>Existing State: {this.state.userState === '' ? 'No state set!' : this.state.userState}</h4>
              <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                <Form.Group>
                  <Form.Field width={8}>
                    <label>Update State</label>
                    <Input onChange={event => this.setState({ userState: event.target.value })} ></Input>
                  </Form.Field>
                </Form.Group>
                <Button floated='left' primary basic loading={this.state.loading}>
                  <Icon name='sign-in' />Set
              </Button><br /><br />
                <Message error header="Oops!" content={this.state.errorMessage} />
                {statusMessage}
              </Form>
            </Grid.Column>
          </Grid>
        }
      </div>
    );
  }
}

export default UserState;