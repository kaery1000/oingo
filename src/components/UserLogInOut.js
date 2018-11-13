import React, { Component } from 'react';
import {Grid, Loader, Dimmer, Form, Button, Message, Input, Icon} from 'semantic-ui-react';
import config from '../config';

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const poolData = {
  UserPoolId: config.cognito.userPoolId,
  ClientId: config.cognito.clientId
};

class LogInOut extends Component {
  state = {
    loadingData:false,
    loading:false,
    errorMessage:'',
    msg:'',
    email:'',
    password:'',
    loggedin:false,
    userPool:'',
    cognitoUser:''
  }

  async componentDidMount(){
    this.setState({loadingData:true});
    document.title = "Oingo";

    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var cognitoUser = userPool.getCurrentUser();
    
    if (cognitoUser != null) {
      this.setState({loggedin:true});
      cognitoUser.getSession((err, session) => {
        if (err) {
          alert(err);
          return;
        }        
      });
    }
    this.setState({loadingData:false, cognitoUser, userPool});
  }

  onLogin = async () => {
    this.setState({errorMessage:''});

    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({Username:this.state.email, Password:this.state.password});

    var userData = {
      Username: this.state.email,
      Pool: this.state.userPool,
    };
    
    let msg = '';
    let errorMessage = '';
    
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function (result) {
        msg ="You're Logged In!";
      },
      
      onFailure: function(err) {
        errorMessage = err.message;
      },
    });

    const tmr = setInterval(() => {
      if (msg === '' && errorMessage === '') {
      }else{
        clearInterval(tmr);
        this.setState({msg,errorMessage});
      }
    }, 1000);
    
  }

  onLogout = async () => {
    this.setState({errorMessage:''});
    if (this.state.cognitoUser != null) {
      this.state.cognitoUser.signOut();
      this.setState({msg:"You've been logged out!"});
    }
  }

  render() {
    if(this.state.loadingData){
      return (
        <Dimmer active inverted>
          <Loader size='massive'>Loading...</Loader>
        </Dimmer>
      );
    }

    let statusMessage;

    if (this.state.msg === ''){
      statusMessage = null;
    }else{
      statusMessage = (
      <Message positive>
        <Message.Header>Success!</Message.Header>
        {this.state.msg}
      </Message>
      );
    }

    return (
      <div>
        <Grid stackable>
          <Grid.Column>
          {this.state.loggedin===false && 
            <Form onSubmit={this.onLogin} error={!!this.state.errorMessage}>
              <Form.Group widths='equal'>
                <Form.Field>
                  <label>Email</label>
                  <Input onChange={event => this.setState({email:event.target.value})} ></Input>
                </Form.Field>
                <Form.Field>
                  <label>Password</label>
                  <Input type='password' onChange={event => this.setState({password:event.target.value})} ></Input>
                </Form.Field>
              </Form.Group>
              <Button floated='right' primary basic loading={this.state.loading}>
                <Icon name='sign-in' />Login
              </Button>
              
              <Message error header="Oops!" content={this.state.errorMessage} />
              {statusMessage}
            </Form>
          }

          {this.state.loggedin===true &&
            <Form onSubmit={this.onLogout} error={!!this.state.errorMessage}>
              Are you sure you want to logout?
              <Button floated='right' primary loading={this.state.loading}>
                <Icon name='sign-out' />Logout
              </Button>
              <Message error header="Oops!" content={this.state.errorMessage} />
              {statusMessage}
            </Form>
          }
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default LogInOut;