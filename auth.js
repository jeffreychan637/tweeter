'use strict';

var passport = require('passport'),
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

module.exports = passport;