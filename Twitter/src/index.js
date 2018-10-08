import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import Promise from 'redux-promise';
import Thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import reducers from './reducers';
import Header from './components/header';
import Register from './components/auth/register';
import Verify from './components/auth/verify';
import Login from './components/auth/login';
import PostsIndex from './components/posts/posts_index';
import PostsNew from './components/posts/posts_new';
import PostsShow from './components/posts/posts_show';
import UsersShow from './components/users/users_show';

import registerServiceWorker from './registerServiceWorker';

// create redux state with middleware and persist in local storage
const persistConfig = {
  key: 'root',
  storage
};
const store = createStore(
  persistReducer(persistConfig, reducers),
  applyMiddleware(Promise, Thunk)
);
const persistor = persistStore(store);

// history
export const history = createBrowserHistory();

// make sure page starts at top
history.listen((location, action) => {
  window.scrollTo(0, 0);
});

// for protected routes
const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      Object.keys(store.getState().user).length !== 0 ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: props.location }
          }}
        />
      )
    }
  />
);

// routing
ReactDOM.render(
  <Provider store={store} persistor={persistor}>
    <Router history={history}>
      <div>
        <Route component={Header} />
        <Switch>
          <Route path="/register" component={Register} />
          <Route path="/verify" component={Verify} />
          <Route path="/login" component={Login} />
          <PrivateRoute path="/users/:username" component={UsersShow} />
          <PrivateRoute path="/posts/new" component={PostsNew} />
          <PrivateRoute path="/posts/:id" component={PostsShow} />
          <Route
            path="/trending"
            render={props => <PostsIndex type="trending" {...props} />}
          />
          <Route
            path="/"
            render={props => <PostsIndex type="feed" {...props} />}
          />
        </Switch>
      </div>
    </Router>
  </Provider>,
  document.querySelector('#root')
);
registerServiceWorker();
