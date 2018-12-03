import React from 'react';
import {Link} from 'react-router-dom';
import {Menu, Icon, Modal} from 'semantic-ui-react';
import LogInOut from './UserLogInOut';

export default () => {
  return (
    <Menu style={{ marginTop:'10px' }}>
      <Menu.Item><Link to='/oingo'>Oingo</Link></Menu.Item>

      <Menu.Menu position="right">
        <Menu.Item><Link to='/oingo/register'><Icon name='address card outline' />Register</Link></Menu.Item>
        
        <Modal size={'tiny'} trigger={<Menu.Item>Log In/Out</Menu.Item>}>
          <Modal.Header>LogIn/Logout</Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <LogInOut />
            </Modal.Description>
          </Modal.Content>
        </Modal>
        
      </Menu.Menu>
    </Menu>
  );
};