import React, { Component } from 'react';
import { Grid, Loader, Dimmer, Card, Message } from 'semantic-ui-react';
import { awsSigning } from '../utils';
import config from '../config';

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const poolData = {
  UserPoolId: config.cognito.userPoolId,
  ClientId: config.cognito.clientId
};

class PersonalNotes extends Component {
  state = {
    loadingData: false,
    loading: false,
    errorMessage: '',
    msg: '',
    loggedin: false,
    sessionPayload: '',
    notes: [],
  }

  async componentDidMount() {
    this.setState({ loadingData: true });
    document.title = "Oingo | Personal Notes";

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

    }

    this.setState({ sessionPayload: session, loggedin, loadingData: false });
  }

  onSubmit = async (event) => {
    this.setState({ errorMessage: '', loading: true, msg: '' });

    this.setState({ loading: false });
  }

  renderNotes() {
    let items;
    items = this.state.notes.map((note, id) => {
      return (
        <Card key={id}>
          <Card.Content>
            <Card.Description>Name: </Card.Description>
            <Card.Description>Email:</Card.Description>
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
        <h2>Personal Notes</h2>
        {this.state.loggedin === false &&
          <h3>Please Login!</h3>
        }

        {this.state.loggedin === true &&
          <Grid stackable>
            <Grid.Column>
              {this.state.notes.length > 0 && this.renderNotes()}
              {this.state.notes.length === 0 && <h3>No Personal Notes!</h3>}
            </Grid.Column>
          </Grid>
        }
      </div>
    );
  }
}

export default PersonalNotes;