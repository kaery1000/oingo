import React, { Component } from 'react';
import { Grid, Loader, Dimmer, Table } from 'semantic-ui-react';
import { awsSigning } from '../utils';
import config from '../config';

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const poolData = {
  UserPoolId: config.cognito.userPoolId,
  ClientId: config.cognito.clientId
};

class FilterList extends Component {
  state = {
    loadingData: false,
    loading: false,
    errorMessage: '',
    msg: '',
    loggedin: false,
    sessionPayload: '',
    filters: [],
  }

  async componentDidMount() {
    this.setState({ loadingData: true });
    document.title = "Oingo | Filter List";

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
        'retrieve': 'getFilters',
        'uID': session.idToken.payload.sub
      }

      let res = await awsSigning(rdsRequest, 'v1/oingordsaction');
      if (Array.isArray(res.data.body)) {
        this.setState({ filters: res.data.body });
      }
    }

    this.setState({ sessionPayload: session, loggedin, loadingData: false });
  }

  renderFilters() {
    let items;
    items = this.state.filters.map((filter, id) => {
      return (
        <Table.Row key={id}>
          <Table.Cell>{filter[2]}</Table.Cell>
          <Table.Cell>{filter[3]}</Table.Cell>
          <Table.Cell>{filter[4]}</Table.Cell>
          <Table.Cell>{filter[5]}</Table.Cell>
          <Table.Cell>{filter[6]}</Table.Cell>
          <Table.Cell>{filter[7]}</Table.Cell>
          <Table.Cell>{filter[8]}</Table.Cell>
          <Table.Cell>{filter[9]}</Table.Cell>
          <Table.Cell>{filter[10]}</Table.Cell>
        </Table.Row>
      );
    });

    return (
      <Table celled padded unstackable striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Note Tag</Table.HeaderCell>
            <Table.HeaderCell>State</Table.HeaderCell>
            <Table.HeaderCell>Visibility</Table.HeaderCell>
            <Table.HeaderCell>Latitude</Table.HeaderCell>
            <Table.HeaderCell>Longitude</Table.HeaderCell>
            <Table.HeaderCell>Radius</Table.HeaderCell>
            <Table.HeaderCell>Start Time</Table.HeaderCell>
            <Table.HeaderCell>End Time</Table.HeaderCell>
            <Table.HeaderCell>Day</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {items}
        </Table.Body>
      </Table>
    );
  }

  render() {
    if (this.state.loadingData) {
      return (
        <Dimmer active inverted>
          <Loader size='massive'>Loading...</Loader>
        </Dimmer>
      );
    }

    return (
      <div>
        <h2>Filter List</h2>
        {this.state.loggedin === false && <h3>Please Login!</h3>}

        {this.state.loggedin === true &&
          <Grid stackable>
            <Grid.Column>
              {this.state.filters.length > 0 && this.renderFilters()}
              {this.state.filters.length === 0 && <h3>No Filters Set!</h3>}
            </Grid.Column>
          </Grid>
        }
      </div>
    );
  }
}

export default FilterList;