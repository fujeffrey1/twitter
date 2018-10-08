import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { fetchPosts, searchPosts } from '../../actions/action_post';
import _ from 'lodash';
import axios from 'axios';
import { ROOT_URL } from '../../actions/types';
import FadeIn from 'react-fade-in';

import SearchBar from '../search_bar';
import Posts from './posts';
import ScrollUpButton from 'react-scroll-up-button';

class PostsIndex extends Component {
    constructor(props) {
        super(props);
        this.searchBar = React.createRef();
        this.state = { type: '', quote: '', author: '' };
    }

    componentDidMount() {
        const { posts, type, fetchPosts, user } = this.props;
        this.setState({ type });
        if (Object.keys(posts).length === 0 || type === 'trending') {
            fetchPosts(type, user);
        }
    }

    componentDidUpdate() {
        const { type, fetchPosts, user } = this.props;
        if (this.state.type !== type) {
            this.setState({ type });
            fetchPosts(type, user);
        }
    }

    renderPosts() {
        return _.map(
            _.orderBy(this.props.posts, ['timestamp'], ['desc']),
            post => {
                return <Posts post={post} key={post.id} />;
            }
        );
    }

    renderUsers() {
        return _.uniqBy(
            _.map(this.props.posts, post => {
                return { username: post.username, profile: post.profile };
            }),
            'username'
        )
            .filter(post => {
                return Object.keys(this.props.user).length !== 0
                    ? !this.props.user.following.includes(post.username)
                    : true;
            })
            .map(post => {
                return this.props.user.username !== post.username ? (
                    <Link to={`/users/${post.username}`} key={post.username}>
                        <li className="media p-0">
                            <img
                                className="mr-2 post-img"
                                src={
                                    post.profile
                                        ? `${ROOT_URL}/media/${post.profile}`
                                        : '/images/defaultuser.png'
                                }
                                alt=""
                            />
                            <p className="text-center">{post.username}</p>
                        </li>
                    </Link>
                ) : null;
            });
    }

    onSearch(term) {
        this.props.searchPosts(term);
    }

    onClear() {
        this.props.fetchPosts(this.state.type, this.props.user);
    }

    onRefresh() {
        this.searchBar.current.onFormClear();
    }
    onGetQuote() {
        axios
            .get('https://talaikis.com/api/quotes/random/')
            .then(response => {
                this.setState({
                    quote: response.data.quote,
                    author: response.data.author
                });
            })
            .catch(this.setState({ quote: '', author: '' }));
    }

    render() {
        const { posts } = this.props;

        if (!posts) {
            return <div>Loading...</div>;
        }

        return (
            <div>
                <div className="row index shadow">
                    <SearchBar
                        ref={this.searchBar}
                        onSearch={this.onSearch.bind(this)}
                        onClear={this.onClear.bind(this)}
                    />
                </div>
                <div className="row justify-content-center mx-5 my-4">
                    <div className="col-lg-9 align-self-start dark shadow mb-3 p-4">
                        <button
                            className="btn btn-secondary float-left"
                            onClick={this.onRefresh.bind(this)}
                        >
                            Refresh
                        </button>
                        <div className="text-right">
                            <Link className="btn btn-primary" to="/posts/new">
                                New Tweet
                            </Link>
                        </div>
                        <h4 className="mt-3">
                            Latest Tweets{' '}
                            {this.props.type === 'trending'
                                ? '(Trending)'
                                : null}
                        </h4>
                        {Object.keys(posts).length === 0 ? (
                            <p style={{ textAlign: 'center' }}>No Tweets!</p>
                        ) : (
                            <ul className="list-group">
                                <FadeIn delay={75}>{this.renderPosts()}</FadeIn>
                            </ul>
                        )}
                    </div>
                    <div className="col pl-lg-4">
                        <div className="row dark shadow mb-3">
                            <div className="col">
                                <h5>Who to follow</h5>
                                <ul className="pl-0 pt-1">
                                    {this.renderUsers()}
                                </ul>
                            </div>
                        </div>
                        <div className="row dark shadow mb-3">
                            <div className="col">
                                {this.state.quote === ''
                                    ? 'Success is going from failure to failure without losing your enthusiasm.'
                                    : this.state.quote}
                                <br />
                                <br />
                                <span className="float-right">
                                    -{' '}
                                    {this.state.author === ''
                                        ? 'Winston Churchill'
                                        : this.state.author}
                                </span>
                                <br />
                                <hr />
                                <div className="text-center pb-2">
                                    Sponsored By Talakis Quotes!
                                </div>
                                <button
                                    className="btn btn-info btn-block"
                                    onClick={this.onGetQuote.bind(this)}
                                >
                                    Get A New Quote
                                </button>
                            </div>
                        </div>
                        <div className="row justify-content-center dark shadow">
                            <small className="text-center">
                                Patter is a free social media platform based on
                                Twitter &copy; 2018
                            </small>
                        </div>
                    </div>
                    <ScrollUpButton
                        StopPosition={0}
                        TransitionBtnPosition={150}
                        EasingType="easeOutCubic"
                        AnimationDuration={700}
                    />
                </div>
            </div>
        );
    }
}

function mapStateToProps({ posts, user }) {
    return { posts, user };
}

export default connect(
    mapStateToProps,
    { fetchPosts, searchPosts }
)(PostsIndex);
