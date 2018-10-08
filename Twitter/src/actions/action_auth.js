import axios from 'axios';
import { history } from '../index';
import {
  ROOT_URL,
  REGISTER_USER,
  VERIFY_USER,
  LOGIN_USER,
  LOGOUT_USER
} from './types';

var instance = axios.create({
  baseURL: ROOT_URL,
  withCredentials: true
});

export function registerUser(values, callback) {
  const request = instance
    .post('/adduser', values)
    .then(() => callback())
    .catch(() => alert('Email or Username already taken!'));

  return {
    type: REGISTER_USER,
    payload: request
  };
}

export function verifyUser(values) {
  const request = instance
    .post('/verify', values)
    .then(() => {
      alert('Verification Successful!');
      history.push('/login');
    })
    .catch(() => alert('Wrong Credentials!'));

  return {
    type: VERIFY_USER,
    payload: request
  };
}

export function loginUser(values, from) {
  const request = instance.post('/login', values);

  return dispatch => {
    request
      .then(() => {
        dispatch({ type: LOGIN_USER, payload: request }).then(() =>
          history.push(from)
        );
      })
      .catch(() => {
        alert('Wrong Credentials!');
      });
  };
}

export function logoutUser() {
  const request = instance.post('/logout');

  return dispatch => {
    request.then(() => {
      dispatch({ type: LOGOUT_USER });
      history.push('/login');
    });
  };
}
