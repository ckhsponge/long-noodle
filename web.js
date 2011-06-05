var http = require('http');

var port = process.env.PORT || 8000;

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(port, "127.0.0.1");
console.log("Listening on " + port);