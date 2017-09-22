function EasText2Speech(options){
  this.defaults = {
    lang: "ja-JP"
  }
  this.options = $.extend({}, this.defaults, options)
  this.current_voice = null
}
EasText2Speech.prototype.init = function(callOnSuccess, callOnError){
  var _this = this;
  function _init(){
    var voices = window.speechSynthesis.getVoices();

    for (var i = 0; i < voices.length; i++) {
      if(voices[i].lang==_this.options.lang){
        _this.current_voice = voices[i];
        break;
      }
    }
    _this.current_voice && callOnSuccess && callOnSuccess()
    !_this.current_voice && callOnError && callOnError()
  }

  //when language not init, listen to already init
  window.speechSynthesis.onvoiceschanged = function(){
    _init()
  }

  var voices = window.speechSynthesis.getVoices();
  if(voices.length > 0){
    window.speechSynthesis.onvoiceschanged = null
    setTimeout(_init, 1)
  }
}
EasText2Speech.prototype.speak = function(content, onEndCallBack){
  if(this.current_voice){
    var utterance = new SpeechSynthesisUtterance(content);
    utterance.voice = this.current_voice;
    utterance.lang = this.current_voice.lang;
    if(onEndCallBack)
      utterance.onend = onEndCallBack;
    window.speechSynthesis.speak(utterance);
    console.log("speaking: ", content);
  }
  else{
    onEndCallBack && setTimeout(onEndCallBack, 1);
    console.log("text 2 speak: can not init");
  }
}