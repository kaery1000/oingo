import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import Register from './components/UserRegister';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Layout>
          <Switch>
            <Route exact path="/oingo" component={Home} />
            <Route path="/oingo/register" component={Register} />
          </Switch>
        </Layout>
      </BrowserRouter>
    );
  }
}

export default App;