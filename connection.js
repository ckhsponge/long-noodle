// a connection waiting for a response
// if a callback is specified then the result is returned in a function
function _Connection( path, response, callback ) {
  this.path = path;
  this.response = response;
  this.callback = callback;
}
_Connection.prototype.send = function( body ) {
    return this.response.end( this.inCallback( body ) );
};
_Connection.prototype.close = function() {
    return this.response.end( this.inCallback( '' ) );
};
_Connection.prototype.inCallback = function( body ) {
    return this.callback ? this.callback + '(' + body + ');' : body;
};

exports.create = function( path, response, callback ) {
    return new _Connection( path, response, callback );
};