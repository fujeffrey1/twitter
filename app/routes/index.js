var express = require('express');
var router = express.Router();

// controllers to handle requests
var auth_controller = require('../controllers/authController');
var tweet_controller = require('../controllers/tweetController');
var user_controller = require('../controllers/userController');
var media_controller = require('../controllers/mediaController');
var config = require('../config');

var passport = require('passport');
var jwt = require('jsonwebtoken');

// for file upload
var multer = require('multer');
var upload = multer();

// remove empty fields from request
router.use(function(req, res, next) {
  req.body = removeEmptyFields(req.body);
  next();
});

// these routes are allowed without authentication
router.post('/adduser', auth_controller.adduser);
router.post('/login', function(req, res, next) {
  passport.authenticate('login', { session: false }, function(err, user, info) {
    if (err) {
      return res.status(500).json({ status: 'error' });
    }
    if (!user) {
      return res.status(500).json({ status: 'error' });
    }
    // JWT with expiration
    var token = jwt.sign({ username: user.username }, config.secret, {
      expiresIn: '24h'
    });
    // store in cookie with expiration
    res.cookie('token', token, { maxAge: 86400000 });
    return res.json({ status: 'OK', user: user });
  })(req, res, next);
});
router.post('/logout', auth_controller.logout);
router.post('/verify', auth_controller.verify);

router.get('/feed/:type/:username?', tweet_controller.getFeed);
router.post('/search', tweet_controller.search);
router.get('/media/:id', media_controller.getMedia);

// authentication
router.use(function(req, res, next) {
  if (req.cookies.token) {
    jwt.verify(req.cookies.token, config.secret, function(err, decoded) {
      if (err) {
        res.clearCookie('token');
        return res.status(401).json({ status: 'error' });
      } else {
        req.username = decoded.username;
        next();
      }
    });
  } else {
    return res.status(401).json({ status: 'error' });
  }
});

// for tweets functionality
router.get('/item/:id', tweet_controller.getItem);
router.post('/additem', tweet_controller.addItem);
router.delete('/item/:id', tweet_controller.deleteItem);
router.post('/item/:id/like', tweet_controller.likeItem);
router.get('/replies/:id', tweet_controller.getReplies);

// for users functionality
router.get('/user/:username', user_controller.getUser);
router.get('/user/:username/followers', user_controller.getFollowers);
router.get('/user/:username/following', user_controller.getFollowing);
router.post('/user/bio', user_controller.editBio);
router.post('/user/profile', user_controller.changeProfile);
router.delete('/user/account', user_controller.deleteAccount);
router.post('/follow', user_controller.follow);

// for media functionality
router.post('/addmedia', upload.single('content'), media_controller.addMedia);
router.delete('/media/:id', media_controller.deleteMedia);

function removeEmptyFields(inputJSON) {
  for (let field in inputJSON) {
    // check properties do not come from prototype
    if (inputJSON.hasOwnProperty(field)) {
      // null case
      if (inputJSON[field] === null) {
        rem(inputJSON, field);
      } else if (typeof inputJSON[field] === 'string') {
        // empty string
        if (inputJSON[field].length === 0 || !inputJSON[field].trim()) {
          rem(inputJSON, field);
        }
      } else if (typeof inputJSON[field] === 'object') {
        // recursive
        let cleaned = removeEmptyFields(inputJSON[field]);
        if (Object.keys(cleaned).length === 0) {
          rem(inputJSON, field);
        } else {
          inputJSON[field] = cleaned;
        }
      }
    }
  }
  return inputJSON;
}

function rem(inputJSON, field) {
  if (Array.isArray(inputJSON)) {
    inputJSON.splice(field, 1);
  } else {
    delete inputJSON[field];
  }
}

module.exports = router;
