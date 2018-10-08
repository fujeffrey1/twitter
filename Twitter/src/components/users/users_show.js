import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchUser, fetchUserPosts } from '../../actions/action_user';
import { searchPosts } from '../../actions/action_post';
import _ from 'lodash';
import FadeIn from 'react-fade-in';

import Users from './users';
import Posts from '../posts/posts';
import SearchBar from '../search_bar';
import ScrollUpButton from 'react-scroll-up-button';
import PostsNew from '../posts/posts_new';

class UsersShow extends Component {
    componentDidMount() {
        const { username } = this.props.match.params;
        this.props.fetchUser(username);
    }

    componentDidUpdate(prevProps) {
        const { username } = this.props.match.params;
        const { fetchUser, activeUser } = this.props;
        if (Object.keys(activeUser).length !== 0) {
            if (
                activeUser.user.username !== username &&
                Object.keys(prevProps.activeUser).length !== 0
            ) {
                fetchUser(username);
            }
        }
    }

    onSearch(term) {
        const { username } = this.props.match.params;
        this.props.searchPosts(term, { username });
    }

    onClear() {
        const { username } = this.props.match.params;
        this.props.fetchUserPosts(username);
    }

    renderPosts(posts) {
        return _.map(_.orderBy(posts, ['timestamp'], ['desc']), post => {
            return <Posts post={post} key={post.id} type="user" />;
        });
    }

    render() {
        const {
            activeUser: { user, posts },
            match: { params }
        } = this.props;

        if (!user || posts === undefined || user.username !== params.username) {
            return <div>Loading...</div>;
        }

        return (
            <div className="row justify-content-center m-5">
                <div className="col-lg-3 mb-3 px-0">
                    <Users user={this.props.user} activeUser={user} />
                </div>
                <div className="break" />
                <div className="col-lg-8 align-self-start ml-lg-3 p-0">
                    {user.username === this.props.user.username ? (
                        <div className="mb-3">
                            <PostsNew title="Tweet" {...this.props} />
                        </div>
                    ) : null}
                    <div className="p-4 dark shadow">
                        <div className="mb-3">
                            <SearchBar
                                onSearch={this.onSearch.bind(this)}
                                onClear={this.onClear.bind(this)}
                            />
                        </div>
                        {Object.keys(posts).length === 0 ? (
                            <p style={{ textAlign: 'center' }}>No Tweets!</p>
                        ) : (
                            <ul className="list-group">
                                <FadeIn delay={75}>
                                    {this.renderPosts(posts)}
                                </FadeIn>
                            </ul>
                        )}
                    </div>
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

function mapStateToProps({ activeUser, user }) {
    return { activeUser, user };
}

export default connect(
    mapStateToProps,
    { fetchUser, fetchUserPosts, searchPosts }
)(UsersShow);
