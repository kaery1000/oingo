import React, { Component } from 'react';
import { Grid, Loader, Dimmer, Form, Icon, Input, Message, Button, Dropdown } from 'semantic-ui-react';
import config from '../config';
import { tagOptions, dayOptions, frequencyOptions } from '../utils';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const poolData = {
  UserPoolId: config.cognito.userPoolId,
  ClientId: config.cognito.clientId
};

class AddFilter extends Component {
  state = {
    msg: '',
    errorMessage: '',
    loadingData: false,
    coords: '',
    loggedin: false,
    sessionPayload: '',
    day: '',
    frequency: '',
    visibility: '',
    latitude: '',
    longitude: '',
    startTime: new Date(),
    endTime: new Date(),
    radius: '',
  }

  async componentDidMount() {
    this.setState({ loadingData: true });
    document.title = "Oingo | Add Filter";
    this.sessionPayload();
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

  onSubmit = () => {
    this.setState({ loadingData: true });
    console.log(this.state.startTime);
    console.log(this.state.frequency);
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
              <Form.Field width={6}>
                <label>Note Tag</label>
                <Dropdown placeholder='Choose Tag' value={this.state.tag} options={tagOptions} search selection onChange={(k, { value }) => this.setState({ tag: value })} />
              </Form.Field>
              <Form.Group inline>
                <label>Notes From?</label>
                <Form.Radio label='Everyone' value='everyone' checked={this.state.visibility === 'everyone'} onChange={(e, { value }) => this.setState({ visibility: value })} />
                <Form.Radio label='Friends' value='friends' checked={this.state.visibility === 'friends'} onChange={(e, { value }) => this.setState({ visibility: value })} />
                <Form.Radio label='Private' value='private' checked={this.state.visibility === 'private'} onChange={(e, { value }) => this.setState({ visibility: value })} />
              </Form.Group>
              <Form.Group inline>
                <Form.Field width={5}>
                  <label>Frequency</label>
                  <Dropdown placeholder='Frequency' disabled={this.state.day === 'every'}
                    value={this.state.day === 'every' ? 'every' : this.state.frequency}
                    options={frequencyOptions} search selection onChange={(k, { value }) => this.setState({ frequency: value })} />
                </Form.Field>
                <Form.Field width={5}>
                  <label>On Day(s)</label>
                  <Dropdown placeholder='Day' value={this.state.day} options={dayOptions} search selection onChange={(k, { value }) => this.setState({ day: value })} />
                </Form.Field>
              </Form.Group>
              <Form.Group inline>
                <Form.Field>
                  <label>Start Time</label>
                  <DatePicker
                    selected={this.state.startTime}
                    onChange={event => this.setState({ startTime: event })}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={30}
                    dateFormat="hh:mm aa"
                    timeCaption="Time"
                  />
                </Form.Field>
                <Form.Field>
                  <label>End Time</label>
                  <DatePicker
                    selected={this.state.endTime}
                    onChange={event => this.setState({ endTime: event })}
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={30}
                    dateFormat="hh:mm aa"
                    timeCaption="Time"
                  />
                </Form.Field>
              </Form.Group>
              <Form.Group inline>
                <Form.Field width={5}>
                  <label>Latitude</label>
                  <Input onChange={event => this.setState({ latitude: event.target.value })} ></Input>
                </Form.Field>
                <Form.Field width={5}>
                  <label>Longitude</label>
                  <Input onChange={event => this.setState({ longitude: event.target.value })} ></Input>
                </Form.Field>
              </Form.Group>
              <Form.Field width={5}>
                <label>Location Radius</label>
                <Input placeholder="in meters" onChange={event => this.setState({ radius: event.target.value })} ></Input>
              </Form.Field>
              <Button floated='left' primary basic loading={this.state.loading}>
                <Icon name='sign-in' />Add
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

export default AddFilter;