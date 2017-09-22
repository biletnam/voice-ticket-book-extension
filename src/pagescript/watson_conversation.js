function WatsonConversation(options){
		this.default = {
			username: "",
			password: "",
			workspace_id: "",
			url:"https://gateway.watsonplatform.net/conversation/api/v1/workspaces",
			version:"2017-05-26",
			context: {}
		};
		this.options = {};
		$.extend(this.options, this.default, options)
		this.options.cred = btoa(this.options.username+":"+this.options.password);
}

WatsonConversation.prototype.init = function(callOnSuccess, callOnError){
	setTimeout(callOnSuccess, 1);
}

WatsonConversation.prototype.think = function(content, callOnSuccess, callOnError){
	var _this = this,
	options = {},
	jsonData = {
		input: {text: content},
		context: this.options.context
	};

	options.method = "POST";
	options.reqType = "application/json",
	options.respType = "application/json";
	options.body = JSON.stringify(jsonData);
	options.uri = this.options.url + 
		"/"+this.options.workspace_id + 
		"/message?version="+this.options.version;
	options.cred = this.options.cred;

	callWatsonAPI(options, 
		function (resp) {
			console.log("think content: ", resp);
			_this.options.context = resp.context;
			callOnSuccess(resp);
		}, 
		callOnError);
}

WatsonConversation.prototype.updateContext = function(context){
	this.options.context = context;
}

WatsonConversation.prototype.getContext = function(){
	return this.options.context;
}