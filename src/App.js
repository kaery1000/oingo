import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Register from './components/UserRegister';
import AddNote from './components/AddNote';
import AddFilter from './components/AddFilter';
import UserDetails from './components/UserDetails';
import UserFriends from './components/UserFriends';
import UserState from './components/UserState';
import PersonalNotes from './components/PersonalNotes';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Layout>
          <Switch>
            <Route exact path="/oingo" component={Home} />
            <Route path="/oingo/register" component={Register} />
            <Route path="/oingo/add_note" render={() => <AddNote />} />
            <Route path="/oingo/add_filter" render={() => <AddFilter />} />
            <Route path='/oingo/user_details' render={() => <UserDetails />} />
            <Route path='/oingo/user_friends' render={() => <UserFriends />} />
            <Route path='/oingo/user_state' render={() => <UserState />} />
            <Route path='/oingo/personal_notes' render={() => <PersonalNotes />} />
          </Switch>
        </Layout>
      </BrowserRouter>
    );
  }
}

export default App;