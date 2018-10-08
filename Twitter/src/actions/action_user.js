import axios from 'axios';
import { history } from '../index';
import {
  ROOT_URL,
  FETCH_USER,
  FETCH_USER_POSTS,
  FETCH_USER_BIO,
  FETCH_USER_FOLLOW,
  FETCH_USER_PROFILE,
  LOGOUT_USER
} from './types';

var instance = axios.create({
  baseURL: ROOT_URL,
  withCredentials: true
});

export function fetchUser(username) {
  const request = instance.get(`/user/${username}`);

  return dispatch => {
    request
      .then(response => {
        dispatch({ type: FETCH_USER, payload: response });
        instance.get(`/feed/user/${username}`).then(response => {
          dispatch({ type: FETCH_USER_POSTS, payload: response });
        });
      })
      .catch(error => {
        if (error.response.status === 401) {
          revalidate(`/users/${username}`);
          dispatch({ type: LOGOUT_USER });
        } else {
          alert('That user doesnt exist!');
          history.push('/');
        }
      });
  };
}

export function fetchUserPosts(username) {
  const request = instance.get(`/feed/user/${username}`);

  return dispatch => {
    request
      .then(response => {
        dispatch({ type: FETCH_USER_POSTS, payload: response });
      })
      .catch(() => {
        revalidate(`/users/${username}`);
        dispatch({ type: LOGOUT_USER });
      });
  };
}

export function followUser(username, follow) {
  const request = instance.post('/follow', { username, follow });

  return dispatch => {
    request
      .then(response => {
        dispatch({ type: FETCH_USER, payload: response });
        dispatch({ type: FETCH_USER_FOLLOW, payload: username });
      })
      .catch(() => {
        revalidate(`/users/${username}`);
        dispatch({ type: LOGOUT_USER });
      });
  };
}

export function editBio(bio, username) {
  const request = instance.post('/user/bio', { bio });

  return dispatch => {
    request
      .then(response => {
        dispatch({ type: FETCH_USER_BIO, payload: bio });
      })
      .catch(() => {
        revalidate(`/users/${username}`);
        dispatch({ type: LOGOUT_USER });
      });
  };
}

export async function changeProfile(picture, { username, profile }) {
  if (profile !== undefined) {
    try {
      instance.delete(`media/${profile}`);
    } catch (error) {}
  }

  let promise = new Promise((resolve, reject) => {
    let formData = new FormData();
    formData.set('content', picture);
    try {
      instance
        .post('/addmedia', formData)
        .then(response => resolve(response.data.id));
    } catch (error) {}
  });

  let id = await promise;
  const request = instance.post('/user/profile', { profile: id });

  return dispatch => {
    request
      .then(response => {
        dispatch({ type: FETCH_USER_PROFILE, payload: id });
      })
      .catch(() => {
        revalidate(`/users/${username}`);
        dispatch({ type: LOGOUT_USER });
      });
  };
}

export function deleteAccount({ username, profile }) {
  if (profile !== undefined) {
    try {
      instance.delete(`media/${profile}`);
    } catch (error) {}
  }

  const request = instance.delete('/user/account');

  return dispatch => {
    request
      .then(response => {
        history.push('/');
        dispatch({ LOGOUT_USER });
      })
      .catch(error => {
        history.push('/');
        dispatch({ type: LOGOUT_USER });
      });
  };
}

function revalidate(from) {
  alert('Session Expired. Please relogin.');
  history.push('/login', { from });
}
