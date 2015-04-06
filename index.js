'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    where = require('lodash/collection/where'),
    find = require('lodash/collection/find'),
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
    var tweets = where(fixtures.tweets, {userId: req.query.userId});
    tweets.sort(compareByTime);
    res.json({'tweets': tweets});
  } else {
    res.status(400).send('Bad Request');
  }
});

app.get('/api/users/:userId', function (req, res) {
    var user = find(fixtures.users, {id: req.params.userId});
    if (user) {
      res.status(200);
      res.set('Content-Type', 'application/json');
      res.json({'user': user});
    } else {
      res.status(404).send('Not Found');
    }
});

app.post('/api/users', bodyParser.json(), function(req, res) {
  if (!req.body.user) {
    res.status(400).send('Bad Request');
  } else {
    var user = req.body.user;
    if (find(fixtures.users, {id: user.id})) {
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