import { FETCH_POSTS, FETCH_POST, DELETE_POST } from '../actions/types';
import _ from 'lodash';

export default function(state = {}, action) {
  switch (action.type) {
    case FETCH_POSTS:
      return _.mapKeys(
        action.payload.data.items.map(item => item._source),
        'id'
      );
    case FETCH_POST:
      return {
        ...state,
        [action.payload.data.item.id]: action.payload.data.item
      };
    case DELETE_POST:
      return _.omit(state, action.payload);
    default:
      return state;
  }
}
