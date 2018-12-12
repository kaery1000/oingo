import React, { Component } from 'react';
import { Grid, Loader, Dimmer, Button, Form, Input, Icon, Message, Card } from 'semantic-ui-react';
import { awsSigning } from '../utils';
import config from '../config';

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const poolData = {
  UserPoolId: config.cognito.userPoolId,
  ClientId: config.cognito.clientId
};

class UserFriends extends Component {
  state = {
    loadingData: false,
    loading: false,
    errorMessage: '',
    msg: '',
    loggedin: false,
    sessionPayload: '',
    friends: [],
    pendingReq: [],
    friendEmail: '',
  }

  async componentDidMount() {
    this.setState({ loadingData: true });
    document.title = "Oingo | User Friends";

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
        'retrieve': 'getFriends',
        'uID': session.idToken.payload.sub
      }

      let res = await awsSigning(rdsRequest, 'v1/oingordsaction');
      if (Array.isArray(res.data.body)) {
        this.setState({ friends: res.data.body });
      }

      //////////////////////////////////
      let rdsPendingRequest = {
        'retrieve': 'getPendingRequests',
        'uID': session.idToken.payload.sub
      }

      let result = await awsSigning(rdsPendingRequest, 'v1/oingordsaction');
      if (typeof result.data.body !== 'string') {
        this.setState({ pendingReq: result.data.body });
      }
    }

    this.setState({ sessionPayload: session, loggedin, loadingData: false });
  }

  onSubmit = async (event) => {
    event.preventDefault();
    this.setState({ errorMessage: '', loading: true, msg: '' });
    let rdsRequest = {
      'action': 'sendFriendRequest',
      'uID': this.state.sessionPayload.idToken.payload.sub,
      'friendEmail': this.state.friendEmail
    }

    let res = await awsSigning(rdsRequest, 'v1/oingordsaction');
    if (res.data.body) {
      this.setState({ msg: "Friend Request sent!" });
    } else {
      this.setState({ errorMessage: "You're already friends or user doesn't exist!" });
    }
    this.setState({ loading: false });
  }

  acceptRequest = async (friendID) => {
    this.setState({ errorMessage: '', loading: true, msg: '' });

    let rdsRequest = {
      'action': 'acceptFriendRequest',
      'uID': this.state.sessionPayload.idToken.payload.sub,
      'friendID': friendID
    }

    let res = await awsSigning(rdsRequest, 'v1/oingordsaction');
    this.setState({ msg: res.data.body, loading: false });
  }

  renderPendingReq() {
    let items;
    items = this.state.pendingReq.map((req, id) => {
      return (
        <Card key={id}>
          <Card.Content>
            <Card.Description>Name: {req[1]}</Card.Description>
            <Card.Description>Email: {req[2]}</Card.Description>
            <Button onClick={() => this.acceptRequest(req[0])}>Accept</Button>
          </Card.Content>
        </Card>
      );
    });

    return <Card.Group>{items}</Card.Group>;
  }

  renderFriends() {
    let items;
    items = this.state.friends.map((friend, id) => {
      return (
        <Card key={id}>
          <Card.Content>
            <Card.Description>Name: {friend[1]}</Card.Description>
            <Card.Description>Email: {friend[2]}</Card.Description>
          </Card.Content>
        </Card>
      );
    });

    return <Card.Group>{items}</Card.Group>;
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
        <h2>Friends</h2>
        {this.state.loggedin === false &&
          <h3>Please Login!</h3>
        }

        {this.state.loggedin === true &&
          <Grid stackable>
            <Grid.Column>
              {this.state.friends.length > 0 && this.renderFriends()}
              {this.state.friends.length === 0 && <h3>No Friends!</h3>}

              {this.state.pendingReq.length > 0 &&
                <div>
                  <br /><h3>Pending Requests</h3>
                  {this.renderPendingReq()}
                </div>
              }
              {this.state.pendingReq.length === 0 && <h3>No Pending Requests!</h3>}

              <h3>Sent Friend Request</h3>
              <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                <Form.Field width={8}>
                  <label>Friend Email</label>
                  <Input onChange={event => this.setState({ friendEmail: event.target.value })} ></Input>
                </Form.Field>
                <Button floated='left' primary basic loading={this.state.loading}>
                  <Icon name='sign-in' />Add
              </Button>
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

export default UserFriends;