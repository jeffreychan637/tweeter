var http = require('http');

var server = http.createServer(handleRequest);

var success = 200;

function handleRequest(req, res) {
  res.writeHead(success, {'Content-Type': 'text/plain'});
  res.end('Hello!');
};

server.listen(3000, '127.0.0.1');

module.exports = server;
