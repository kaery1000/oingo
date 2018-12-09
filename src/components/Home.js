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
                <Button.Group>
                  <Link to='/oingo/user_details'><Button>Profile</Button></Link>
                </Button.Group><br /><br />
                <Button.Group>
                  <Link to='/oingo/add_note'><Button>Add Note</Button></Link>
                  <Link to='/oingo/add_filter'><Button>Add Filter</Button></Link>
                  <Link to='/oingo/user_friends'><Button>Friends</Button></Link>
                </Button.Group>
                <br /><br /><br />
              </Card.Description>
            </Card.Content>
          </Card>
        </Grid>
      </div>
    );
  }
}

export default Home;