function EasSpeech2Text(options){
	this.defaults = {
		lang: "ja-JP",
		continuous: false,
		interimResults: false
	}
	this.options = $.extend({}, this.defaults, options)
  this.ear = null
}

EasSpeech2Text.prototype.init = function(callOnSuccess, callOnError){
  var _this = this
  function _init(){
  	if(window.webkitSpeechRecognition){
	    _this.ear = new webkitSpeechRecognition();
	    _this.ear.continuous = _this.options.continuous;
	    _this.ear.interimResults = _this.options.interimResults;
	    _this.ear.lang = _this.options.lang;
	    callOnSuccess && callOnSuccess()
	  }
	  else
	  	callOnError && callOnError()
  }
  setTimeout(_init, 1)
}

EasSpeech2Text.prototype.listen = function(callback){
  //--debug code
  // setTimeout(function(){
  //   var content = "";
  //   debugger;
  //   callback(true, content);
  // },1)
  //--end debug code
  
  if(this.ear && callback){
    var final_transcript = "",
        error_content = "",
        status = true;
    this.ear.onstart = function() {
    }
    this.ear.onerror = function(event) {
      error_content = event.error;
      status = false;
    }
    this.ear.onresult = function(event) {
      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        }
      }
    }
    this.ear.onend = function() {
      status && console.log("listen content: ", final_transcript);
      !status && console.log("listen error: ", error_content);
      callback(status, final_transcript, error_content);
    }
    this.ear.start();
  }
}

EasSpeech2Text.prototype.stop = function(){
  this.ear && this.ear.stop()
}