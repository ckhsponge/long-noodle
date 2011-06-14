var http = require('http');
var fs   = require('fs');

require('./json2.js');

var PORT = process.env.PORT || 8000;
var TOKEN = process.env.TOKEN || 'TOKEN';
var MAX_MESSAGE_LENGTH = 2048;
var MAX_CONNECTION_TIME = 25000;

function Connection( path, response, callback ) {
  this.path = path;
  this.response = response;
  this.callback = callback;
}
Connection.prototype.send = function( body ) {
    return this.response.end( this.inCallback( body ) );
};
Connection.prototype.close = function() {
    return this.response.end( this.inCallback( '' ) );
};
Connection.prototype.inCallback = function( body ) {
    return this.callback ? this.callback + '(' + body + ');' : body;
};

var broadcast = {
  connections: {},
  messages: {},
  add: function( path, version, response, callback ) {
    var connection = new Connection( path, response, callback );
    //by default the connection will queue and wait for next message
    //if a message exists and a version is present in the query and the last message version is greater than the query version then send the message immediately
    if( this.messages[ path ] && version >= 0 && this.messages[ path ].version >= version ) {
        //send message immediateley
        console.log( 'sending now ' + this.messages[ path ].version + ',' + version );
        this.sendToConnection( connection, this.messages[ path ]);
    } else {
        //queue connection for next message
        this.connections[ path ] = this.connections[ path ] || [];
        console.log( 'adding to ' + connection.path );
        this.connections[ path ].push( connection );
        setTimeout( function() { broadcast.remove( connection); }, MAX_CONNECTION_TIME );
    }
  },
  remove: function( connection ) {
    console.log( 'removing from ' + connection.path );
    connection.close();
    var index = this.connections[connection.path].indexOf(connection);
    if( index >= 0 ) { this.connections[connection.path].splice( index, 1 ); }
  },
  send: function( path, body, dataType, version ) {
    this.messages[ path ] = this.messages[ path ] || { version: 0, body: ''};
    var message = this.messages[ path ];
    message.body = body;
    message.version = message.version + 1;
    if( version > 0 ) { message.version = version; }
    message.dataType = dataType;
    message.createdAt = new Date();
    console.log( 'sending for "' + path + ' ' + message.version + '": ' + body );
    this.connections[ path ] = this.connections[ path ] || [];
    for( var i = 0; i < this.connections[ path ].length; ++i ) {
      this.sendToConnection( this.connections[ path ][i], message );

    }
    this.connections[ path ] = []; //removes all listeners
  },
  sendToConnection: function( connection, message ) {
      connection.response.writeHead(200, {'Content-Type': 'text/plain', 'Version': message.version});
      var body = message.body;
      if( connection.callback ) {
          if( message.dataType == 'json') {
              body = '{"version":'+message.version+',"json":'+message.body+',"createdAt":'+JSON.stringify(message.createdAt)+'}'; 
          } else {
            body = JSON.stringify({version: message.version, body: message.body, createdAt: message.createdAt});
          }
      }
      connection.send( body );
  }
}

var server = http.createServer(function (request, response) {
  
  var parsed = require('url').parse( request.url, true );
  var path = parsed.pathname;
  var params = parsed.query;
  var version = parseInt(params.version);
  var callback = params.callback;
  var dataType = params.dataType;
  console.log( request.method );
  if( request.method == "GET" ) {
    console.log( "GET " + path);
    if( ['/test.html', '/json2.js','/noodle.js'].indexOf( path ) >= 0) {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(fs.readFileSync(__dirname + path, 'utf8')); // <--- add this line
        response.end();
    } else {
        response.writeHead(200, {'Content-Type': 'text/plain'});
  	    broadcast.add( path, version, response, callback );
    }
  } else {
    console.log( "POST " + path);
    if( params.token != TOKEN ) {
        response.writeHead( 403, {'Content-Type': 'text/plain'});
        response.end( "not authorized for posting messages without a valid 'token'\n" );
        return;
    }
    var body = '';
    request.on( 'data', function(data) {
      if( body.length > MAX_MESSAGE_LENGTH ) { return; }
      body += data.toString();
      console.log( body );
      if( body.length > MAX_MESSAGE_LENGTH ) {
        response.writeHead( 406, {'Content-Type': 'text/plain'});
        response.end( "message length exceeds " + MAX_MESSAGE_LENGTH + " bytes\n" );
      }
    });
    request.on( 'end', function() {
      broadcast.send( path, body, dataType, version );
      response.end('success\n');
      console.log( 'end' );
    });
  }
});
server.listen(PORT, "0.0.0.0");
console.log("Listening on " + PORT);


