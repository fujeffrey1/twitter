import {
  FETCH_USER,
  FETCH_USER_POSTS,
  FETCH_USER_POST,
  DELETE_USER_POST,
  FETCH_USER_BIO,
  FETCH_USER_PROFILE
} from '../actions/types';
import _ from 'lodash';

export default function(state = {}, action) {
  switch (action.type) {
    case FETCH_USER:
      return {
        ...state,
        user: action.payload.data.user
      };
    case FETCH_USER_POSTS:
      return {
        ...state,
        posts: _.mapKeys(
          action.payload.data.items.map(item => item._source),
          'id'
        )
      };
    case FETCH_USER_POST:
      return {
        ...state,
        posts: {
          ...state.posts,
          [action.payload.data.item.id]: action.payload.data.item
        }
      };
    case DELETE_USER_POST:
      return {
        ...state,
        posts: _.omit(state.posts, action.payload)
      };
    case FETCH_USER_BIO:
      return {
        ...state,
        user: {
          ...state.user,
          bio: action.payload
        }
      };
    case FETCH_USER_PROFILE:
      return {
        ...state,
        user: {
          ...state.user,
          profile: action.payload
        }
      };
    default:
      return state;
  }
}
