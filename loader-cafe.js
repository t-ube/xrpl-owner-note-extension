const injectReplaceScript = document.createElement('script');
injectReplaceScript.src = chrome.runtime.getURL('inject-replace-addresses.js');
(document.head || document.documentElement).appendChild(injectReplaceScript);
