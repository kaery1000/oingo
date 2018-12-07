import React, { Component } from 'react';
import { Grid, Loader, Dimmer, Button, Form, Input, Icon, Message } from 'semantic-ui-react';
import { awsSigning } from '../utils';
import config from '../config';

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const poolData = {
  UserPoolId: config.cognito.userPoolId,
  ClientId: config.cognito.clientId
};

class UserDetails extends Component {
  state = {
    loadingData: false,
    loading: false,
    errorMessage: '',
    msg: '',
    loggedin: false,
    sessionPayload: '',
    reqResponse: '',
    FirstName: '',
    LastName: '',
    phone_number: '',
  }

  async componentDidMount() {
    this.setState({ loadingData: true });
    document.title = "Oingo | User Details";

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
        'retrieve': 'getUser',
        'uID': session.idToken.payload.sub
      }

      let res = await awsSigning(rdsRequest, 'v1/oingordsaction');
      this.setState({ reqResponse: res.data.body });
    }

    this.setState({ sessionPayload: session, loggedin, loadingData: false });
  }

  onSubmit = async (event) => {
    event.preventDefault();
    this.setState({ errorMessage: '', loading: true, msg: '' });
    let rdsRequest = {
      'update': 'updateUser',
      'uID': this.state.sessionPayload.idToken.payload.sub,
      'FirstName': this.state.FirstName,
      'LastName': this.state.LastName,
      'phone_number': this.state.phone_number
    }

    let res = await awsSigning(rdsRequest, 'v1/oingordsaction');
    this.setState({ msg: res.data.body, loading: false });
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
        <h2>User Details</h2>
        {this.state.loggedin === false &&
          <h3>Please Login!</h3>
        }

        {this.state.loggedin === true &&
          <Grid stackable>
            <Grid.Column>
              Name: {this.state.reqResponse.name} <br />
              First name: {this.state.reqResponse.FirstName} <br />
              Last name: {this.state.reqResponse.LastName} <br />
              Email: {this.state.reqResponse.email} <br />
              Phone: {this.state.reqResponse.phone_number} <br />

              <h3>Update Details</h3>
              <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
                <Form.Group>
                  <Form.Field width={8}>
                    <label>First Name</label>
                    <Input onChange={event => this.setState({ FirstName: event.target.value })} ></Input>
                  </Form.Field>
                  <Form.Field width={8}>
                    <label>Last Name</label>
                    <Input onChange={event => this.setState({ LastName: event.target.value })} ></Input>
                  </Form.Field>

                  <Form.Field width={8}>
                    <label>Phone number</label>
                    <Input onChange={event => this.setState({ phone_number: event.target.value })} ></Input>
                  </Form.Field>
                </Form.Group>
                <Button floated='left' primary basic loading={this.state.loading}>
                  <Icon name='sign-in' />Update
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

export default UserDetails;