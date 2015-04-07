'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    _where = require('lodash/collection/where'),
    _find = require('lodash/collection/find'),
    _max = require('lodash/math/max'),
    fixtures = require('./fixtures');

var app = express(),
    server = app.listen(3000, '127.0.0.1');

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

app.post('/api/users', bodyParser.json(), function(req, res) {
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
      res.status(200).send('Success');
    }
  }
});

app.post('/api/tweets', bodyParser.json(), function(req, res) {
  if (!req.body.tweet) {
    res.status(400).send('Bad Request');
  } else {
    var tweet = req.body.tweet;
    var newTweet = {};
    //Choosing to manually copy over tweet properies just in case
    //random properties were added in POST request
    newTweet.userId = tweet.userId;
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