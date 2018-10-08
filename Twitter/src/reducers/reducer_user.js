import {
  LOGIN_USER,
  LOGOUT_USER,
  FETCH_USER_PROFILE,
  FETCH_USER_FOLLOW
} from '../actions/types';
import * as jwt_decode from 'jwt-decode';
import _ from 'lodash';

// check cookie for default
const username = document.cookie.split(';').filter(item => {
  return item.includes('token=');
}).length
  ? jwt_decode(
      document.cookie.replace(
        /(?:(?:^|.*;\s*)token\s*\s*([^;]*).*$)|^.*$/,
        '$1'
      )
    ).username
  : null;

const initialState = username ? { username: username } : {};

export default function(state = initialState, action) {
  switch (action.type) {
    case LOGIN_USER:
      return action.payload.data.user;
    case LOGOUT_USER:
      return {};
    case FETCH_USER_FOLLOW:
      if (state.following.includes(action.payload)) {
        return {
          ...state,
          following: _.omit(state.following, action.payload)
        };
      } else {
        return {
          ...state,
          following: state.following.concat(action.payload)
        };
      }
    case FETCH_USER_PROFILE:
      return {
        ...state,
        profile: action.payload
      };
    default:
      return state;
  }
}
