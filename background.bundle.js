(()=>{
  "use strict";
  chrome.runtime.onInstalled.addListener(details=>{
    if(details.reason==="install")chrome.tabs.create({url:chrome.runtime.getURL("welcome.html")});
  });
  chrome.action.onClicked.addListener(()=>{
    chrome.runtime.openOptionsPage();
  });
})();
