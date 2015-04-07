'use strict';

var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    _find = require('lodash/collection/find'),
    fixtures = require('./fixtures');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  var user = _find(fixtures.users, {id: id});
  if (user) {
    done(null, user);
  } else {
    done(null, false);
  }
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    var user = _find(fixtures.users, {id: username});
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    if (user.password !== password) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    done(null, user);
  }
));

module.exports = passport;