import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import _ from 'lodash';

const ReduxForm = props => {
  class Form extends Component {
    renderField = ({ input, meta: { touched, error } }) => {
      const { label, type } = this.props.FIELDS[input.name];
      const className = `form-control ${
        touched && error ? 'border border-danger' : ''
      }`;

      return (
        <div className="form-group">
          <label>{label}</label>
          <input className={className} type={type} {...input} />
          <div className="text-danger">{touched ? error : ''}</div>
        </div>
      );
    };

    render() {
      const { onSubmit, handleSubmit } = this.props;

      return (
        <div>
          <h5>{this.props.formName}</h5>
          <form onSubmit={handleSubmit(onSubmit.bind(this))}>
            {_.keys(this.props.FIELDS).map(key => {
              return (
                <Field name={key} key={key} component={this.renderField} />
              );
            })}
            <button type="submit" className="btn btn-primary">
              {this.props.formName}
            </button>
          </form>
        </div>
      );
    }
  }

  const validate = values => {
    if (!props.validate) {
      const errors = {};
      _.each(props.FIELDS, (value, field) => {
        if (!values[field]) {
          errors[field] = `Enter a value for '${value.label}'`;
        }
      });
      return errors;
    }
    props.validate(values);
  };

  const FormWrapped = reduxForm({
    form: props.formName,
    validate
  })(Form);

  return <FormWrapped {...props} />;
};

export default ReduxForm;
