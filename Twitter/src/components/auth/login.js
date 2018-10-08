import React, { Component } from 'react';
import { connect } from 'react-redux';
import { loginUser } from '../../actions/action_auth';

import Form from './redux_form';

class Login extends Component {
  FIELDS = {
    username: {
      type: 'text',
      label: 'Username'
    },
    password: {
      type: 'password',
      label: 'Password'
    }
  };

  onSubmit(values) {
    const { from = '/' } = this.props.location.state
      ? this.props.location.state
      : {};
    this.props.loginUser(values, from);
  }

  render() {
    return (
      <div className="box shadow">
        <div className="row justify-content-center">
          <div className="col box-form">
            <Form
              formName="Login"
              onSubmit={this.onSubmit}
              FIELDS={this.FIELDS}
              {...this.props}
            />
          </div>
          <div className="break" />
          <div className="col" id="login-image" />
        </div>
      </div>
    );
  }
}

export default connect(
  null,
  { loginUser }
)(Login);
