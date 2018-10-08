import {
  FETCH_ACTIVE_POST,
  FETCH_PARENT,
  FETCH_REPLIES,
  FETCH_REPLY,
  DELETE_REPLY
} from '../actions/types';
import _ from 'lodash';

export default function(state = {}, action) {
  switch (action.type) {
    case FETCH_ACTIVE_POST:
      return {
        ...state,
        post: action.payload.data.item
      };
    case FETCH_PARENT:
      return {
        ...state,
        parent: action.payload.data.item
      };
    case FETCH_REPLIES:
      return {
        ...state,
        replies: _.mapKeys(
          action.payload.data.items.map(item => item._source),
          'id'
        )
      };
    case FETCH_REPLY:
      return {
        ...state,
        replies: {
          ...state.replies,
          [action.payload.data.item.id]: action.payload.data.item
        }
      };
    case DELETE_REPLY:
      return {
        ...state,
        replies: _.omit(state.replies, action.payload)
      };
    default:
      return state;
  }
}
