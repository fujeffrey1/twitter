var User = require('../models/user');
var Tweet = require('../models/tweet');

exports.getUser = function(req, res, next) {
  User.findOne({ username: req.params.username }, function(err, user) {
    if (!user) {
      return res.status(500).json({ status: 'error' });
    }
    res.json({
      status: 'OK',
      user: user
    });
  });
};

exports.getFollowers = function(req, res, next) {
  if (req.body.limit === undefined) {
    req.body.limit = 50;
  }
  if (req.body.limit > 200) {
    req.body.limit = 200;
  }
  User.findOne({ username: req.params.username }, function(err, user) {
    if (!user) {
      return res.status(500).json({ status: 'error' });
    }
    if (user.followers.length > req.body.limit) {
      res.json({
        status: 'OK',
        users: user.followers.slice(0, req.body.limit)
      });
    } else {
      res.json({ status: 'OK', users: user.followers });
    }
  });
};

exports.getFollowing = function(req, res, next) {
  if (req.body.limit === undefined) {
    req.body.limit = 50;
  }
  if (req.body.limit > 200) {
    req.body.limit = 200;
  }
  User.findOne({ username: req.params.username }, function(err, user) {
    if (!user) {
      return res.status(500).json({ status: 'error' });
    }
    if (user.following.length > req.body.limit) {
      res.json({
        status: 'OK',
        users: user.following.slice(0, req.body.limit)
      });
    } else {
      res.json({ status: 'OK', users: user.following });
    }
  });
};

exports.follow = function(req, res, next) {
  User.findOne({ username: req.body.username }, function(err, user) {
    if (!user) {
      return res.status(500).json({ status: 'error' });
    }
    User.findOne({ username: req.username }, function(err, currentUser) {
      if (!currentUser) {
        return res.status(500).json({ status: 'error' });
      }
      if (req.body.follow === undefined) {
        req.body.follow = true;
      }
      if (
        req.body.follow &&
        !currentUser.following.includes(user.username) &&
        !user.followers.includes(currentUser.username)
      ) {
        currentUser.following.push(user.username);
        user.followers.push(currentUser.username);
        currentUser.save();
        user.save();
      } else if (!req.body.follow) {
        let index = currentUser.following.indexOf(user.username);
        if (index !== -1) {
          currentUser.following.splice(index, 1);
          currentUser.save();
        }
        index = user.followers.indexOf(currentUser.username);
        if (index !== -1) {
          user.followers.splice(index, 1);
          user.save();
        }
      }
      res.json({ status: 'OK', user: user });
    });
  });
};

exports.editBio = function(req, res, next) {
  if (req.body.bio === undefined) {
    return res.status(500).json({ status: 'error' });
  }
  User.updateOne({ username: req.username }, { bio: req.body.bio }, function(
    err,
    raw
  ) {
    if (err) {
      res.status(500).json({ status: 'error' });
    } else {
      res.json({
        status: 'OK'
      });
    }
  });
};

exports.changeProfile = function(req, res, next) {
  if (req.body.profile === undefined) {
    return res.status(500).json({ status: 'error' });
  }
  User.findOne({ username: req.username }, function(err, user) {
    if (!user) {
      return res.status(500).json({ status: 'error' });
    }
    Tweet.updateMany(
      { username: req.username },
      { profile: req.body.profile },
      function(err, raw) {}
    );
    user.profile = req.body.profile;
    user.save();
    res.json({
      status: 'OK'
    });
  });
};

exports.deleteAccount = function(req, res, next) {
  User.deleteOne({ username: req.username }, function(err) {
    if (err) {
      return res.status(500).json({ status: 'error' });
    }
    Tweet.find({ username: req.username }, function(err, tweets) {
      if (err) {
        return res.status(500).json({ status: 'error' });
      }
      for (let tweet of tweets) {
        if (tweet.parent) {
          Tweet.findOne({ id: tweet.parent }, function(err, parent) {
            if (parent) {
              if (tweet.childType === 'retweet') {
                parent.retweeted--;
              } else if (tweet.childType === 'reply') {
                parent.replies--;
              }
              parent.save();
            }
          });
        }
        Tweet.deleteMany({ parent: tweet.id, childType: 'reply' }, function(
          err
        ) {});
        tweet.remove();
      }
      res.json({ status: 'OK' });
    });
  });
};
