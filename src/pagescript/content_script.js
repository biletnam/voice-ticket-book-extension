chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(request){
		switch(request.action){
			case "startAgent":
				startAgent(request.options);
				break;
			case "stopAgent":
				stopAgent();
				break;
			default:
		}
	}
})

var ticketAgent = null
function startAgent(options){
	if(ticketAgent)
		ticketAgent.startConversation();
	else{
		ticketAgent = new EasTicketAgent(options);
		ticketAgent.init(function(){
			ticketAgent.startConversation();
		})
	}
}
function stopAgent(){
	ticketAgent && ticketAgent.stopConversation();
}