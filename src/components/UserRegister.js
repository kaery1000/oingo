import React, { Component } from 'react';
import {Grid, Loader, Dimmer, Form, Button, Message, Input} from 'semantic-ui-react';
import config from '../config';

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const poolData = {
  UserPoolId: config.cognito.userPoolId,
  ClientId: config.cognito.clientId
};

class Register extends Component {
  state = {
    loadingData:false,
    loading:false,
    errorMessage:'',
    msg:'',
    name:'',
    email:'',
    password:'',
  }

  async componentDidMount(){
    this.setState({loadingData:true});
    document.title = "Oingo | User Register";
    this.setState({loadingData:false});
  }

  onSubmit = async () => {
    this.setState({errorMessage:''});
    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var attributeList = [];

    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"name",Value:this.state.name}));
    attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"email",Value:this.state.email}));
    
    userPool.signUp(this.state.email, this.state.password, attributeList, null, (err, result) => {
      if (err) {
        this.setState({errorMessage:err.message});
        return;
      }
      var cognitoUser = result.user;
      this.setState({msg:"Please check your email to complete registration. To login, your username is " + cognitoUser.getUsername()});
    });

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
        <h2>User Registration</h2>
        <Grid stackable>
          <Grid.Column>
          <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
            <Form.Group>
              <Form.Field width={5}>
                <label>Name</label>
                <Input onChange={event => this.setState({name:event.target.value})} ></Input>
              </Form.Field>
              <Form.Field width={5}>
                <label>Email</label>
                <Input onChange={event => this.setState({email:event.target.value})} ></Input>
              </Form.Field>
            </Form.Group>
            <Form.Group>
              <Form.Field width={5}>
                <label>Password</label>
                <Input onChange={event => this.setState({password:event.target.value})} ></Input>
              </Form.Field>
              <Button floated='right' primary basic loading={this.state.loading}>
                Register
              </Button>
            </Form.Group>
            <Message error header="Oops!" content={this.state.errorMessage} />
            {statusMessage}
          </Form>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default Register;