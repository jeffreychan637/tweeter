'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session  = require('express-session'),
    passport = require('./auth'),
    _where = require('lodash/collection/where'),
    _find = require('lodash/collection/find'),
    _max = require('lodash/math/max'),
    _remove = require('lodash/array/remove'),
    fixtures = require('./fixtures');

var app = express(),
    server = app.listen(3000, '127.0.0.1');

app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function (req, res) {
  res.status(200);
  res.set('Content-Type', 'text/plain');
  res.send('Hello!');
});

app.get('/api/tweets', function (req, res) {
  if (req.query.userId) {
    res.status(200);
    res.set('Content-Type', 'application/json');
    var tweets = _where(fixtures.tweets, {userId: req.query.userId});
    tweets.sort(compareByTime);
    res.json({'tweets': tweets});
  } else {
    res.status(400).send('Bad Request');
  }
});

app.get('/api/tweets/:tweetId', function (req, res) {
    var tweet = _find(fixtures.tweets, {id: req.params.tweetId});
    if (tweet) {
      res.status(200);
      res.set('Content-Type', 'application/json');
      res.json({"tweet" : tweet});
    } else {
      res.status(404).send('Not Found');
    }
});

app.get('/api/users/:userId', function (req, res) {
    var user = _find(fixtures.users, {id: req.params.userId});
    if (user) {
      res.status(200);
      res.set('Content-Type', 'application/json');
      res.json({"user" : user});
    } else {
      res.status(404).send('Not Found');
    }
});

app.post('/api/users', function(req, res) {
  if (!req.body.user) {
    res.status(400).send('Bad Request');
  } else {
    var user = req.body.user;
    if (_find(fixtures.users, {id: user.id})) {
      res.status(409).send('User already exists');
    } else {
      var newUser = {};
      //Choosing to manually copy over user properies just in case
      //random properties were added in POST request
      newUser.id = user.id;
      newUser.name = user.name;
      newUser.email = user.email;
      newUser.password = user.password;
      newUser.followingIds = [];
      fixtures.users.push(newUser);
      req.logIn(newUser, function(err) {
        if (err) {
          return res.status(500).send('Internal Server Error');
        }
        res.status(200).send('Success');
      });
    }
  }
});

app.post('/api/tweets', ensureAuthentication, function(req, res) {
  if (!req.body.tweet) {
    res.status(400).send('Bad Request');
  } else {
    var tweet = req.body.tweet;
    var newTweet = {};
    //Choosing to manually copy over tweet properies just in case
    //random properties were added in POST request
    newTweet.userId = req.user.id;
    newTweet.name = tweet.text;
    var max = _max(fixtures.tweets, 'id').id;
    if (isFinite(max)) {
      newTweet.id = parseInt(max) + 1;
    } else {
      newTweet.id = 1; //first tweet
    }
    newTweet.created = Math.floor(Date.now() / 1000);
    fixtures.tweets.push(newTweet);
    res.status(200);
    res.set('Content-Type', 'application/json');
    res.json({"tweet" : newTweet});
  }
});

app.post('/api/auth/login', function(req, res) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return res.status(500).send('Internal Server Error');
    }
    if (!user) {
      return res.status(403).send('Forbidden');
    }
    req.logIn(user, function(err) {
      if (err) {
        return res.status(500).send('Internal Server Error');
      }
      res.status(200);
      return res.json({"user" : user});
    });
  })(req, res);
});

app.post('/api/auth/logout', function(req, res) {
  req.logout();
  res.status(200).send('Success');

});

app.delete('/api/tweets/:tweetId', ensureAuthentication, function(req, res) {
  var toBeDeletedTweet = _find(fixtures.tweets, {id: req.params.tweetId});
  if (toBeDeletedTweet) {
    if (toBeDeletedTweet.userId === req.user.id) {
      var deletedTweet = _remove(fixtures.tweets, {id: req.params.tweetId});
      if (deletedTweet && deletedTweet.length > 0) {
        res.status(200).send('Success');
      } else {
        res.status(500).send('Internal Server Error');
      }
    } else {
      res.status(403).send('Forbidden');
    }
  } else {
    res.status(404).send('Not Found');
  }
});

/* Middleware that checks if user is authenticated or not. */
function ensureAuthentication(req, res, next) {
  if (!req.isAuthenticated()) {
    res.status(403).send('Fobidden');
  } else {
    next();
  }
};

/* Comparison function for Tweets. Tweets created more recently are
   considered smaller.
*/
function compareByTime(a, b) {
    if (a.created > b.created) {
      return -1;
    } else if (a.created < b.created) {
      return 1;
    } else {
      return 0;
    }
};

module.exports = server;