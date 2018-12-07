import React, { Component } from 'react';
import { Grid, Loader, Dimmer, Form, Icon, Input, Message, Button, Dropdown } from 'semantic-ui-react';
import config from '../config';
import { tagOptions, awsSigning } from '../utils';

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const poolData = {
  UserPoolId: config.cognito.userPoolId,
  ClientId: config.cognito.clientId
};

class AddNote extends Component {
  state = {
    msg: '',
    errorMessage: '',
    loadingData: false,
    coords: '',
    loggedin: false,
    sessionPayload: '',
    title: '',
    description: '',
    visibility: '',
    tag: '',
    radius: '',
  }

  async componentDidMount() {
    this.setState({ loadingData: true });
    document.title = "Oingo | Add Note";
    this.sessionPayload();
    this.getLocation();
    this.setState({ loadingData: false });
  }

  sessionPayload = () => {
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
    if (cognitoUser != null) {
      this.setState({ loggedin: true });
      cognitoUser.getSession((err, session) => {
        if (err) {
          alert(err);
          return;
        }
        this.setState({ sessionPayload: session.idToken.payload });
      });
    }
  }

  getLocation = () => {
    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    let success = (pos) => {
      this.setState({ coords: pos.coords });
    }

    let error = (err) => {
      this.setState({ errorMessage: err.message });
    }

    if (!window.navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    window.navigator.geolocation.getCurrentPosition(success, error, options);
  };

  onSubmit = async () => {
    this.setState({ loadingData: true });
    var d = new Date,
      dformat = [d.getMonth() + 1,
      d.getDate(),
      d.getFullYear()].join('/') + ' ' +
        [d.getHours(),
        d.getMinutes(),
        d.getSeconds()].join(':');

    let rdsRequest = {
      'action': "addNote",
      'uID': this.state.sessionPayload.sub,
      'nTitle': this.state.title,
      'nDesc': this.state.description,
      'nVisible': this.state.visibility,
      'nTag': this.state.tag,
      'nRadius': this.state.radius,
      'nLat': this.state.coords.latitude,
      'nLong': this.state.coords.longitude,
      'nTime': dformat
    }

    console.log(rdsRequest);
    //let res = await awsSigning(rdsRequest, 'v1/oingordsaction');
    //this.setState({ msg: res.data.body, loadingData: false });
    this.setState({ loadingData: false });
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
      <Grid stackable>
        <Grid.Column>
          {this.state.loggedin === false &&
            <h3>Please Login!</h3>
          }

          {this.state.loggedin === true &&
            <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
              <Form.Field width={12}>
                <label>Note Title</label>
                <Input onChange={event => this.setState({ title: event.target.value })} ></Input>
              </Form.Field>
              <Form.Field width={12}>
                <Form.TextArea value={this.state.description} label="Note Description" onChange={description => this.setState({ description: description.target.value })} />
              </Form.Field>
              <Form.Group inline>
                <label>Visibile To?</label>
                <Form.Radio label='Everyone' value='everyone' checked={this.state.visibility === 'everyone'} onChange={(e, { value }) => this.setState({ visibility: value })} />
                <Form.Radio label='Friends' value='friends' checked={this.state.visibility === 'friends'} onChange={(e, { value }) => this.setState({ visibility: value })} />
                <Form.Radio label='Private' value='private' checked={this.state.visibility === 'private'} onChange={(e, { value }) => this.setState({ visibility: value })} />
              </Form.Group>
              <Form.Group inline>
                <Form.Field width={5}>
                  <label>Note Tag</label>
                  <Dropdown placeholder='Choose Tag' value={this.state.tag} options={tagOptions} search selection onChange={(k, { value }) => this.setState({ tag: value })} />
                </Form.Field>
                <Form.Field width={5}>
                  <label>Note Radius</label>
                  <Input placeholder="in meters" onChange={event => this.setState({ radius: event.target.value })} ></Input>
                </Form.Field>
              </Form.Group>
              <Button floated='left' primary basic loading={this.state.loading}>
                <Icon name='sign-in' />Publish
              </Button>
              <Message error header="Oops!" content={this.state.errorMessage} />
              {statusMessage}
            </Form>
          }
        </Grid.Column>
      </Grid>
    );
  }
}

export default AddNote;