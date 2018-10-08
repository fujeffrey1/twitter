import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
   fetchActivePost,
   fetchReplies,
   searchPosts
} from '../../actions/action_post';
import _ from 'lodash';
import FadeIn from 'react-fade-in';

import Posts from './posts';
import PostsNew from './posts_new';
import SearchBar from '../search_bar';
import ScrollUpButton from 'react-scroll-up-button';

class PostsShow extends Component {
   constructor(props) {
      super(props);
      this.searchBar = React.createRef();
   }

   componentDidMount() {
      const { id } = this.props.match.params;
      this.props.fetchActivePost(id);
   }

   componentDidUpdate(prevProps) {
      const { id } = this.props.match.params;
      const { activePost, fetchActivePost } = this.props;
      if (Object.keys(activePost).length !== 0) {
         if (
            activePost.post.id !== parseInt(id, 10) &&
            Object.keys(prevProps.activePost).length !== 0
         ) {
            fetchActivePost(id);
         }
      }
   }

   onSearch(term) {
      const { id } = this.props.match.params;
      this.props.searchPosts(term, { replies: true, parent: id });
   }

   onClear() {
      const { id } = this.props.match.params;
      this.props.fetchReplies(id);
   }

   onRefresh() {
      this.searchBar.current.onFormClear();
   }

   renderReplies() {
      return _.map(
         _.orderBy(this.props.activePost.replies, ['timestamp'], ['desc']),
         reply => {
            return <Posts post={reply} key={reply.id} type="reply" />;
         }
      );
   }

   render() {
      const { post, parent, replies } = this.props.activePost;

      if (!post || parent === undefined || replies === undefined) {
         return <div>Loading...</div>;
      }

      const { to } = this.props.location.state || { to: '/' };

      return (
         <div className="row justify-content-center my-4">
            <div className="col-10 align-self-center dark shadow p-4 mb-3">
               <div className="text-left">
                  <Link className="btn btn-secondary" to={to}>
                     Back
                  </Link>
                  <Link
                     className="btn btn-primary float-right"
                     to={{
                        pathname: '/posts/new',
                        state: {
                           title: 'Retweet',
                           childType: 'retweet',
                           parent: post.id,
                           to: this.props.location,
                           post: post
                        }
                     }}
                  >
                     Retweet
                  </Link>
               </div>
               <div style={{ marginTop: 20 }}>
                  <Posts
                     post={post}
                     type="active"
                     original={
                        post.parent
                           ? Object.keys(parent).length !== 0
                              ? parent
                              : {}
                           : null
                     }
                  />
               </div>
            </div>
            <div className="col-10 col-lg-3 align-self-start mb-3 p-0 mr-lg-3">
               <PostsNew
                  title="Reply"
                  childType="reply"
                  parent={post.id}
                  {...this.props}
               />
            </div>
            <div className="col-10 col-lg-7 align-self-start dark shadow p-4 my-0">
               <div className="row" style={{ marginBottom: 15 }}>
                  <div className="col mb-3">
                     <h5 className="float-left">Replies</h5>
                  </div>
                  <div className="break" />
                  <div className="col-7">
                     <SearchBar
                        ref={this.searchBar}
                        onSearch={this.onSearch.bind(this)}
                        onClear={this.onClear.bind(this)}
                     />
                  </div>
                  <div className="col">
                     <button
                        className="btn btn-secondary"
                        onClick={this.onRefresh.bind(this)}
                     >
                        Refresh
                     </button>
                  </div>
               </div>
               {Object.keys(replies).length === 0 ? (
                  <p style={{ textAlign: 'center' }}>No Replies!</p>
               ) : (
                  <ul className="list-group">
                     <FadeIn delay={75}>{this.renderReplies()}</FadeIn>
                  </ul>
               )}
            </div>
            <ScrollUpButton
               StopPosition={0}
               TransitionBtnPosition={150}
               EasingType="easeOutCubic"
               AnimationDuration={700}
            />
         </div>
      );
   }
}

function mapStateToProps({ activePost }) {
   return {
      activePost
   };
}

export default connect(
   mapStateToProps,
   { fetchActivePost, fetchReplies, searchPosts }
)(PostsShow);
