// node.js server for long polling message passing
// start with:
// node web.js
//
// POST requests
// -------------
// the post data is stored for the specified request path
// a version number is incremented if there is no version request parameter
// the version number is stored if it is in the request parameter
// if dataType=json is specified the post data is considered to be valid json e.g. {message:'yomama'}
//
// GET requests
// ------------
// the connection will be held open until there is a POST for the specified path
// to wait based on a version number it can be specified e.g. version=99
// if you request version=99 and the current message version is 50 then the connection will remain open until the next message
// if you request version=199 and the current message version is 150 then the message will be returned immediately
// to get the last message sent for the path specify version=0 since the current message is undoubtedly higher
// if callback=MYMETHOD is specified then the result is wrapped in a js function e.g. MYMETHOD( {body:'yomama', version:1}
// or MYMETHOD( {json:{method:'yomama'}, version:1}
// using a callback provides cross site support

var http = require('http');
var fs   = require('fs');

var PORT = process.env.PORT || 8000;
var TOKEN = process.env.TOKEN || 'TOKEN';
var MAX_MESSAGE_LENGTH = 2048;

require('./json2.js');
var Broadcast = require('./broadcast.js');

var server = http.createServer(function (request, response) {
  
  var parsed = require('url').parse( request.url, true );
  var path = parsed.pathname;
  var params = parsed.query;
  var version = parseInt(params.version);
  var callback = params.callback;
  var dataType = params.dataType;

  if( request.method == "GET" ) {
    //get the current message for the path or wait for the next one
    console.log( "GET " + path);
    if( ['/test.html', '/json2.js','/long_noodle.js'].indexOf( path ) >= 0) {
        if(path === '/test.html'){
			response.writeHead(200, {'Content-Type': 'text/html'});
        } else {
			response.writeHead(200, {'Content-Type': 'text/javascript'});
		}
		response.write(fs.readFileSync(__dirname + path, 'utf8')); // <--- add this line
        response.end();
    } else {
        response.writeHead(200, {'Content-Type': 'text/plain'});
  	    Broadcast.add( path, version, response, callback );
    }
  } else {
    //post data broadcasts to any listeners for the path
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
      //once the whole message has been received then broadcast it
      Broadcast.send( path, body, dataType, version );
      response.end('success\n');
      console.log( 'end' );
    });
  }
});
server.listen(PORT, "0.0.0.0");
console.log("Listening on " + PORT);


