import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { logoutUser } from '../actions/action_auth';
import { ROOT_URL } from '../actions/types';

class Header extends Component {
   renderAccount() {
      const { username, profile } = this.props.user;

      if (username !== undefined) {
         return (
            <div className="nav-item dropdown">
               <img
                  style={{ height: 40, width: 'auto', borderRadius: '10' }}
                  src={
                     profile
                        ? `${ROOT_URL}/media/${profile}`
                        : '/images/defaultuser.png'
                  }
                  alt=""
               />
               <div
                  className="nav-link dropdown-toggle cursor float-right"
                  id="navbarDropdown"
                  role="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
               >
                  {username}
               </div>
               <div
                  className="dropdown-menu dropdown-menu-right dark"
                  aria-labelledby="navbarDropdown"
               >
                  <NavLink className="dropdown-item" to={`/users/${username}`}>
                     My Profile
                  </NavLink>
                  <div className="dropdown-divider" />
                  <button
                     className="dropdown-item text-danger cursor"
                     onClick={this.onLogout.bind(this)}
                  >
                     Logout
                  </button>
               </div>
            </div>
         );
      } else {
         return (
            <ul className="navbar-nav">
               <li className="nav-item">
                  <NavLink
                     className="nav-link"
                     activeClassName="active"
                     to="/register"
                  >
                     Register
                  </NavLink>
               </li>
               <li className="nav-item">
                  <NavLink
                     className="nav-link"
                     activeClassName="active"
                     to="/login"
                  >
                     Login
                  </NavLink>
               </li>
            </ul>
         );
      }
   }

   onLogout() {
      this.props.logoutUser();
   }

   render() {
      return (
         <nav className="navbar navbar-expand-sm sticky-top dark">
            <NavLink className="navbar-brand" to="/">
               <img src="/images/favicon.png" alt="" />
               PATTER
            </NavLink>
            <button
               className="navbar-toggler navbar-dark"
               type="button"
               data-toggle="collapse"
               data-target="#collapsingNavbar"
            >
               <span className="navbar-toggler-icon" />
            </button>

            <div className="collapse navbar-collapse" id="collapsingNavbar">
               <ul className="navbar-nav mr-auto">
                  <li className="nav-item">
                     <NavLink
                        exact
                        className="nav-link"
                        activeClassName="active"
                        to="/"
                     >
                        My Feed
                     </NavLink>
                  </li>
                  <li className="nav-item">
                     <NavLink
                        className="nav-link"
                        activeClassName="active"
                        to="/trending"
                     >
                        Trending
                     </NavLink>
                  </li>
               </ul>
               {this.renderAccount()}
            </div>
         </nav>
      );
   }
}

function mapStateToProps({ user }) {
   return { user };
}

export default connect(
   mapStateToProps,
   { logoutUser }
)(Header);
