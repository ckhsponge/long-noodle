// stores all the listeners for a given path

var Connection = require('./connection.js');

var MAX_CONNECTION_TIME = 25000;
var connections = {};
var messages = {};

exports.add = function( path, version, response, callback ) {
    var connection = Connection.create( path, response, callback );
    //by default the connection will queue and wait for next message
    //if a message exists and a version is present in the query and the last message version is greater than the query version then send the message immediately
    if( messages[ path ] && version >= 0 && messages[ path ].version >= version ) {
        //send message immediately
        console.log( 'sending now ' + messages[ path ].version + ',' + version );
        sendToConnection( connection, messages[ path ]);
    } else {
        //queue connection for next message
        connections[ path ] = connections[ path ] || [];
        connections[ path ].push( connection );
        console.log( 'adding to "' + connection.path + '", ' + connections[ path ].length + ' listeners' );
        setTimeout( function() { remove( connection); }, MAX_CONNECTION_TIME );
    }
};
var remove = function( connection ) {
    console.log( 'removing from ' + connection.path );
    connection.close();
    var index = connections[connection.path].indexOf(connection);
    if( index >= 0 ) { connections[connection.path].splice( index, 1 ); }
};
exports.remove = remove;
exports.send = function( path, body, dataType, version ) {
    messages[ path ] = messages[ path ] || { version: 0, body: ''};
    var message = messages[ path ];
    message.body = body;
    message.version = message.version + 1;
    if( version > 0 ) { message.version = version; }
    message.dataType = dataType;
    message.createdAt = new Date();
    connections[ path ] = connections[ path ] || [];
    console.log( 'sending for "' + path + '" ' + message.version + ', ' + connections[ path ].length + ' listeners: ' + body );
    for( var i = 0; i < connections[ path ].length; ++i ) {
      sendToConnection( connections[ path ][i], message );

    }
    connections[ path ] = []; //removes all listeners
};
var sendToConnection = function( connection, message ) {
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
};
exports.sendToConnection = sendToConnection;