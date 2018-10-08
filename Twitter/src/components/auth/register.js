import React, { Component } from 'react';
import { connect } from 'react-redux';
import { registerUser } from '../../actions/action_auth';

import Form from './redux_form';

class Register extends Component {
    FIELDS = {
        email: {
            type: 'email',
            label: 'Email'
        },
        username: {
            type: 'text',
            label: 'Username'
        },
        password: {
            type: 'password',
            label: 'Password'
        },
        confirm: {
            type: 'password',
            label: 'Confirm Password'
        }
    };

    onSubmit(values) {
        this.props.registerUser(values, () => {
            alert('A verification email has been sent!');
            this.props.reset();
        });
    }

    validate(values) {
        const errors = {};
        if (!values.email) {
            errors.email = `Enter a value for 'Email'`;
        }
        if (!values.username) {
            errors.username = `Enter a value for 'Username'`;
        }
        if (!values.password) {
            errors.password = `Enter a value for 'Password'`;
        }
        if (values.password !== values.confirm) {
            errors.confirm = 'Passwords do not match!';
        }
        return errors;
    }

    render() {
        return (
            <div className="box shadow">
                <div className="row justify-content-center">
                    <div className="col box-form">
                        <Form
                            formName="Register"
                            onSubmit={this.onSubmit}
                            validate={this.validate}
                            FIELDS={this.FIELDS}
                            {...this.props}
                        />
                    </div>
                    <div className="break" />
                    <div className="col font-italic" id="register-image">
                        <h2>Learn what people are talking about...</h2>
                        <h2>Join the conversation...</h2>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    null,
    { registerUser }
)(Register);
