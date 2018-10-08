import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { createPost } from '../../actions/action_post';
import Dropzone from 'react-dropzone';

import Posts from './posts';

class PostsNew extends Component {
  constructor(props) {
    super(props);

    this.state = { accepted: [], rejected: [] };
  }

  renderField({ input, meta: { touched, error } }) {
    const className = `form-control ${
      touched && error ? 'border border-danger' : ''
    }`;

    return (
      <div className="form-group">
        <label>Content</label>
        <textarea
          rows="4"
          className={className}
          placeholder="Tweet..."
          type="text"
          {...input}
        />
        <div className="text-danger">{touched ? error : ''}</div>
      </div>
    );
  }

  onDrop(accepted, rejected) {
    this.setState({
      accepted: this.state.accepted.concat(accepted),
      rejected: this.state.rejected.concat(rejected)
    });
  }

  onSubmit(values) {
    const { parent, childType, title } =
      this.props.location.state || this.props;
    if (parent !== undefined) {
      values.parent = parent;
    }
    if (childType) {
      values.childType = childType;
    }
    this.props.createPost(values, this.state.accepted, title);
    this.props.reset();
    this.setState({ accepted: [], rejected: [] });
  }

  render() {
    const { handleSubmit } = this.props;
    let { title } = this.props.location.state ? this.props.location.state : {};
    if (title === undefined) {
      title = this.props.title;
    }
    const { to } = this.props.location.state || { to: '/' };
    const { post } = this.props.location.state || { post: null };
    return (
      <div
        className="row justify-content-center py-4 dark shadow"
        style={{ margin: title === 'Reply' || title === 'Tweet' ? 0 : 30 }}
      >
        {post ? (
          <div className="col-9 align-self-center" style={{ marginBottom: 30 }}>
            <Posts post={post} type="active" showButtons={false} />
          </div>
        ) : null}
        <div className="col-9 align-self-center">
          <h5>{title ? title : 'New Tweet'}</h5>
          <form onSubmit={handleSubmit(this.onSubmit.bind(this))}>
            <Field name="content" component={this.renderField} />
            <div>
              <Dropzone
                className="dropzone"
                onDrop={this.onDrop.bind(this)}
                accept="image/jpeg, image/png, .gif"
              >
                <p>
                  Drop or click to upload files.<br />
                  Only *.jpeg and *.png images will be accepted
                </p>
              </Dropzone>
            </div>
            <aside>
              {this.state.accepted.length === 0 ? null : (
                <div>
                  <strong>Accepted files</strong>
                  <ul>
                    {this.state.accepted.map(f => (
                      <li key={f.name}>
                        {f.name} - {f.size} bytes
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {this.state.rejected.length === 0 ? null : (
                <div>
                  <strong>Rejected files</strong>
                  <ul>
                    {this.state.rejected.map(f => (
                      <li key={f.name}>
                        {f.name} - {f.size} bytes
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginLeft: 10 }}
            >
              {title ? title : 'Tweet'}
            </button>
            {title === 'Reply' || title === 'Tweet' ? null : (
              <div className="text-right">
                <Link to={to} className="btn btn-danger">
                  Cancel
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }
}

function validate(values) {
  const errors = {};
  if (!values.content) {
    errors.content = 'Enter content!';
  }
  return errors;
}

export default reduxForm({
  validate,
  form: 'PostsNewForm'
})(
  connect(
    null,
    { createPost }
  )(PostsNew)
);
