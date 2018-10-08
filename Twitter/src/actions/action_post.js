import axios from 'axios';
import { history } from '../index';
import {
  ROOT_URL,
  FETCH_POSTS,
  FETCH_POST,
  DELETE_POST,
  FETCH_ACTIVE_POST,
  FETCH_PARENT,
  FETCH_REPLIES,
  FETCH_REPLY,
  DELETE_REPLY,
  FETCH_USER_POSTS,
  DELETE_USER_POST,
  FETCH_USER_POST,
  LOGOUT_USER
} from './types';

var instance = axios.create({
  baseURL: ROOT_URL,
  withCredentials: true
});

export function fetchPosts(type, { username }) {
  const request = instance.get(
    `/feed/${type}/${username === undefined ? '' : username}`
  );

  return {
    type: FETCH_POSTS,
    payload: request
  };
}

export function fetchReplies(id) {
  const request = instance.get(`/replies/${id}`);

  return { type: FETCH_REPLIES, payload: request };
}

export function searchPosts(term, options) {
  const { replies, parent, username } = options ? options : {};
  const request = instance.post('/search', {
    q: term,
    replies: replies,
    parent: parent,
    username: username
  });

  return {
    type: replies ? FETCH_REPLIES : username ? FETCH_USER_POSTS : FETCH_POSTS,
    payload: request
  };
}

export async function createPost(values, files, title) {
  let url = values.parent ? `/posts/${values.parent}` : '/posts/new';
  let ids = await Promise.all(
    files.map(async file => {
      let formData = new FormData();
      formData.set('content', file);
      try {
        let response = await instance.post('/addmedia', formData);
        return response.data.id;
      } catch (error) {}
    })
  );
  values.media = ids;
  const request = instance.post('/additem', values);

  return dispatch => {
    request
      .then(response => {
        if (title === 'Reply') {
          dispatch({ type: FETCH_REPLY, payload: response });
        } else if (title === 'Tweet') {
          dispatch({ type: FETCH_USER_POST, payload: response });
        } else {
          history.push('/');
          dispatch({ type: FETCH_POST, payload: response });
        }
      })
      .catch(() => {
        revalidate(url);
        dispatch({ type: LOGOUT_USER });
      });
  };
}

export function deletePost({ id, media }, type) {
  for (let id of media) {
    try {
      instance.delete(`/media/${id}`);
    } catch (error) {}
  }
  const request = instance.delete(`/item/${id}`);

  return dispatch => {
    request
      .then(() => {
        if (type === 'reply') {
          dispatch({ type: DELETE_REPLY, payload: id });
        } else if (type === 'user') {
          dispatch({ type: DELETE_USER_POST, payload: id });
        } else {
          history.push('/');
          dispatch({ type: DELETE_POST, payload: id });
        }
      })
      .catch(error => {
        revalidate(`/posts/${id}`);
        dispatch({ type: LOGOUT_USER });
      });
  };
}

export function likePost({ id }, like, type) {
  const request = instance.post(`/item/${id}/like`, { like });

  return dispatch => {
    request
      .then(response => {
        if (type === 'active') {
          dispatch({ type: FETCH_ACTIVE_POST, payload: response });
        } else if (type === 'reply') {
          dispatch({ type: FETCH_REPLY, payload: response });
        } else if (type === 'user') {
          dispatch({ type: FETCH_USER_POST, payload: response });
        } else {
          dispatch({ type: FETCH_POST, payload: response });
        }
      })
      .catch(error => {
        revalidate(`/posts/${id}`);
        dispatch({ type: LOGOUT_USER });
      });
  };
}

export function fetchActivePost(id) {
  const request = instance.get(`/item/${id}`);

  return dispatch => {
    request
      .then(response => {
        dispatch({ type: FETCH_ACTIVE_POST, payload: response });
        if (response.data.item.parent) {
          instance
            .get(`/item/${response.data.item.parent}`)
            .then(response =>
              dispatch({ type: FETCH_PARENT, payload: response })
            )
            .catch(() => {
              dispatch({ type: FETCH_PARENT, payload: { data: { item: {} } } });
            });
        } else {
          dispatch({ type: FETCH_PARENT, payload: { data: { item: {} } } });
        }
        instance.get(`/replies/${id}`).then(response => {
          dispatch({ type: FETCH_REPLIES, payload: response });
        });
      })
      .catch(error => {
        if (error.response.status === 401) {
          revalidate(`/posts/${id}`);
          dispatch({ type: LOGOUT_USER });
        } else {
          alert('That tweet doesnt exist!');
          history.push('/');
        }
      });
  };
}

function revalidate(from) {
  alert('Session Expired. Please relogin.');
  history.push('/login', { from });
}
