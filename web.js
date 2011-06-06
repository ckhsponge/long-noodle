var http = require('http');

var PORT = process.env.PORT || 8000;
var MAX_MESSAGE_LENGTH = 2048;
var TOKEN = process.env.TOKEN || 'TOKEN';

function Connection( response ) {
  this.response = response;
}
Connection.prototype.send = function( message ) {
    return this.response.write( message + '\n' );
};

var broadcast = {
  connections: {},
  messages: {},
  add: function( path, response ) {
    this.connections[ path ] = this.connections[ path ] || [];
    this.connections[ path ].push( new Connection( response ) );
  },
  send: function( path, message ) {
    console.log( 'sending for "' + path + '": ' + message );
    this.connections[ path ] = this.connections[ path ] || [];
    this.messages[ path ] = message;
    for( var i = 0; i < this.connections[ path ].length; ++i ) {
      this.connections[ path ][i].send( message );
    }
  }
}

var server = http.createServer(function (request, response) {
  
  var parsed = require('url').parse( request.url, true );
  var path = parsed.pathname;
  var params = parsed.query;
  console.log( request.method );
  if( request.method == "GET" ) {
        response.writeHead(200, {'Content-Type': 'text/plain'});
  	broadcast.add( path, response );
  } else {
    if( params.token != TOKEN ) {
        response.writeHead( 403, {'Content-Type': 'text/plain'});
        response.end( "not authorized for posting messages without a valid 'token'\n" );
    }
    var message = '';
    request.on( 'data', function(data) {
      if( message.length > MAX_MESSAGE_LENGTH ) { return; }
      message += data.toString();
      console.log( message );
      if( message.length > MAX_MESSAGE_LENGTH ) {
        response.writeHead( 406, {'Content-Type': 'text/plain'});
        response.end( "message length exceeds " + MAX_MESSAGE_LENGTH + " bytes\n" );
      }
    });
    request.on( 'end', function() {
      response.writeHead(200, {'Content-Type': 'text/plain'});
      broadcast.send( path, message );
      response.end('success\n');
      console.log( 'end' );
    });
  }
});
server.listen(PORT, "0.0.0.0");
console.log("Listening on " + PORT);


