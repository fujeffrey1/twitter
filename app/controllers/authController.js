var User = require('../models/user');
var Key = require('../models/key');
var bcrypt = require('bcryptjs');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

exports.adduser = function(req, res, next) {
  User.findOne({ email: req.body.email }, function(err, user) {
    if (user) {
      return res.status(500).json({ status: 'error' });
    }
    User.findOne({ username: req.body.username }, function(err, user) {
      if (user) {
        return res.status(500).json({ status: 'error' });
      }
      let newUser = new User({
        username: req.body.username,
        email: req.body.email
      });
      let newKey = new Key({
        userId: newUser._id,
        key: crypto.randomBytes(20).toString('hex')
      });
      newKey.save();
      bcrypt.hash(req.body.password, 10, function(err, hash) {
        newUser.password = hash;
        newUser.save();
      });
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'noreply8914@gmail.com',
          pass: 'Qpwoeiruty123'
        }
      });
      let mailOptions = {
        from: 'noreply8914@gmail.com',
        to: newUser.email,
        subject: 'Account Verification',
        text:
          'Hello,\n\nPlease click the following link to verify your account for PATTER:\n\nhttp://' +
          req.hostname +
          ':3000/verify\n\n' +
          'Your verification key is ' +
          newKey.key
      };
      transporter.sendMail(mailOptions, function(err) {
        if (err) {
          return res.status(500).json({ status: 'error' });
        }
        res.json({ status: 'OK' });
      });
    });
  });
};

passport.use(
  'login',
  new LocalStrategy(function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { status: 'error' });
      }
      if (!user.isVerified) {
        return done(null, false, { status: 'error' });
      }
      bcrypt.compare(password, user.password).then(res => {
        if (res) {
          return done(null, user);
        }
        return done(null, false, { status: 'error' });
      });
    });
  })
);

exports.logout = function(req, res, next) {
  if (req.cookies.token) {
    res.clearCookie('token');
  }
  return res.json({ status: 'OK' });
};

exports.verify = function(req, res, next) {
  Key.findOne({ key: req.body.key }, function(err, key) {
    if (!key) {
      return res.status(500).json({ status: 'error' });
    }
    User.findOne({ _id: key.userId }, function(err, user) {
      if (!user) {
        return res.status(500).json({ status: 'error' });
      }
      if (user.email !== req.body.email) {
        return res.status(500).json({ status: 'error' });
      }
      user.isVerified = true;
      key.remove();
      user.save().then(function(user) {
        res.json({ status: 'OK' });
      });
    });
  });
};
