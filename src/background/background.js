var lastTabId = 0;
var tab_clicks = {};

function getTabInfo(tabId){
  return tab_clicks[tabId] || {status: false, context:null};
}
function setTabInfo(tabId, info){
  tab_clicks[tabId] = info;
}

function updatePageIcon(tabId, tabUrl){
  if(tabUrl.indexOf(my_properties.activate_domain)>0){
    chrome.pageAction.show(tabId);

    var isActive = getTabInfo(tabId).status;
    iconPath = isActive?"../../imgs/on.png":"../../imgs/off.png";
    chrome.pageAction.setIcon({
      path: iconPath,
      tabId: tabId
    })
  }
  else
    chrome.pageAction.hide(tabId);
}

chrome.tabs.onSelectionChanged.addListener(function(tabId) {
  chrome.tabs.get(tabId,function(tab){
    updatePageIcon(tab.id, tab.url);
  })
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
  if(changeInfo.url || (changeInfo.status && changeInfo.status == "complete"))
    updatePageIcon(tab.id, tab.url);
})

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  var tab = tabs[0];
  updatePageIcon(tab.id, tab.url);;
});

// Called when the user clicks on the page action.
chrome.pageAction.onClicked.addListener(function(tab) {
  var tabInfo = getTabInfo(tab.id);
  tabInfo.status = !tabInfo.status;
  setTabInfo(tab.id, tabInfo);

  updatePageIcon(tab.id, tab.url);
  if(tabInfo.status)
    chrome.tabs.sendMessage(tab.id,{
      action: "startAgent",
      options: my_properties.plugins
    });
  else
    chrome.tabs.sendMessage(tab.id,{action: "stopAgent"});
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if(sender.tab){
    if(request.action && request.action == "storeContext"){
      var tabId = sender.tab.id,
        tabInfo = getTabInfo(tabId);
      tabInfo.context = request.watson_conversation.context;
      setTabInfo(tabId, tabInfo);
    }
  }
})
