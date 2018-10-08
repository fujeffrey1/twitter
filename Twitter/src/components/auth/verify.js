import React, { Component } from 'react';
import { connect } from 'react-redux';
import { verifyUser } from '../../actions/action_auth';

import Form from './redux_form';

class Verify extends Component {
  FIELDS = {
    email: {
      type: 'email',
      label: 'Email'
    },
    key: {
      type: 'text',
      label: 'Key'
    }
  };

  onSubmit(values) {
    this.props.verifyUser(values);
  }

  render() {
    return (
      <div className="row justify-content-center mt-5">
        <div className="col-4 box-form shadow">
          <Form
            formName="Verify"
            onSubmit={this.onSubmit}
            FIELDS={this.FIELDS}
            {...this.props}
          />
        </div>
      </div>
    );
  }
}

export default connect(
  null,
  { verifyUser }
)(Verify);
