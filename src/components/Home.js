import React, { Component } from 'react';
import { Grid, Loader, Dimmer, Card, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

class Home extends Component {
  state = {
    errorMessage: '',
    loadingData: false,
    coords: '',
  }

  async componentDidMount() {
    this.setState({ loadingData: true });
    document.title = "Oingo";

    this.getLocation();

    this.setState({ loadingData: false });
  }

  getLocation = () => {
    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    let success = (pos) => {
      this.setState({ coords: pos.coords });
      console.log(pos.coords);
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
        <h1></h1>
        <Grid centered stackable><br /><br /><br />
          <Card fluid color='green'>
            <Card.Content>
              <br /><br />
              <Card.Header><h1>Hi There!</h1></Card.Header>
              <Card.Description>
                <br /><br />
                <Link to='/'><Button primary>Button</Button></Link>
                <br /><br /><br />
                Latitude: {this.state.coords.latitude}<br />
                Longitude: {this.state.coords.longitude}
                {this.state.errorMessage && <div style={{ color: "#cc0000" }}>{this.state.errorMessage}</div>}
              </Card.Description>
            </Card.Content>
          </Card>
        </Grid>
      </div>
    );
  }
}

export default Home;