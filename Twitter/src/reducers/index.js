import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import PostsReducer from './reducer_posts';
import ActivePostReducer from './reducer_active_post';
import UserReducer from './reducer_user';
import ActiveUserReducer from './reducer_active_user';

const rootReducer = combineReducers({
  // all posts for feed
  posts: PostsReducer,
  // current post being looked at
  activePost: ActivePostReducer,
  // current logged in user
  user: UserReducer,
  // current user profile being looked at
  activeUser: ActiveUserReducer,
  // redux-form
  form: formReducer
});

export default rootReducer;
