import React, { Component } from 'react';
import { Grid, Loader, Dimmer, Form, Icon, Input, Message, Button, Dropdown } from 'semantic-ui-react';
import config from '../config';
import { tagOptions, dayOptions, awsSigning } from '../utils';
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
    visibility: '',
    latitude: '',
    longitude: '',
    startTime: new Date(),
    endTime: '',
    radius: '',
    userState: '',
    useCurrent: false,
  }

  async componentDidMount() {
    let startTime = this.state.startTime;
    this.setState({ loadingData: true, endTime: new Date(startTime.getTime() + 60 * 60000) });
    document.title = "Oingo | Add Filter";
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
    this.setState({ loadingData: true, errorMessage: '' });
    if (this.state.endTime.getHours() <= this.state.startTime.getHours()) {
      this.setState({ errorMessage: "End Time must be > Start Time!" });
    } else {
      let rdsRequest = {
        'action': "addFilter",
        'uID': this.state.sessionPayload.sub,
        'fVisible': this.state.visibility,
        'uState': this.state.userState,
        'day': this.state.day,
        'startTime': this.state.startTime.getHours(),
        'endTime': this.state.endTime.getHours(),
        'nTag': this.state.tag,
        'fRadius': this.state.radius,
      }

      if (this.state.useCurrent) {
        rdsRequest['fLat'] = this.state.coords.latitude;
        rdsRequest['fLong'] = this.state.coords.longitude;
      } else {
        rdsRequest['fLat'] = this.state.latitude;
        rdsRequest['fLong'] = this.state.longitude;
      }

      let res = await awsSigning(rdsRequest, 'v1/oingordsaction');
      if ('body' in res.data && res.data.body === true) {
        this.setState({ msg: "Filter Added Successfully!" });
      }
    }
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
                    timeIntervals={60}
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
                    timeIntervals={60}
                    dateFormat="hh:mm aa"
                    timeCaption="Time"
                  />
                </Form.Field>
              </Form.Group>
              <Form.Group inline>
                <Form.Field width={5}>
                  <label>Latitude</label>
                  <Input value={this.state.useCurrent ? this.state.coords.latitude : this.state.latitude} onChange={event => this.setState({ latitude: event.target.value })} ></Input>
                </Form.Field>
                <Form.Field width={5}>
                  <label>Longitude</label>
                  <Input value={this.state.useCurrent ? this.state.coords.longitude : this.state.longitude} onChange={event => this.setState({ longitude: event.target.value })} ></Input>
                </Form.Field>
                <Button floated='left' primary basic onClick={() => this.setState({ useCurrent: true })} >
                  <Icon name='location arrow' />Use Current Location
                </Button>
              </Form.Group>
              <Form.Group inline>
                <Form.Field width={5}>
                  <label>Location Radius</label>
                  <Input placeholder="in meters" onChange={event => this.setState({ radius: event.target.value })} ></Input>
                </Form.Field>
                <Form.Field width={5}>
                  <label>User State</label>
                  <Input onChange={event => this.setState({ userState: event.target.value })} ></Input>
                </Form.Field>
              </Form.Group>
              <Button floated='left' primary basic loading={this.state.loading}>
                <Icon name='sign-in' />Add
              </Button> <br /> <br />
              <Message error header="Oops!" content={this.state.errorMessage} />
              {statusMessage}
            </Form>
          }
        </Grid.Column>
      </Grid >
    );
  }
}

export default AddFilter;