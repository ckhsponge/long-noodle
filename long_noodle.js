function LongNoodle( _url, _callback ) {
	this.url = _url;
	this.callback = _callback;
    this.repeat = true;
	this.version = 0; //setting version to 0 tells noodle to immediately return the last message if it exists
}
LongNoodle.prototype.poll = function(){
	var noodle = this;
	var ajax_callback = function(data) {
      if( noodle.callback ) {
        if (data) {
          noodle.version = data.version + 1; //get ready to wait for next version
          noodle.callback( data );
        }
        if (noodle.repeat) {
          noodle.poll();
        }
      }
	};
	$.ajax( {url: this.url, dataType: "jsonp", crossDomain: true, data: { version: this.version }, success: function(data, textStatus, jqXHR) {
      ajax_callback( data );
    }
  })
  //.success(function() { alert("second success"); })
  .error(function() { alert("Error. Reload page and try again."); }   );
  //.complete(function() { alert("complete"); });
}
LongNoodle.prototype.start = function(){
    this.poll();
}
LongNoodle.prototype.startWithWait = function(){
    this.version = null; //clearing the version forces a wait for the next message
    this.poll();
}
LongNoodle.prototype.startSingle = function(){
    this.repeat = false;
    this.poll();
}

LongNoodle.prototype.stop = function(){
	this.callback = null;
}
