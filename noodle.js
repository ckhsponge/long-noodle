function Noodle( _url, _callback ) {
	this.url = _url;
	this.callback = _callback;
    this.repeat = true;
}
Noodle.prototype.poll = function(){
	var noodle = this;
	var ajax_callback = function(data) {
      if( noodle.callback ) {
        if (data) {
          noodle.version = data.version + 1;
          noodle.callback( data );
        }
        if (noodle.callback && noodle.repeat) {
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
Noodle.prototype.start = function(){
	this.version = 0; //setting version to 0 tells noodle to immediately return the last message
    this.poll();
}
Noodle.prototype.startWithWait = function(){
    this.poll();
}
Noodle.prototype.startSingle = function(){
    this.repeat = false;
    this.poll();
}

Noodle.prototype.stop = function(){
	this.callback = null;
}
