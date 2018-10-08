import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import {
  followUser,
  editBio,
  changeProfile,
  deleteAccount
} from '../../actions/action_user';
import { ROOT_URL } from '../../actions/types';
import _ from 'lodash';

import ImageUploader from 'react-images-upload';
import SearchBar from '../search_bar';

class Users extends Component {
  constructor(props) {
    super(props);
    this.searchBar = React.createRef();
    this.state = {
      tab: 'About',
      list: [],
      bio: this.props.activeUser.bio,
      pictures: [],
      delete: ''
    };
    this.onTabClick = this.onTabClick.bind(this);
    this.renderTabs = this.renderTabs.bind(this);
    this.onFollowClick = this.onFollowClick.bind(this);
    this.onUnfollowClick = this.onUnfollowClick.bind(this);
    this.onBioSave = this.onBioSave.bind(this);
    this.onChangeText = this.onChangeText.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.onChangeProfile = this.onChangeProfile.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.onClear = this.onClear.bind(this);
  }

  onTabClick(tab) {
    this.setState({ tab });
    if (tab === 'Following') {
      this.setState({ list: this.props.activeUser.following });
    } else if (tab === 'Followers') {
      this.setState({ list: this.props.activeUser.followers });
    }
    if (this.searchBar.current) {
      this.searchBar.current.setState({ display: '' });
    }
  }

  onFollowClick() {
    const {
      followUser,
      activeUser: { username }
    } = this.props;
    followUser(username, true);
  }

  onUnfollowClick() {
    const {
      followUser,
      activeUser: { username }
    } = this.props;
    followUser(username, false);
  }

  onChangeText(event, type) {
    if (type === 'bio') {
      this.setState({ bio: event.target.value });
    } else if (type === 'delete') {
      this.setState({ delete: event.target.value });
    }
  }

  onBioSave() {
    const { editBio, user } = this.props;
    editBio(this.state.bio, user.username);
  }

  onChangeProfile(e) {
    e.preventDefault();
    document.querySelector('.fileContainer .deleteImage').click();
    const { changeProfile, user } = this.props;
    changeProfile(this.state.pictures[0], user);
  }

  onDrop(picture) {
    this.setState({
      pictures: picture
    });
  }

  onDeleteClick() {
    const { deleteAccount, user } = this.props;
    deleteAccount(user);
  }

  onSearch(term) {
    let filteredList = [];
    for (let item of this.state.list) {
      if (_.includes(item, term)) {
        filteredList.push(item);
      }
    }
    this.setState({ list: filteredList });
  }

  onClear() {
    if (this.state.tab === 'Following') {
      this.setState({ list: this.props.activeUser.following });
    } else if (this.state.tab === 'Followers') {
      this.setState({ list: this.props.activeUser.followers });
    }
  }

  renderTabs(tabs) {
    return tabs.map(tab => {
      return (
        <li className="nav-item" key={tab}>
          <a
            className={`nav-link ${this.state.tab === tab ? 'active' : ''}`}
            onClick={() => {
              this.onTabClick(tab);
            }}
          >
            {tab}
          </a>
        </li>
      );
    });
  }

  renderList(list) {
    return list.map(item => {
      return (
        <Link to={`/users/${item}`} key={item}>
          <li className="list-group-item text-body">{item}</li>
        </Link>
      );
    });
  }

  render() {
    const {
      user: { username: currentUser },
      activeUser: { username, bio, followers, profile }
    } = this.props;
    const isMyProfile = username === currentUser;

    return (
      <div>
        <div className="card profile text-center shadow">
          <img
            className="card-img-top"
            src={
              profile
                ? `${ROOT_URL}/media/${profile}`
                : '/images/defaultuser.png'
            }
            alt=""
          />
          <div className="card-body">
            <h4 className="card-text py-2 mb-0">{username}</h4>
            {isMyProfile ? null : followers.includes(currentUser) ? (
              <button className="btn btn-danger" onClick={this.onUnfollowClick}>
                Unfollow
              </button>
            ) : (
              <button className="btn btn-success" onClick={this.onFollowClick}>
                Follow
              </button>
            )}
            <div className="card">
              <div className="card-header">
                <ul
                  className="nav nav-tabs card-header-tabs"
                  style={{ color: 'gray' }}
                >
                  {this.renderTabs(['About', 'Following', 'Followers'])}
                </ul>
              </div>
              <div
                className="card-body px-3 pt-4 pb-2"
                style={{ color: '#000000' }}
              >
                {this.state.tab === 'About' ? (
                  <div>
                    <h5 className="card-title">My Biography</h5>
                    <textarea
                      value={this.state.bio}
                      placeholder="Hello..."
                      rows="4"
                      disabled={!isMyProfile}
                      onChange={e => this.onChangeText(e, 'bio')}
                    />
                    {isMyProfile ? (
                      <button
                        className="btn btn-success"
                        onClick={this.onBioSave}
                        disabled={bio === this.state.bio}
                      >
                        Save Bio
                      </button>
                    ) : null}
                  </div>
                ) : (
                  <div>
                    <SearchBar
                      ref={this.searchBar}
                      onSearch={this.onSearch}
                      onClear={this.onClear}
                    />
                    <div className="card-header mt-1">
                      {`${this.state.tab}: ${this.state.list.length}`}
                    </div>
                    <ul className="list-group list-group-flush">
                      {this.renderList(this.state.list)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {isMyProfile ? (
          <div className="row justify-content-center dark shadow mt-3">
            <div className="text-center" style={{ width: '80%' }}>
              <div>
                <h5>More Settings</h5>
                <strong>Change Profile Picture</strong>
                <form onSubmit={this.onChangeProfile}>
                  <ImageUploader
                    withIcon={true}
                    buttonText="Upload"
                    onChange={this.onDrop}
                    imgExtension={['.jpg', '.png']}
                    maxFileSize={5242880}
                    withPreview={true}
                    singleImage={true}
                    withLabel={false}
                    buttonClassName={
                      this.state.pictures.length !== 0
                        ? 'invisible py-0 my-0'
                        : 'visible'
                    }
                  />
                  <button
                    type="submit"
                    className="btn btn-success btn-block"
                    disabled={this.state.pictures.length === 0}
                  >
                    Save Image
                  </button>
                </form>
              </div>
              <div style={{ marginTop: 65 }}>
                <strong>Delete Account</strong>
                <input
                  type="text"
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: 10,
                    padding: 5
                  }}
                  placeholder="Confirm Username"
                  onChange={e => this.onChangeText(e, 'delete')}
                />
                <button
                  className="btn btn-danger btn-block mt-2"
                  disabled={currentUser !== this.state.delete}
                  onClick={this.onDeleteClick}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default connect(
  null,
  { followUser, editBio, changeProfile, deleteAccount }
)(Users);
