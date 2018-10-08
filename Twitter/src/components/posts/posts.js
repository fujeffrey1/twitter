import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { likePost, deletePost } from '../../actions/action_post';
import { withRouter } from 'react-router';
import { ROOT_URL } from '../../actions/types';
import FadeIn from 'react-fade-in';

import PostsMedia from './posts_media';

class Posts extends Component {
  onLikeClick() {
    const { likePost, user, type, post, history } = this.props;
    if (Object.keys(user).length !== 0) {
      likePost(this.props.post, true, type);
    } else {
      history.push('/login', { from: `/posts/${post.id}` });
    }
  }

  onUnlikeClick() {
    const { post, type } = this.props;
    this.props.likePost(post, false, type);
  }

  onDeleteClick() {
    const { post, type } = this.props;
    this.props.deletePost(post, type);
  }

  renderPost(post) {
    const {
      username: postname,
      id,
      content,
      retweeted,
      replies,
      property: { likes },
      media,
      timestamp
    } = post;
    return (
      <div>
        <Link to={`/users/${postname}`}>
          <strong className="mt-0 mb-1">{postname}</strong>
        </Link>
        <div>
          <Link
            to={{
              pathname: `/posts/${id}`,
              state: { to: this.props.location }
            }}
          >
            <p
              style={{
                whiteSpace: this.props.type === 'active' ? 'normal' : 'noWrap'
              }}
            >
              {content}
            </p>
            <div className="media-footer text-muted text-right">
              <small>retweets: {retweeted}</small>
              <small>replies: {replies}</small>
              <small>likes: {likes.length}</small>
              <small>images: {media.length}</small>
              <small>{new Date(timestamp * 1000).toLocaleString()}</small>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  render() {
    const { post, user, original, showButtons } = this.props;
    const show = showButtons === undefined ? true : showButtons;
    const isLoggedIn = Object.keys(user).length !== 0;
    const isUserPost = isLoggedIn ? user.username === post.username : false;
    const isLiked = isLoggedIn
      ? post.property.likes.includes(user.username)
      : false;
    return (
      <FadeIn>
        <li
          className={`media ${
            this.props.type === 'active' ? 'post-active' : ''
          }`}
        >
          <Link to={`/users/${post.username}`}>
            <img
              className="mr-3 post-img"
              src={
                post.profile
                  ? `${ROOT_URL}/media/${post.profile}`
                  : '/images/defaultuser.png'
              }
              alt=""
            />
          </Link>
          <div className="media-body">
            {show ? (
              isUserPost ? (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={this.onDeleteClick.bind(this)}
                >
                  Delete
                </button>
              ) : isLiked ? (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={this.onUnlikeClick.bind(this)}
                >
                  Unlike
                </button>
              ) : (
                <button
                  className="btn btn-success btn-sm"
                  onClick={this.onLikeClick.bind(this)}
                >
                  Like
                </button>
              )
            ) : null}
            {this.renderPost(post)}
            {post.media.length !== 0 ? (
              <div style={{ marginTop: 10 }}>
                <PostsMedia media={post.media} />
              </div>
            ) : null}
            {original ? (
              <div
                className="media mt-3"
                id="original"
                style={{ backgroundColor: '#ffffff' }}
              >
                <Link
                  to={
                    original.username
                      ? `/users/${original.username}`
                      : `/posts/${post.id}`
                  }
                >
                  <img
                    className="mr-3 post-img"
                    src={
                      original.profile
                        ? `${ROOT_URL}/media/${original.profile}`
                        : '/images/defaultuser.png'
                    }
                    alt=""
                  />
                </Link>
                <div className="media-body">
                  {Object.keys(original).length === 0 ? (
                    <p className="text-danger">This Tweet is unavailable.</p>
                  ) : (
                    this.renderPost(original)
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </li>
      </FadeIn>
    );
  }
}

function mapStateToProps({ user }) {
  return { user };
}

export default connect(
  mapStateToProps,
  { likePost, deletePost }
)(withRouter(Posts));
