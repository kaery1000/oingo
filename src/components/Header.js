import React from 'react';
import {Link} from 'react-router-dom';
import {Menu, Icon} from 'semantic-ui-react';

export default () => {
  return (
    <Menu style={{ marginTop:'10px' }}>
      <Menu.Item><Link to='/'>Oingo</Link></Menu.Item>

      <Menu.Menu position="right">
        <Menu.Item><Link to='/#'><Icon name='address card outline' />DummyLink</Link></Menu.Item>
      </Menu.Menu>
    </Menu>
  );
};