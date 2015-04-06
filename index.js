'use strict';

var express = require('express');
var where = require('lodash/collection/where');
var find = require('lodash/collection/find');
var fixtures = require('./fixtures');

var app = express();
var server = app.listen(3000, '127.0.0.1');

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