function EasTicketAgent(options){
	this.defaults = {
		text2speech: {},
		speech2text:{},
		soratabi:{},
		watson_conversation:{},
		agentticket:{conversations:{}}
	}
	this.handlers = [
		this._handle_wait_command,
		this._handle_listen,
		this._handle_speak,
		this._handle_think,
		this._handle_process
	];

	this.options = $.extend({}, this.defaults, options)
	this.agentState = {
		current_state: null,
		lastSpeak: "",
		context:{},
		tmp_conversation_context: null
	}
	this.conversations = this.options.agentticket.conversations;
	this.isStoping = true;

	this.mouth = new EasText2Speech(this.options.text2speech);
	this.ear = new EasSpeech2Text(this.options.speech2text);
	this.thinker = new WatsonConversation(this.options.watson_conversation);
	this.soratabi = new SoratabiSite(this.options.soratabi)
}

EasTicketAgent.prototype.init = function(callOnSuccess, callOnError){
	var _this = this
	$.when(
		$.Deferred(function(defer){
			_this.mouth.init(defer.resolve, defer.reject)
		}),
		$.Deferred(function(defer){
			_this.ear.init(defer.resolve, defer.reject)
		}),
		$.Deferred(function(defer){
			_this.thinker.init(defer.resolve, defer.reject)
		}),
		$.Deferred(function(defer){
			_this.soratabi.init(defer.resolve, defer.reject)
		})
	)
	.done(callOnSuccess)
	.fail(callOnError)
}

EasTicketAgent.prototype.startConversation = function(){
	this.isStoping = false;
	this._process();
}

EasTicketAgent.prototype.stopConversation = function(){
	this.isStoping = true;
}

EasTicketAgent.prototype._process = function(command){
	if(!this.isStoping){
		var i;
		command = command || {name: "wait_command"};

		for (i = this.handlers.length - 1; i >= 0 && !this.handlers[i].call(this,command); i--);
		if(i<0){
			console.log("invalid command", command);
			this.stopConversation();
		}
	}
}

EasTicketAgent.prototype._handle_wait_command = function(command){
	if(command.name != "wait_command") return false;

	var _this = this
	this.agentState.current_state = "waiting_command";
	this.ear.listen(function(isSuccess,content){
		if(isSuccess && content && 
			content.indexOf(_this._conversationString("start_command")) >= 0)
			setTimeout(function(){
				_this._process({ //send empty string to star conversation
					name:"think", 
					"text": ""
				})
			},1)
		else
			setTimeout(function(){
				_this._process({name:"wait_command"})
			},1)
	})
	return true;
}
EasTicketAgent.prototype._handle_listen = function(command){
	if(command.name != "listen") return false;
	
	var _this = this
	this.agentState.current_state = "listening";
	this.ear.listen(function(isSuccess, content){
		if(!isSuccess || !content)
			setTimeout(function() {
				_this._process({name:"listen"})
			},1)
		else
			setTimeout(function() {
				_this._process({name:"think", text: content})
			},1)
	})
	return true;
}
EasTicketAgent.prototype._handle_speak = function(command){
	if(command.name != "speak") return false;
	
	var _this = this
	this.agentState.current_state = "speaking";
	this.agentState.lastSpeak = command.text;
	this.mouth.speak(command.text, function(){
		setTimeout(function() {
			_this._process({name:"listen"})
		},1)
	})
	return true;
}
EasTicketAgent.prototype._handle_think = function(command){
	if(command.name != "think") return false;
	
	var _this = this
	this.agentState.current_state = "thinking";
	this.thinker.updateContext(this.agentState.tmp_conversation_context);
	this.thinker.think(command.text, 
		function(resp){//success get mind 
			setTimeout(function(){
				_this._process({name:"process", data: resp})
			},1)
		},
		function(){//failure
			console.log("think failure")
			setTimeout(function(){
				_this._process({name:"think", text: command.text})
			},300)
		})
	return true;
}
EasTicketAgent.prototype._handle_process = function(command){
	if(command.name != "process") return false;
	
	var _this = this,
		context = command.data.context,
		output = command.data.output;

	function _speakContent(output, callSpeakFinish){
		var speak_contents = output.text,
			content = "";
		for (var i = 0; i < speak_contents.length; i++) {
			content+=" "+speak_contents[i]
		}
		if(content.length > 0)
			_this.mouth.speak(content, callSpeakFinish);
		else
			setTimeout(callSpeakFinish, 1);
		return content;
	}

	this.agentState.current_state = "processing";
	this.agentState.tmp_conversation_context = {conversation_id: context.conversation_id};
	switch(context.action){
		case "welcome":
			_speakContent(output, function(){
				_this._process({name:"listen"})
			});
			break;
		case "complex_inputing":
			_speakContent(output, function(){
				_this._process({name:"listen"})
			});
			_this.agentState.tmp_conversation_context = context;
			break;
		case "input_cancel":
			_this._process({name:"listen"})
			break;
		case "complex_inputed":
			_speakContent(output, function(){
				_this._process({name:"listen"})
			});
			_this.soratabi.updateSearchCondition(context);
			break;
		case "cancel":
			_speakContent(output, function(){
				_this._process({name:"listen"})
			});
			_this.agentState.context.cancel_type = context.cancel_type;
			_this.agentState.tmp_conversation_context = context;
			break;
		case "cancel_confirmed":
			_this.soratabi.doCancel(_this.agentState.context);
		case "cancel_unconfirmed":
			_this.agentState.context.cancel_type = null;
			break;
		case "search":
			_speakContent(output, function(){
				_this.soratabi.doSearch();
			})
			break;
		default:
			var content = _speakContent(output, function(){
				_this._process({name:"listen"})
			});
			break;
	}
	return true;
}

EasTicketAgent.prototype._conversationString = function(key){
	return this.conversations[key];
}